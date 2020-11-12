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
const { transaction, Model } = require('objection');

class organicCertifierSurveyController extends baseController {
  static getCertifiersByFarmId() {
    return async (req, res) => {
      try {
        const farm_id = req.params.farm_id;
        const result = await organicCertifierSurveyModel.query().whereNotDeleted().where({ farm_id }).first()
          .select('organicCertifierSurvey.certifiers', 'organicCertifierSurvey.interested', 'organicCertifierSurvey.survey_id');
        if (!result) {
          res.sendStatus(404)
        } else {
          res.status(200).send(result);
        }
      } catch (error) {
        //handle more exceptions
        res.status(400).json({
          error,
        });
      }
    }
  }

  static addOrganicCertifierSurvey() {
    return async (req, res) => {
      try {
        const user_id = req.user.sub.split('|')[1];
        const result = await organicCertifierSurveyModel.query().context({ user_id }).insert(req.body).returning('*');
        res.status(201).send(result);
      } catch (error) {
        console.log(error);
        res.status(400).json({
          error,
        });
      }
    };
  }

  static patchCertifiers() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.sub.split('|')[1];
        const certifiers = req.body.certifiers || [];
        const result = await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).patch({ certifiers });
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }

  static patchInterested() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.sub.split('|')[1];
        const interested = req.body.interested;
        const result = await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).patch({ interested });
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }

  static delOrganicCertifierSurvey() {
    return async (req, res) => {
      const survey_id = req.params.survey_id;
      try {
        const user_id = req.user.sub.split('|')[1];
        await organicCertifierSurveyModel.query().context({ user_id }).findById(survey_id).delete();
        res.sendStatus(200);
      } catch (error) {
        res.status(400).json({
          error,
        });
      }
    };
  }


}

module.exports = organicCertifierSurveyController;
