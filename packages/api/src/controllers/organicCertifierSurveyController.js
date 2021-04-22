/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (fertilizerController.js) is part of LiteFarm.
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
const organicCertifierSurveyModel = require('../models/organicCertifierSurveyModel');
const certificationModel = require('../models/certificationModel');
const certifierModel = require('../models/certifierModel');
const certifierCountryModel = require('../models/certifierCountryModel');

const organicCertifierSurveyController = {
  getCertifiersByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await organicCertifierSurveyModel.query().whereNotDeleted().where({ farm_id })
          .first().select('organicCertifierSurvey.certifiers', 'organicCertifierSurvey.interested',
            'organicCertifierSurvey.survey_id', 'organicCertifierSurvey.farm_id');
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    }
  },

  getAllSupportedCertifications() {
    return async (req, res) => {
      try {
        const result = await certificationModel.query().select('*');
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    }
  },

  getAllSupportedCertifiers() {
    return async (req, res) => {
      try {
        const { farm_id, certification_type } = req.params;
        const result = await certifierModel.query().select('*').join('certifier_country', 'certifiers.certifier_id', '=', 'certifier_country.certifier_id').join('farm', 'farm.country_id', '=', 'certifier_country.country_id').where('farm.farm_id', farm_id).andWhere('certifiers.certification_type', certification_type);
        if (!result) {
          res.sendStatus(404);
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    }
  },

  addOrganicCertifierSurvey() {
    return async (req, res) => {
      try {
        const user_id = req.user.user_id;
        const result = await organicCertifierSurveyModel.query().context({ user_id }).insert(req.body).returning('*');
        res.status(201).send(result);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  patchCertifiers() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.user_id;
        const certifiers = req.body.certifiers || [];
        const result = await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).patch({ certifiers });
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  patchRequestedCertifiers() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.user_id;
        const requested_certifier = req.body.data || [];
        const result = await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).patch({ requested_certifier });
        res.sendStatus(200);
      } catch (error) {
        console.log(error)
        res.status(400).json({
          error,
        });
      }
    };
  },

  patchRequestedCertification() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.user_id;
        const requested_certification = req.body.data || [];
        const result = await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).patch({ requested_certification });
        res.sendStatus(200);
      } catch (error) {
        console.log(error)
        res.status(400).json({
          error,
        });
      }
    };
  },

  

  patchInterested() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.user_id;
        const interested = req.body.interested;
        const result = await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).patch({ interested });
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  },

  delOrganicCertifierSurvey() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.user_id;
        await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).delete();
        res.sendStatus(200);
      } catch (error) {
        console.error(error);
        res.status(400).json({
          error,
        });
      }
    };
  },


}

module.exports = organicCertifierSurveyController;
