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

// const baseController = require('./baseController');
// const farmExternalIntegrationsModel = require('../models/farmExternalIntegrationsModel');
// const integratingPartnersModel = require('../models/integratingPartnersModel');

const farmExternalIntegrationController = {
  getAccessToken() {
    return async (req, res) => {
      // get partner_id from req
      try {
        // get access token of the partner
        res.status(200).send('OK');
      } catch (e) {
        // access token expired
        try {
          // get refresh token of the partenr and get a new access token
          res.status(200).send('OK');
        } catch (e) {
          res.status(400).json(e);
        }
      }
    };
  },

  addIntegratingPartner() {
    return async (req, res) => {
      try {
        res.status(200).send('OK');
      } catch (e) {
        res.status(400).json(e);
      }
    };
  },

  deactivateIntegratingPartner() {
    return async (req, res) => {
      try {
        res.status(200).send('OK');
      } catch (e) {
        res.status(400).json(e);
      }
    };
  },
};

module.exports = farmExternalIntegrationController;
