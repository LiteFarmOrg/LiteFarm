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
const bcrypt = require('bcryptjs');
const { createAccessToken } = require('../util/jwt');

class loginController extends baseController {
  static authenticateUser() {
    return async (req, res) => {
      // uses email to identify which user is attempting to log in, can also use user_id for this
      const { email, password } = req.body;
      try {
        const data = await userModel.query().select('*').where('email', email).first();
        const isMatch = await bcrypt.compare(password, data.password_hash);
        if (!isMatch) return res.sendStatus(401);

        delete data.password_hash;

        const id_token = await createAccessToken({ ...data });
        return res.status(200).send({
          id_token,
          user: data,
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
        const user = await userModel.query().where({ email }).first();
        const isUserNew = !user;
        if (isUserNew) {
          const newUser = { user_id, email, first_name, last_name };
          await userModel.query().insert(newUser);
        }
        const isPasswordNeeded = user && user.user_id && user.user_id !== user_id;
        const id_token = isPasswordNeeded
          ? null
          : await createAccessToken({ user_id, email, first_name, last_name });
        return res.status(201).send({
          id_token,
          user: { user_id: (user && user.user_id) || user_id },
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
        const data = await userModel
          .query()
          .select('*')
          .from('users')
          .where('users.email', email)
          .first();
        if (!data) {
          res.status(200).send({
            user: null,
            exists: false,
            sso: false,
          });
        } else {
          // User signed up with Google SSO
          if (/^\d+$/.test(data.user_id)) {
            res.status(200).send({
              user: data,
              exists: true,
              sso: true,
            });
          } else {
            res.status(200).send({
              user: data,
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
