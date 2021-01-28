/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (userFarmController.js) is part of LiteFarm.
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
const userController = require('../controllers/userController');
const userFarmModel = require('../models/userFarmModel');
const userModel = require('../models/userModel');
const userLogModel = require('../models/userLogModel');
const farmModel = require('../models/farmModel');
const passwordModel = require('../models/passwordModel');
const emailTokenModel = require('../models/emailTokenModel');
const roleModel = require('../models/roleModel');
const shiftModel = require('../models/shiftModel');
const userFarmStatusEnum = require('../common/enums/userFarmStatus');
const { transaction, Model } = require('objection');
const axios = require('axios');
const authExtensionConfig = require('../authExtensionConfig');
const knex = Model.knex();
const lodash = require('lodash');
const url = require('url');
const generator = require('generate-password');
const { sendEmailTemplate, emails } = require('../templates/sendEmailTemplate');
const { v4: uuidv4 } = require('uuid');
const { createToken } = require('../util/jwt');


const validStatusChanges = {
  'Active': ['Inactive'],
  'Inactive': ['Invited'],
  'Invited': ['Inactive']
};

class userFarmController extends baseController {
  constructor() {
    super();
  }

  static getUserFarmByUserID() {
    return async (req, res) => {
      try {
        const user_id = req.params.user_id;
        const rows = await userFarmModel.query().context({ user_id: req.user.user_id }).select('*').where('userFarm.user_id', user_id)
          .leftJoin('role', 'userFarm.role_id', 'role.role_id')
          .leftJoin('users', 'userFarm.user_id', 'users.user_id')
          .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
        // TODO find better solution to get owner names
        const userFarmsWithOwnerField = await appendOwners(rows);
        if (!userFarmsWithOwnerField.length) {
          res.sendStatus(404);
        } else {
          res.status(200).send(userFarmsWithOwnerField);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).send(error);
      }
    };
  }

