const baseController = require('../controllers/baseController');
const { transaction, Model } = require('objection');
const axios = require('axios');
const Knex = require('knex');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../knexfile')[environment];
const knex = Knex(config);

const auth0Config = require('../auth0Config');
const emailTokenModel = require('../models/emailTokenModel');
const userModel = require('../models/userModel');
const userFarmModel = require('../models/userFarmModel');

class signUpController extends baseController {
  static isEmailTokenValid() {
    return async (req, res) => {
      try {
        const { token, farm_id, user_id } = req.params;
        const rows = await emailTokenModel.query()
          .select('*')
          .where('token', token)
          .andWhere('farm_id', farm_id).andWhere('user_id', user_id);
        if (rows && rows.length === 0) {
          res.status(401).send('Invalid email, farm_id, or user_id');
        } else {
          if(rows[0].is_used){
            res.status(202).send('Token Used');
          }else{
            res.status(200).send('Valid email token');
          }
        }
      } catch (error) {
        console.log(error);
        throw error;
      }
    }
  }

  static async getAuth0Token() {
    try {
      const res = await axios({
        url: auth0Config.token_url,
        method: 'post',
        headers: auth0Config.token_headers,
        data: auth0Config.token_body,
      });
      if (res.status === 200) {
        if (res.data && res.data.access_token) {
          return res.data.access_token;
        }
      }
    } catch (err) {
      throw 'failed to get auth0 token';
    }
  }

  static async updateAuth0User(id, user) {
    try {
      const token = await this.getAuth0Token();
      const headers = {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + token,
      };
      const result = await axios({
        url: auth0Config.user_url + `/${id}`,
        method: 'patch',
        headers,
        data: user,
      });
      if (result.status >= 200) {
        return result;
      }
    }
    catch (err) {
      console.log(err);
      throw err;
    }
  }

  static signUpViaInvitation() {
    return async (req, res) => {
      try {
        const { id } = req.params;
        const {
          token,
          farm_id,
          first_name,
          last_name,
          password,
        } = req.body;

        // 1. Verify email token is associated with the given user_id and farm_id
        // 2. Verify email token is valid, i.e. not used/not expired
        const rows = await emailTokenModel.query()
          .select('*')
          .where('user_id', id)
          .andWhere('farm_id', farm_id)
          .andWhere('token', token)
          .andWhere('is_used', false);
        if (rows && rows.length === 0) {
          res.status(401).send('Invalid email token');
        }

        // Update user's info in Auth0
        const auth0UserId = `auth0|${id}`;
        const updatedAuth0User = {
          user_metadata: {
            first_name,
            last_name,
          },
          password,
          connection: 'Username-Password-Authentication',
          app_metadata: { signed_up: true },
        };
        await this.updateAuth0User(auth0UserId, updatedAuth0User);

        const trx = await transaction.start(Model.knex());
        // Update user's info in users table
        const updatedUserInfo = { first_name, last_name };
        await userModel.query(trx).where('user_id', id).patch(updatedUserInfo);
        // Update user's status in userFarm table
        await userFarmModel.query(trx)
          .where('user_id', id)
          .andWhere('farm_id', farm_id)
          .patch({
            status: 'Active',
          });
        // Update token status to invalid
        await emailTokenModel.query(trx)
          .where('user_id', id)
          .andWhere('farm_id', farm_id)
          .andWhere('token', token)
          .patch({
            is_used: true,
          });
        await trx.commit();
        res.status(200).send('Signed up successfully');
      } catch (error) {
        res.status(500).send('Failed to sign up');
      }
    }
  }
}

module.exports = signUpController;
