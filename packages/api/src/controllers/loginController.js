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
const { transaction, Model } = require('objection');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECONDS_IN_A_WEEK = 60 * 60 * 24 * 7;

class loginController extends baseController {
  static authenticateUser() {
    return async (req, res) => {
      // uses email to identify which user is attempting to log in, can also use user_id for this
      const { email, password } = req.body;
      try {
        const data = await userModel.query()
          .select('user_id', 'first_name', 'last_name', 'email', 'password_hash')
          .where('email', email)
          .first();
        const isMatch = await bcrypt.compare(password, data.password_hash);
        if (!isMatch) return res.sendStatus(401);

        delete data.password_hash;

        const token = await jwt.sign(
          { ...data },
          process.env.JWT_SECRET,
          { expiresIn: SECONDS_IN_A_WEEK },
        );
        return res.status(200).send({
          token,
          user: data,
        });
      } catch (error) {
        console.log(error);
        return res.status(400).json({
          error,
        });
      }
    };
  }
}

module.exports = loginController;