  static getUserFarmsByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const user_id = req.headers.user_id;
        const [userFarm] = await userFarmModel.query().select('role_id').where('farm_id', farm_id).andWhere('user_id', user_id);
        let rows;
        if (userFarm.role_id == 3) {
          rows = await userFarmModel.query().context({ user_id: req.user.user_id }).select(
            'users.first_name',
            'users.last_name',
            'users.profile_picture',
            'users.phone_number',
            'users.email',
            'userFarm.role_id',
            'role.role',
            'userFarm.status',
          ).where('userFarm.farm_id', farm_id)
            .leftJoin('role', 'userFarm.role_id', 'role.role_id')
            .leftJoin('users', 'userFarm.user_id', 'users.user_id');
        } else {
          rows = await userFarmModel.query().context({ user_id: req.user.user_id }).select('*').where('userFarm.farm_id', farm_id)
            .leftJoin('role', 'userFarm.role_id', 'role.role_id')
            .leftJoin('users', 'userFarm.user_id', 'users.user_id')
            .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
        }
        res.status(200).send(rows);
      } catch (error) {
        //handle more exceptions
        res.status(400).send(error);
      }
    };
  }

  static getActiveUserFarmsByFarmID() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const user_id = req.headers.user_id;
        const [userFarm] = await userFarmModel.query().select('role_id').where('farm_id', farm_id).andWhere('user_id', user_id);
        let rows;
        if (userFarm.role_id == 3) {
          rows = await userFarmModel.query().context({ user_id: req.user.user_id }).select(
            'users.first_name',
            'users.last_name',
            'users.profile_picture',
            'users.phone_number',
            'users.email',
            'userFarm.role_id',
            'role.role',
            'userFarm.status',
          ).where('userFarm.farm_id', farm_id).andWhere('userFarm.status', 'Active')
            .leftJoin('role', 'userFarm.role_id', 'role.role_id')
            .leftJoin('users', 'userFarm.user_id', 'users.user_id');
        } else {
          rows = await userFarmModel.query().select('*').where('userFarm.farm_id', farm_id).andWhere('userFarm.status', 'Active')
            .leftJoin('role', 'userFarm.role_id', 'role.role_id')
            .leftJoin('users', 'userFarm.user_id', 'users.user_id')
            .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
        }
        res.status(200).send(rows);
      } catch (error) {
        //handle more exceptions
        res.status(400).send(error);
      }
    };
  }

  static getFarmInfo() {
    return async (req, res) => {
      try {
        const user_id = req.params.user_id;
        const farm_id = req.params.farm_id;
        const rows = await userFarmModel.query().context({ user_id: req.user.user_id }).select('*').where('userFarm.user_id', user_id).andWhere('userFarm.farm_id', farm_id)
          .leftJoin('role', 'userFarm.role_id', 'role.role_id')
          .leftJoin('users', 'userFarm.user_id', 'users.user_id')
          .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id');
        res.status(200).send(rows);
      } catch (error) {
        //handle more exceptions
        res.status(400).send(error);
      }
    };
  }

  static async getAuthExtensionToken() {
    const { token_url, token_headers, token_body } = authExtensionConfig;
    try {
      const res = await axios({
        url: token_url,
        method: 'post',
        headers: token_headers,
        data: token_body,
      });
      if (res.status === 200) {
        if (res.data && res.data.access_token) {
          return res.data.access_token;
        }
      }
    } catch (err) {
      throw 'err: failed to get auth extension token';
    }
  }

  // static getAllRolePermissions() {
  //   return async (req, res) => {
  //     try {
  //       const token = await this.getAuthExtensionToken();
  //       const { authExtensionUri } = authExtensionConfig;
  //       const headers = {
  //         'content-type': 'application/json',
  //         'Authorization': 'Bearer ' + token,
  //       };
  //
  //       const permissions = {};
  //       const permissionsRawData = await axios({
  //         url: `${authExtensionUri}/api/permissions`,
  //         method: 'get',
  //         headers,
  //       });
  //       permissionsRawData.data.permissions.forEach(permission => {
  //         const { _id, name, description } = permission;
  //         permissions[_id] = { permission_id: _id, name, description };
  //       });
  //
  //       const rolesRawData = await axios({
  //         url: `${authExtensionUri}/api/roles`,
  //         method: 'get',
  //         headers,
  //       });
  //       const roles = rolesRawData.data.roles.map(role => {
  //         const { _id, name, description, permissions: rolePermissions } = role;
  //         const roleData = {
  //           role_id: _id,
  //           name,
  //           description,
  //           permissions: [],
  //         };
  //         rolePermissions.forEach(rolePermissionId => {
  //           roleData['permissions'].push(permissions[rolePermissionId]);
  //         });
  //         return roleData;
  //       });
  //       res.status(201).send(roles);
  //     } catch (error) {
  //       res.send(error);
  //     }
  //   };
  // }

  static updateConsent() {
    return async (req, res) => {
      try {
        const { user_id, farm_id } = req.params;
        const { has_consent, consent_version } = req.body;
        await userFarmModel.query().where({ user_id, farm_id }).patch({ has_consent, consent_version });
        res.sendStatus(200);
        try {
          const userFarm = await userFarmModel.query().select('*').where({ 'userFarm.user_id':user_id, 'userFarm.farm_id':farm_id })
            .leftJoin('role', 'userFarm.role_id', 'role.role_id')
            .leftJoin('users', 'userFarm.user_id', 'users.user_id')
            .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id').first();
          let template_path;
          const sender = 'system@litefarm.org';
          const replacements = {
            first_name: userFarm.first_name,
            farm: userFarm.farm_name,
          };
          if (has_consent === false) {
            template_path = emails.WITHHELD_CONSENT;
          } else {
            template_path = emails.CONFIRMATION;
            template_path.subjectReplacements = userFarm.farm_name;
            replacements['role'] = userFarm.role;
          }
          return await sendEmailTemplate.sendEmail(template_path, replacements, userFarm.email, sender, null, userFarm.language_preference);
        } catch (e) {
          console.log(e);
        }
      } catch (error) {
        return res.status(400).send(error);
      }
    };
  }

  static updateOnboardingFlags() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const user_id = req.params.user_id;
      const farm_id = req.params.farm_id;

      const step_one = req.body.step_one;
      const step_one_end = req.body.step_one_end;
      const step_two = req.body.step_two;
      const step_two_end = req.body.step_two_end;
      const step_three = req.body.step_three;
      const step_three_end = req.body.step_three_end;
      const step_four = req.body.step_four;
      const step_four_end = req.body.step_four_end;
      const step_five = req.body.step_five;
      const step_five_end = req.body.step_five_end;

      try {

        const isPatched = await userFarmModel.query(trx).where('user_id', user_id).andWhere('farm_id', farm_id)
          .patch({
            step_one,
            step_one_end,
            step_two,
            step_two_end,
            step_three,
            step_three_end,
            step_four,
            step_four_end,
            step_five,
            step_five_end,
          });

        if (isPatched) {
          await trx.commit();
          res.sendStatus(200);
          return;
        } else {
          await trx.rollback();
          res.sendStatus(404);
          return;
        }
      } catch (error) {
        //handle more exceptions
        await trx.rollback();
        res.status(400).send(error);
      }
    };
  }

  static updateRole() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const user_id = req.params.user_id;
        const { role_id } = req.body;
        const role = await roleModel.query().findById(role_id);
        if (!role) {
          return res.status(400).send('role_id not found');
        } else if (role_id === 4) {
          return res.status(400).send('Can\'t change user\'s role to pseudo user');
        }
        const isPatched = await userFarmModel.query().where({ farm_id, user_id }).patch({ role_id });
        return isPatched ? res.sendStatus(200) : res.status(404).send('User not found');

      } catch (error) {
        console.log(error);
        return res.status(400).send(error);
      }
    };
  }

  static updateStatus() {
    //TODO clean up
    return async (req, res) => {
      const farm_id = req.params.farm_id;
      const user_id = req.params.user_id;
      const { status } = req.body;

      let template_path;
      let subject;

      try {
        const targetUser = await userFarmModel.query().select('users.first_name', 'users.last_name',
          'farm.farm_name', 'userFarm.status', 'users.email', 'users.language_preference')
          .where({ 'userFarm.user_id': user_id, 'userFarm.farm_id': farm_id })
          .leftJoin('users', 'userFarm.user_id', 'users.user_id')
          .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id')
          .first();
        // Email information
        const replacements = {
          first_name: targetUser.first_name,
          farm: targetUser.farm_name,
        };
        const sender = 'system@litefarm.org';

        // check if status transition is allowed
        const currentStatus = targetUser.status;
        if (!validStatusChanges[currentStatus].includes(status)) {
          res.sendStatus(400);
          return;
        }

        // check if access is revoked or restored: update email info based on this
        if (currentStatus === 'Active' || currentStatus === 'Invited') {
          template_path = emails.ACCESS_REVOKE;
          template_path.subjectReplacements = targetUser.farm_name;
        } else if (currentStatus === 'Inactive') {
          template_path = emails.ACCESS_RESTORE;
          template_path.subjectReplacements = targetUser.farm_name;
        }
        const isPatched = await userFarmModel.query().where('farm_id', farm_id).andWhere('user_id', user_id)
          .patch({
            status,
          });
        if (isPatched) {
          res.sendStatus(200);
          try {
            console.log('template_path:', template_path);
            if (targetUser.email && template_path) {
              await sendEmailTemplate.sendEmail(template_path, replacements, targetUser.email, sender, null, targetUser.language_preference);
            }
          } catch (e) {
            console.log('Failed to send email: ', e);
          }
          return;
        } else {
          res.sendStatus(404);
          return;
        }
      } catch (error) {
        // handle more exceptions
        return res.status(400).send(error);
      }
    };
  }

  static acceptInvitation() {
    return async (req, res) => {
      let result;
      const { user_id, farm_id, invitation_id, email } = req.user;
      const { language_preference } = req.body;
      if (!/^\d+$/.test(user_id)) {
        const user = await userModel.query().findById(user_id).patch({ language_preference }).returning('*');
        const passwordRow = await passwordModel.query().findById(user_id);
        if (!passwordRow || user.status_id === 2) {
          return res.status(404).send('User does not exist');
        }
      }
      const userFarm = await userFarmModel.query().where({
        user_id,
        farm_id,
      }).patch({ status: 'Active' }).returning('*');
      result = await userFarmModel.query().withGraphFetched('[role, farm, user]').findById([user_id, farm_id]);
      result = { ...result.user, ...result, ...result.role, ...result.farm };
      delete result.farm;
      delete result.user;
      delete result.role;
      const id_token = await createToken('access', { user_id });
      return res.status(200).send({ id_token, user: result });
    };
  }

  static updateWage() {
    return async (req, res) => {
      const trx = await transaction.start(Model.knex());
      const farm_id = req.params.farm_id;
      const user_id = req.params.user_id;
      const { wage } = req.body;

      try {
        const isPatched = await userFarmModel.query(trx).where('farm_id', farm_id).andWhere('user_id', user_id)
          .patch({
            wage,
          });
        if (isPatched) {
          await trx.commit();
          res.sendStatus(200);
          return;
        } else {
          await trx.rollback();
          res.sendStatus(404);
          return;
        }
      } catch (error) {
        // handle more exceptions
        await trx.rollback();
        res.status(400).send(error);
      }
    };
  }

  static patchPseudoUserEmail() {
    return async (req, res) => {
      const { user_id, farm_id } = req.params;
      const { email } = req.body;
      const roleIdAndWage = {};
      roleIdAndWage.role_id = (!req.body.role_id || req.body.role_id === 4) ? 3 : req.body.role_id;
      if (req.body.wage) {
        roleIdAndWage.wage = req.body.wage;
      }
      let userFarm;
      try {
        await userFarmModel.transaction(async trx => {
          userFarm = await userFarmModel.query(trx).findById([user_id, farm_id]);
          if (userFarm.role_id !== 4) {
            // TODO: move validation
            throw new Error('User already has an account');
          }
          const user = await userModel.query(trx).where({ email }).first();
          const isExistingAccount = !!user;
          const isUserAMemberOfFarm = isExistingAccount ? !!await userFarmModel.query(trx).findById([user.user_id, farm_id]) : false;
          if (isUserAMemberOfFarm) {
            const { user_id: newUserId } = user;
            await userFarmModel.query(trx).findById([user.user_id, farm_id]).patch({
              status: 'Invited',
              step_three: false,
              has_consent: false,
              ...roleIdAndWage,
            });
            await shiftModel.query(trx).context({ user_id: newUserId }).where({ user_id }).patch({ user_id: newUserId });
            await userFarmModel.query(trx).where({ user_id }).delete();
            await userLogModel.query(trx).where({ user_id }).delete();
            await userModel.query(trx).findById(user_id).delete();
          } else if (isExistingAccount) {
            const { user_id: newUserId } = user;
            await userFarmModel.query(trx).insert({
              ...userFarm,
              user_id: newUserId,
              status: 'Invited',
              step_three: false,
              has_consent: false,
              ...roleIdAndWage,
            });
            await shiftModel.query(trx).context({ user_id: newUserId }).where({ user_id }).patch({ user_id: newUserId });
            await userFarmModel.query(trx).where({ user_id }).delete();
            await userLogModel.query(trx).where({ user_id }).delete();
            await userModel.query(trx).findById(user_id).delete();
            return;
          } else {
            await userModel.query(trx).context({ shouldUpdateEmail: true }).findById(user_id).patch({
              email,
              status_id: 2,
            }).returning('*');
            await userFarmModel.query(trx).findById([user_id, farm_id]).patch({
              status: 'Invited',
              step_three: false,
              has_consent: false,
              ...roleIdAndWage,
            });
            return;
          }
        });
        userFarm = await userFarmModel.query()
          .join('users', 'userFarm.user_id', '=', 'users.user_id')
          .join('farm', 'farm.farm_id', '=', 'userFarm.farm_id')
          .join('role', 'userFarm.role_id', '=', 'role.role_id')
          .where({ 'users.email': email, 'userFarm.farm_id': farm_id }).first()
          .select('*');
        res.status(201).send(userFarm);
      } catch (e) {
        res.status(400).send(e);
      }
      try {
        const { farm_name } = userFarm;
        await userController.createTokenSendEmail(userFarm, userFarm, farm_name);
      } catch (e) {
        console.log(e);
      }
    };
  }
}

module.exports = userFarmController;

async function appendOwners(userFarms) {
  const farm_ids = userFarms.map(userFarm => userFarm.farm_id);
  const owners = await userFarmModel.query()
    .whereIn('userFarm.farm_id', farm_ids).where('userFarm.role_id', 1)
    .leftJoin('users', 'userFarm.user_id', 'users.user_id')
    .leftJoin('farm', 'userFarm.farm_id', 'farm.farm_id')
    .orderBy('userFarm.step_one_end', 'asc').select('*');
  const map = {};
  for (const userFarm of userFarms) {
    map[userFarm.farm_id] = { ...userFarm, owner_name: null };
  }
  for (const owner of owners) {
    map[owner.farm_id].owner_name = `${owner.first_name} ${owner.last_name}`;
  }
  return Object.values(map);
}
