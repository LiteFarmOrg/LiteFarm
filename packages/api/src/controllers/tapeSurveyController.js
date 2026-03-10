/*
 *  Copyright 2026 LiteFarm.org
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

import TapeSurveyModel from '../models/tapeSurveyModel.js';

const tapeSurveyController = {
  createTapeSurvey() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        const { user_id } = req.auth;
        const { survey_response } = req.body;
        const { survey_version, project_id, survey_step } = survey_response;

        await TapeSurveyModel.query()
          .context({ user_id })
          .insert({ farm_id, survey_response, survey_version, project_id, survey_step });

        return res.status(201).send();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  getTapeSurvey() {
    return async (req, res) => {
      try {
        const { farm_id } = req.headers;
        // Find the latest tape survey for the farm
        const result = await TapeSurveyModel.query()
          .where({ farm_id })
          .orderBy('created_at', 'desc')
          .first();
        if (!result) {
          return res.status(404).json({ error: 'Tape survey not found' });
        }
        return res.status(200).send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  updateTapeSurvey() {
    return async (req, res) => {
      try {
        const { submission_id } = req.params;
        if (!submission_id) {
          return res.status(400).json({ error: 'submission_id is required' });
        }
        const { farm_id } = req.headers;
        const { user_id } = req.auth;
        const { survey_response } = req.body;
        const { survey_version, project_id, survey_step } = survey_response;
        await TapeSurveyModel.query().context({ user_id }).insert({
          submission_id,
          farm_id,
          survey_response,
          survey_version,
          project_id,
          survey_step,
        });
        return res.status(204).send();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default tapeSurveyController;
