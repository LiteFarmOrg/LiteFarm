/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (yieldController.js) is part of LiteFarm.
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

const baseController = require('../controllers/baseController');
const userModel = require('../models/userModel');
const passwordModel = require('../models/passwordModel');
const userFarmModel = require('../models/userFarmModel');
const bcrypt = require('bcryptjs');
const { sendEmailTemplate, emails } = require('../templates/sendEmailTemplate');

const { createAccessToken, createResetPasswordToken } = require('../util/jwt');

class loginController extends baseController {
  static authenticateUser() {
    return async (req, res) => {
      // uses email to identify which user is attempting to log in, can also use user_id for this
      const { email, password } = req.body;
      try {
        const userData = await userModel.query().select('*').where('email', email).first();
        const pwData = await passwordModel.query().select('*').where('user_id', userData.user_id).first();
        const isMatch = await bcrypt.compare(password, pwData.password_hash);
        if (!isMatch) return res.sendStatus(401);

        const id_token = await createAccessToken({ user_id: userData.user_id });
        return res.status(200).send({
          id_token,
          user: userData,
        });
      } catch (error) {
        return res.status(400).json({
          error,
        });
      }
    };
  }

  static loginWithGoogle() {
    return async (req, res) => {
      try {
        const { sub: user_id, email, given_name: first_name, family_name: last_name } = req.user;
        // TODO optimize this query
        const ssoUser = await userModel.query().findById(user_id);
        const passwordUser = await userModel.query().where({ email }).first();
        const user = ssoUser || passwordUser;
        const isUserNew = !user;
        if (isUserNew) {
          const newUser = { user_id, email, first_name, last_name };
          await userModel.query().insert(newUser);
        }
        const isPasswordNeeded = !ssoUser && passwordUser;
        const id_token = isPasswordNeeded
          ? ''
          : await createAccessToken({ user_id });
        return res.status(201).send({
          id_token,
          user: {
            user_id: isPasswordNeeded ? passwordUser.user_id : user_id,
            email,
            first_name: passwordUser.first_name,
          },
        });
      } catch (err) {
        return res.status(400).json({
          err,
        });
      }
    };
  }

  static getUserNameByUserEmail() {
    return async (req, res) => {
      const { email } = req.params;
      try {
        const data = await userModel.query()
          .select('user_id', 'first_name', 'email', 'language_preference', 'status').from('users').where('users.email', email).first();
        if (!data) {
          res.status(200).send({
            first_name: null,
            email: null,
            exists: false,
            sso: false,
            invited: false,
            expired: false,
          });
        } else {
          if (data.status === 2) {
            await sendMissingInvitations(data);
            return res.status(200).send({
              first_name: data.first_name,
              email: null,
              exists: false,
              sso: false,
              invited: true,
              expired: false,
            });
          }

          if (data.status === 3) {
            await sendPasswordReset(data);
            return res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: false,
              sso: false,
              language: data.language_preference,
              invited: false,
              expired: true,
            });
          }
          // User signed up with Google SSO
          if (/^\d+$/.test(data.user_id)) {
            res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: true,
              sso: true,
              language: data.language_preference,
              invited: false,
              expired: false,
            });
          } else {
            res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: true,
              sso: false,
              language: data.language_preference,
              invited: false,
              expired: false
            });
          }
        }
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  }
}

async function sendMissingInvitations(user) {
  const environment = process.env.NODE_ENV || 'development';
  const environmentMap = {
    integration: 'https://beta.litefarm.org/',
    production: 'https://app.litefarm.org/',
    development: 'http://localhost:3000/',
  }
  const basePath = environmentMap[environment];
  const userFarms = await userFarmModel.query().select('*')
    .join('farm', 'userFarm.farm_id', 'farm.farm_id')
    .join('users', 'users.user_id', 'userFarm.user_id')
    .where('users.user_id', user.user_id).andWhere('userFarm.status', 'Invited')
  if (userFarms) {
    const template = emails.INVITATION;
    await userFarms.map(({ farm_name, first_name, email, language_preference }) => {
      template.subjectReplacements = farm_name;
      return sendEmailTemplate.sendEmail(template, { farm_name, first_name, link: basePath },
        email, 'help@litefarm.org', true, language_preference);
    })
  }
}

async function sendPasswordReset(data) {
  const created_at = new Date();
  const pw = await passwordModel.query()
    .insert({ user_id: data.user_id, reset_token_version: 1, password_hash: `${Math.random()}`, created_at: created_at.toISOString()}).returning('*');
  const tokenPayload = {
    ...data,
    reset_token_version: 0,
    created_at: pw.created_at.getTime(),
  };
  const token = await createResetPasswordToken(tokenPayload);
  const template_path = emails.PASSWORD_RESET;
  const replacements = {
    first_name: data.first_name,
  };
  const sender = 'system@litefarm.org';
  await sendEmailTemplate.sendEmail(template_path, replacements, data.email, sender,
    `/callback/?reset_token=${token}`, data.language_preference);
}

module.exports = loginController;
