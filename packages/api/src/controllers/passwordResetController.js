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

class passwordResetController extends baseController {
  static sendResetEmail() {
    return async (req, res) => {
      // we will receive the email from the body
      // get from db user_id and first_name from email (user table)
  
      // get entry in db (password table) from user_id
  
      // generate token
      // payload: user_id, reset_token_version, email, first_name
  
      // send the email
      // contains link: {URL}/callback?reset_token={token}
  
      return res.sendStatus(200);
    }
  }

  static validateToken() {
    return async (req, res) => {
      return res.sendStatus(200);
    }
  }

  static resetPassword() {
    return async (req, res) => {
      return res.sendStatus(200);
    }
  }
}

module.exports = passwordResetController;
