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

import UserModel from '../models/userModel.js';
import PasswordModel from '../models/passwordModel.js';
import { emails, sendEmail } from '../templates/sendEmailTemplate.js';
import bcrypt from 'bcryptjs';
import { createToken } from '../util/jwt.js';

const passwordResetController = {
  sendResetEmail() {
    return async (req, res) => {
      const { email } = req.body;

      try {
        const userData = await UserModel.query()
          .select('user_id', 'first_name', 'language_preference')
          .where('email', email)
          .first();

        if (!userData) {
          return res.status(404).send('Email is not registered in LiteFarm');
        }

        const pwData = await PasswordModel.query()
          .select('*')
          .where('user_id', userData.user_id)
          .first();
        let { reset_token_version, created_at } = pwData;

        const sendEmailDate = new Date();
        const diffDays = Math.abs(sendEmailDate - created_at) / (1000 * 60 * 60 * 24);
        if (diffDays > 1) {
          reset_token_version = 1;
          created_at = sendEmailDate;
        } else if (reset_token_version === 3) {
          return res.status(400).send('Reached maximum number of available reset tokens');
        } else {
          reset_token_version++;
        }

        const updateData = {
          reset_token_version,
          created_at: created_at.toISOString(),
        };

        await PasswordModel.query().findById(userData.user_id).patch(updateData);

        const tokenPayload = {
          ...userData,
          email,
          reset_token_version: reset_token_version - 1,
          created_at: created_at.getTime(),
        };
        const token = await createToken('passwordReset', tokenPayload);

        const template_path = emails.PASSWORD_RESET;
        const replacements = {
          first_name: userData.first_name,
          locale: userData.language_preference,
        };
        const sender = 'system@litefarm.org';
        sendEmail(template_path, replacements, email, {
          sender,
          buttonLink: `/callback/?reset_token=${token}`,
        });

        return res.status(200).send('Email successfully sent');
      } catch (error) {
        console.log(error);
        return res.status(400).json(error);
      }
    };
  },

  validateToken() {
    return async (req, res) => {
      return res.status(200).json({ isValid: true });
    };
  },

  resetPassword() {
    return async (req, res) => {
      const { password } = req.body;
      const { user_id, email, first_name, language_preference } = req.auth;
      try {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const pwData = {
          password_hash,
          reset_token_version: 0,
          created_at: new Date().toISOString(),
        };
        await PasswordModel.query().findById(user_id).patch(pwData);

        const id_token = await createToken('access', { user_id });

        const template_path = emails.PASSWORD_RESET_CONFIRMATION;
        const replacements = {
          first_name,
          locale: language_preference,
        };
        const sender = 'system@litefarm.org';
        sendEmail(template_path, replacements, email, {
          sender,
          buttonLink: `/?email=${encodeURIComponent(email)}`,
        });
        await UserModel.query().findById(user_id).patch({ status_id: 1 });

        return res.status(200).send({ id_token });
      } catch (error) {
        return res.status(400).json({
          error,
        });
      }
    };
  },
};

export default passwordResetController;
