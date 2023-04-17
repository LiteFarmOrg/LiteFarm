/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import baseController from '../controllers/baseController.js';

import UserModel from '../models/userModel.js';
import UserFarmModel from '../models/userFarmModel.js';
import PasswordModel from '../models/passwordModel.js';
import EmailTokenModel from '../models/emailTokenModel.js';
import ShiftModel from '../models/shiftModel.js';
import FarmModel from '../models/farmModel.js';
import { transaction, Model } from 'objection';
import bcrypt from 'bcryptjs';
import { createToken } from '../util/jwt.js';
import { emails, sendEmail } from '../templates/sendEmailTemplate.js';
import ShowedSpotlightModel from '../models/showedSpotlightModel.js';

const userController = {
  async addUser(req, res) {
    const {
      email,
      first_name,
      last_name,
      password,
      gender,
      birth_year,
      language_preference,
    } = req.body;
    const userData = {
      email,
      first_name,
      last_name,
      gender,
      birth_year,
      language_preference,
    };

    const trx = await transaction.start(Model.knex());
    try {
      // hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // persist user data
      const userResult = await baseController.post(UserModel, userData, req, { trx });

      const { user_id } = userResult;

      const pwData = {
        user_id,
        password_hash,
      };
      await baseController.post(PasswordModel, pwData, req, { trx });
      await baseController.post(ShowedSpotlightModel, { user_id }, req, { trx });
      await trx.commit();

      // generate token, set to last a week
      const id_token = await createToken('access', { user_id: userResult.user_id });

      // send welcome email
      try {
        const template_path = emails.WELCOME;
        const replacements = {
          first_name: userResult.first_name,
          locale: language_preference,
        };
        const sender = 'system@litefarm.org';
        if (userResult.email && template_path) {
          await sendEmail(template_path, replacements, userResult.email, { sender });
        }
      } catch (e) {
        console.log('Failed to send email: ', e);
      }

      // send token and user data (sans password hash)
      return res.status(201).send({
        id_token,
        user: userResult,
      });
    } catch (error) {
      // handle more exceptions
      await trx.rollback();
      return res.status(400).json({
        error,
      });
    }
  },

  async addInvitedUser(req, res) {
    const {
      last_name,
      email: reqEmail,
      farm_id,
      role_id,
      wage,
      gender,
      birth_year,
      phone_number,
      language,
    } = req.body;
    let { first_name } = req.body;
    const { type: wageType, amount: wageAmount } = wage || {};
    wage.amount = wageAmount ? wageAmount : 0;
    const email = reqEmail && reqEmail.toLowerCase();
    /* Start of input validation */
    const requiredProps = {
      email,
      first_name,
      farm_id,
      role_id,
    };

    if (Object.keys(requiredProps).some((key) => !requiredProps[key])) {
      const errorMessageTitle = 'Missing Properties: ';
      const errorMessage = Object.keys(requiredProps).reduce((missingPropMsg, key) => {
        if (!requiredProps[key]) {
          const concatMsg = [missingPropMsg, key];
          return missingPropMsg === errorMessageTitle
            ? concatMsg.join('') // to avoid prepending first item in list with comma
            : concatMsg.join(', ');
        }
        return missingPropMsg;
      }, errorMessageTitle);
      return res.status(400).send(errorMessage);
    }

    const validEmailRegex = RegExp(/^$|^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/i);
    if (!validEmailRegex.test(email)) {
      return res.status(400).send('Invalid email');
    }

    const validWageRegex = RegExp(/^$|^[0-9]\d*(?:\.\d{1,2})?$/i);
    if (wage && wageAmount && !validWageRegex.test(wageAmount)) {
      return res.status(400).send('Invalid wage amount');
    }

    if (wage && wageType && wageType.toLowerCase() !== 'hourly') {
      return res.status(400).send('Current app version only allows hourly wage');
    }

    console.log('Checking if user is created');
    const isUserAlreadyCreated = await UserModel.getUserByEmail(email);
    const created_user_id = isUserAlreadyCreated ? isUserAlreadyCreated.user_id : null;
    console.log('Checking if user is on farm');
    const userExistOnThisFarm = await UserFarmModel.checkIfUserExistsOnFarm(
      created_user_id,
      farm_id,
    );

    if (userExistOnThisFarm) {
      res.status(400).send({ error: 'User already exists on this farm' });
      return;
    }
    const { farm_name } = await FarmModel.query().where('farm_id', farm_id).first();
    const trx = await transaction.start(Model.knex());
    try {
      let user;
      if (!isUserAlreadyCreated) {
        user = await baseController.post(
          UserModel,
          {
            email,
            first_name,
            last_name,
            status_id: 2,
            gender,
            birth_year,
            phone_number,
          },
          req,
          { trx },
        );
      } else {
        user = isUserAlreadyCreated;
        first_name = user.first_name;
      }
      const { user_id } = user;
      await UserFarmModel.query(trx).insert({
        user_id,
        farm_id,
        status: 'Invited',
        consent_version: '1.0',
        role_id,
        wage,
        has_consent: false,
        step_one: true,
        step_two: true,
        step_three: false,
        step_four: true,
        step_five: true,
      });
      const userFarm = await UserFarmModel.getUserFarmByEmail(email, farm_id, trx);
      await trx.commit();
      res.status(201).send({ ...user, ...userFarm });
      try {
        const { language_preference } = isUserAlreadyCreated ?? { language_preference: language };
        await EmailTokenModel.createTokenSendEmail(
          {
            email,
            first_name,
            last_name,
            gender,
            birth_year,
            language_preference,
          },
          userFarm,
          farm_name,
        );
      } catch (e) {
        console.error('Failed to send email', e);
      }
    } catch (error) {
      await trx.rollback();
      return res.status(400).send(error);
    }
  },

  async addPseudoUser(req, res) {
    const trx = await transaction.start(Model.knex());
    try {
      const { user_id, farm_id, first_name, wage, email } = req.body;
      const { type: wageType, amount: wageAmount } = wage || {};

      /* Start of input validation */
      const requiredProps = {
        user_id,
        farm_id,
        first_name,
        email,
      };

      if (Object.keys(requiredProps).some((key) => !requiredProps[key])) {
        const errorMessageTitle = 'Missing Properties: ';
        const errorMessage = Object.keys(requiredProps).reduce((missingPropMsg, key) => {
          if (!requiredProps[key]) {
            const concatMsg = [missingPropMsg, key];
            return missingPropMsg === errorMessageTitle
              ? concatMsg.join('') // to avoid prepending first item in list with comma
              : concatMsg.join(', ');
          }
          return missingPropMsg;
        }, errorMessageTitle);
        await trx.rollback();
        return res.status(400).send(errorMessage);
      }

      if (email !== `${user_id}@pseudo.com`) {
        await trx.rollback();
        return res.status(400).send('Invalid pseudo user email');
      }

      const validWageRegex = RegExp(/^$|^[0-9]\d*(?:\.\d{1,2})?$/i);
      if (wage && wageAmount && !validWageRegex.test(wageAmount)) {
        await trx.rollback();
        return res.status(400).send('Invalid wage amount');
      }

      if (wage && wageType && wageType.toLowerCase() !== 'hourly') {
        await trx.rollback();
        return res.status(400).send('Current app version only allows hourly wage');
      }
      /* End of input validation */
      const user = await baseController.post(UserModel, req.body, req, { trx });
      await UserFarmModel.query(trx).insert({
        user_id,
        farm_id,
        status: 'Active',
        consent_version: '1.0',
        role_id: 4,
        wage,
        step_one: true,
        step_two: true,
        step_three: true,
        step_four: true,
        step_five: true,
      });
      const userFarm = await UserFarmModel.query(trx)
        .join('users', 'userFarm.user_id', '=', 'users.user_id')
        .join('farm', 'farm.farm_id', '=', 'userFarm.farm_id')
        .join('role', 'userFarm.role_id', '=', 'role.role_id')
        .where({ 'users.email': email, 'userFarm.farm_id': farm_id })
        .first()
        .select('*');
      await trx.commit();
      res.status(201).send({ ...user, ...userFarm });
    } catch (error) {
      // handle more exceptions
      await trx.rollback();
      res.status(400).json({
        error,
      });
    }
  },

  async getUserByID(req, res) {
    try {
      const id = req.params.user_id;

      const data = await UserModel.query()
        .context({ user_id: req.user.user_id })
        .findById(id)
        .select(
          'first_name',
          'last_name',
          'profile_picture',
          'email',
          'phone_number',
          'user_id',
          'gender',
          'birth_year',
        );

      if (!data) {
        res.sendStatus(404);
      } else {
        res.status(200).send(data);
      }
    } catch (error) {
      //handle more exceptions
      console.log(error);
      res.status(400).send(error);
    }
  },

  async deactivateUser(req, res) {
    const user_id = req.params.id;
    const template_path = emails.ACCESS_REVOKE;
    const trx = await transaction.start(Model.knex());
    try {
      const rows = await UserFarmModel.query()
        .select('*')
        .where('userFarm.user_id', user_id)
        .leftJoin('role', 'userFarm.role_id', 'role.role_id')
        .leftJoin('users', 'userFarm.user_id', 'users.user_id')
        .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
      const replacements = {
        first_name: rows[0].first_name,
        farm: rows[0].farm_name,
        locale: rows[0].language_preference,
        farm_name: rows[0].farm_name,
      };
      const sender = 'help@litefarm.org';
      const isUserFarmPatched = await UserFarmModel.query(trx).where('user_id', user_id).patch({
        status: 'Inactive',
      });
      await trx.commit();
      if (isUserFarmPatched) {
        res.sendStatus(200);
        //send email informing user their access revoked (unless user is no account worker - no email)
        try {
          if (rows[0].email) {
            await sendEmail(template_path, replacements, rows[0].email, { sender });
          }
        } catch (e) {
          console.log(e);
        }
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      await trx.rollback();
      res.status(400).json({
        error,
      });
    }
  },

  async updateConsent(req, res) {
    const trx = await transaction.start(Model.knex());
    const user_id = req.params.id;
    try {
      const updated = await UserModel.query(trx).where('user_id', user_id).patch({
        has_consent: true,
      });
      await trx.commit();
      if (!updated) {
        res.status(409).send('Update failed');
      } else {
        res.sendStatus(200);
      }
    } catch (error) {
      await trx.rollback();
      res.status(400).send(error);
    }
  },

  async updateUser(req, res) {
    const trx = await transaction.start(Model.knex());
    try {
      delete req.body.status_id;
      const updated = await baseController.put(UserModel, req.params.user_id, req.body, req, {
        trx,
      });
      await trx.commit();
      if (!updated.length) {
        res.sendStatus(404);
      } else {
        res.status(200).send(updated);
      }
    } catch (error) {
      await trx.rollback();
      res.status(400).json({
        error,
      });
    }
  },

  async acceptInvitationAndPostPassword(req, res) {
    let result;
    try {
      const { password, first_name, last_name, gender, birth_year, language_preference } = req.body;
      const { user_id, farm_id } = req.user;
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      await UserModel.transaction(async (trx) => {
        await PasswordModel.query(trx).insert({ user_id, password_hash });
        await UserModel.query(trx).findById(user_id).patch({
          first_name,
          last_name,
          gender,
          birth_year,
          language_preference,
          status_id: 1,
        });
        await UserFarmModel.query(trx)
          .where({
            user_id,
            farm_id,
          })
          .patch({ status: 'Active' })
          .returning('*')
          .first();
        await ShowedSpotlightModel.query(trx).insert({ user_id });
      });

      result = await UserFarmModel.query()
        .withGraphFetched('[role, farm, user]')
        .findById([user_id, farm_id]);
      result = { ...result.user, ...result, ...result.role, ...result.farm };
      delete result.farm;
      delete result.user;
      delete result.role;
      const id_token = await createToken('access', { user_id });
      return res.status(201).send({
        id_token,
        user: result,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        error,
      });
    }
  },

  async acceptInvitationWithGoogleAccount(req, res) {
    let result;
    const { sub, user_id, farm_id, email } = req.user;
    const { first_name, last_name, gender, birth_year, language_preference } = req.body;
    try {
      await UserModel.transaction(async (trx) => {
        const user = await UserModel.query(trx)
          .context({
            showHidden: true,
            shouldUpdateEmail: true,
          })
          .findById(user_id)
          .patch({ email: user_id })
          .returning('*');
        delete user.profile_picture;
        delete user.user_address;
        user.phone_number = user.phone_number ? user.phone_number : undefined;
        await UserModel.query(trx).insert({
          ...user,
          user_id: sub,
          status_id: 1,
          email,
          first_name,
          last_name,
          gender,
          birth_year,
          language_preference,
        });
        await UserFarmModel.query(trx)
          .where({
            user_id,
            farm_id,
          })
          .patch({ status: 'Active' });
        const userFarms = await UserFarmModel.query(trx).where({ user_id });
        await UserFarmModel.query(trx).insert(
          userFarms.map((userFarm) => ({ ...userFarm, user_id: sub })),
        );
        await ShiftModel.query(trx)
          .context({ user_id: sub })
          .where({ user_id })
          .patch({ user_id: sub });
        await EmailTokenModel.query(trx).where({ user_id }).patch({ user_id: sub });
        await ShowedSpotlightModel.query(trx).insert({ user_id: sub });
        await UserFarmModel.query(trx).where({ user_id }).delete();
        await UserModel.query(trx).findById(user_id).delete();
      });
      result = await UserFarmModel.query()
        .withGraphFetched('[role, farm, user]')
        .findById([sub, farm_id]);
      result = { ...result.user, ...result, ...result.role, ...result.farm };
      delete result.farm;
      delete result.user;
      delete result.role;
      const id_token = await createToken('access', { user_id: sub });
      return res.status(200).send({
        id_token,
        user: result,
      });
    } catch (error) {
      return res.status(400).json({
        error,
      });
    }
  },
};

export default userController;
