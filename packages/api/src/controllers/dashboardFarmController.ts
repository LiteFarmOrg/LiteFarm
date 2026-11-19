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

import { Response } from 'express';
import UserFarmModel from '../models/userFarmModel.js';
import SurveyResponseModel from '../models/surveyResponseModel.js';
import { LiteFarmRequest } from '../types.js';
import { SurveyResponse } from '../models/types.js';

const dashboardFarmController = {
  getFarmsByUserId() {
    return async (req: LiteFarmRequest, res: Response) => {
      const { user_id } = req.auth!;

      try {
        const farms = await UserFarmModel.getActiveFarmsByUserId(user_id!).orderByRaw(
          'lower(farm.farm_name)',
        );
        const farmProjectRows = await SurveyResponseModel.query()
          .modify('filterTapeSurveys')
          .whereIn(
            'farm_id',
            farms.map((farm) => farm.farm_id),
          )
          .distinct('farm_id', 'project_id')
          .castTo<Pick<SurveyResponse, 'farm_id' | 'project_id'>[]>();

        const projectIdsByFarm: Record<string, string[]> = {};
        farmProjectRows.forEach(({ farm_id, project_id }) => {
          if (!projectIdsByFarm[farm_id]) {
            projectIdsByFarm[farm_id] = [];
          }
          projectIdsByFarm[farm_id].push(project_id);
        });

        const result = farms.map((farm) => {
          const projectIds = projectIdsByFarm[farm.farm_id] ?? [];
          return { ...farm, tape_project_ids: projectIds };
        });

        return res.status(200).json(result);
      } catch (error: unknown) {
        console.error(error);
        const err = error as Error;

        return res.status(500).json({ error: err.message });
      }
    };
  },
};

export default dashboardFarmController;
