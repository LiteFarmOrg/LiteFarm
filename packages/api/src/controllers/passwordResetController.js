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
const emailSender = require('../templates/sendEmailTemplate');
const bcrypt = require('bcryptjs');
const { createResetPasswordToken, createAccessToken } = require('../util/jwt');
const environmentMap = {
  integration: 'https://beta.litefarm.org',
  production: 'https://app.litefarm.org',
  development: 'http://localhost:3000',
}

class passwordResetController extends baseController {
  static sendResetEmail() {
    return async (req, res) => {
      // we will receive the email from the body
      const { email } = req.body;

      try {
        // get from db user_id and first_name from email (user table)
        const userData = await userModel.query().select('user_id', 'first_name').where('email', email).first();

        if (!userData) {
          return res.status(404).send('Email is not registered in LiteFarm');
        }

        // get entry in db (password table) from user_id
        const pwData = await passwordModel.query().select('*').where('user_id', userData.user_id).first();
        let { reset_token_version, created_at } = pwData;

        const tokenPayload = {
          ...userData,
          email,
          reset_token_version,
        };

        const sendEmailDate = new Date();
        const diffDays = Math.abs(sendEmailDate - created_at) / (1000 * 60 * 60 * 24);
        if (diffDays > 1) {
          reset_token_version = 0;
          created_at = sendEmailDate;
        } else if (reset_token_version === 3) {
          return res.status(400).send('Reached maximum number of available reset tokens');
        } else {
          reset_token_version++;
        }

        // generate token
        // payload: user_id, reset_token_version, email, first_name
        const token = await createResetPasswordToken(tokenPayload);
        const updateData = {
          reset_token_version,
          created_at: created_at.toISOString(),
        };

        const pwResult = await passwordModel.query().findById(userData.user_id).update(updateData);

        // send the email
        // contains link: {URL}/callback?reset_token={token}
        // try {
        //   const template_path = '../templates/password_reset_email.html';
        //   const subject = 'Did you forget your LiteFarm password?';
        //
        //   const environment = process.env.NODE_ENV || 'development';
        //   const baseURL = environmentMap[environment];
        //   const resetURL = `${baseURL}/callback?reset_token=${token}`;
        //
        //   const replacements = {
        //     first_name: userData.first_name,
        //   };
        //   const sender = 'system@litefarm.org';
        //   if (email && template_path) {
        //     await emailSender.sendEmail(template_path, subject, replacements, email, sender, true, resetURL);
        //   }
        //   console.log(resetURL);
        //   return res.status(200).send('Email successfully sent');
        // } catch (e) {
        //   console.log('Failed to send email: ', e);
        //   return res.status(400).send('Failed to send email');
        // }
          return res.status(200).send('Email successfully sent');
      } catch (error) {
        console.log(error);
        return res.status(400).json(error);
      }
    }
  }

  static validateToken() {
    return async (req, res) => {
      // passwordResetController.isTokenValid()
      return res.status(200).json({ isValid: true });
    }
  }

  static resetPassword() {
    return async (req, res) => {
      // if(passwordResetController.isTokenValid())
      // reset the password
      // set create_at to today on the password table
      // send email
      // log the user in
      const { password } = req.body;
      const { user_id } = req.user;
      try {
        // hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const pwData = {
          password_hash,
          reset_token_version: 0,
          created_at: new Date().toISOString(),
        };
        const pwResult = await passwordModel.query().findById(user_id).update(pwData);

        // generate token for logging user in
        const id_token = await createAccessToken({ user_id });

        // send reset confirmation email
        // try {
        //   const template_path = '../templates/welcome_email.html';
        //   const subject = 'Welcome to LiteFarm!';
        //   const replacements = {
        //     first_name: userResult.first_name,
        //   };
        //   const sender = 'system@litefarm.org';
        //   console.log('template_path:', template_path);
        //   if (userResult.email && template_path) {
        //     await emailSender.sendEmail(template_path, subject, replacements, userResult.email, sender);
        //   }
        // } catch (e) {
        //   console.log('Failed to send email: ', e);
        // }

        // send token and user data (sans password hash)
        // res.status(200).send("Successfully reset password");
        return res.status(200).send({ id_token });
      } catch (error) {
        // handle more exceptions
        return res.status(400).json({
          error,
        });
      }
    }
  }
}

module.exports = passwordResetController;
