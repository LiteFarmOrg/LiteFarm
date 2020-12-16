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
const bcrypt = require('bcryptjs');
const { createAccessToken } = require('../util/jwt');

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
          .select('user_id', 'first_name', 'email').from('users').where('users.email', email).first();
        if (!data) {
          res.status(200).send({
            first_name: null,
            email: null,
            exists: false,
            sso: false,
          });
        } else {
          // User signed up with Google SSO
          if (/^\d+$/.test(data.user_id)) {
            res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: true,
              sso: true,
            });
          } else {
            res.status(200).send({
              first_name: data.first_name,
              email: data.email,
              exists: true,
              sso: false,
            });
          }
        }
      } catch (error) {
        return res.status(400).json({
          error,
        });
      }
    };
  }
}

module.exports = loginController;
