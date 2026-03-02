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
        const user_id = req.auth.user_id;
        const { survey_data } = req.body;
        const result = await TapeSurveyModel.query()
          .context({ user_id })
          .insert({ farm_id, user_id, survey_data })
          .returning('*');
        return res.status(201).send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  getTapeSurvey() {
    return async (req, res) => {
      try {
        const { tape_survey_id } = req.params;
        const result = await TapeSurveyModel.query().findById(tape_survey_id);
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
};

export default tapeSurveyController;
