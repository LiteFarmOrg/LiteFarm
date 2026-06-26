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
import { LiteFarmRequest } from '../types.js';
import SurveyModel from '../models/surveyModel.js';
import SurveyResponseModel from '../models/surveyResponseModel.js';
import FarmModel from '../models/farmModel.js';

interface AvailableSurveyRow {
  key: string;
  cdn_directory: string;
  country_id: number | null;
  version: string;
}

interface AvailableSurvey {
  key: string;
  cdnDirectory: string;
  version: string;
}

interface SurveyResponseData {
  survey_version: string;
  project_id: string;
  survey_step: string;
  [key: string]: unknown;
}

interface CreateSurveyResponseReqBody {
  survey_key: string;
  survey_response: SurveyResponseData;
}

interface LatestSurveyResponseQuery {
  survey_key?: string;
}

// Objection's query builder does not expose columns of JS-defined models as TS properties, so
// reads are cast to these minimal shapes and writes go through a minimally-typed insert.
interface SurveyRow {
  id: number;
  key: string;
  cdn_directory: string;
}

type InsertableQuery = { insert: (data: Record<string, unknown>) => Promise<unknown> };

/**
 * Collapses the rows returned by SurveyModel.getAvailableSurveysByCountryId to one entry per survey,
 * preferring the country-specific version over the global (null country_id) default.
 */
const resolveAvailableSurveys = (
  rows: AvailableSurveyRow[],
  countryId: number | undefined,
): AvailableSurvey[] => {
  const byKey = new Map<string, AvailableSurveyRow>();
  for (const row of rows) {
    const existing = byKey.get(row.key);
    // A country-specific row always wins over a global row.
    if (!existing || (existing.country_id === null && row.country_id === countryId)) {
      byKey.set(row.key, row);
    }
  }
  return [...byKey.values()].map(({ key, cdn_directory, version }) => ({
    key,
    cdnDirectory: cdn_directory,
    version,
  }));
};

const surveyController = {
  getAvailableSurveys() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;
        // @ts-expect-error: TS doesn't see query() through softDelete HOC; safe at runtime
        const farm = await FarmModel.query().select('country_id').where({ farm_id }).first();
        if (!farm) {
          return res.status(404).json({ error: 'Farm not found' });
        }
        const rows = (await SurveyModel.getAvailableSurveysByCountryId(
          farm.country_id,
        )) as unknown as AvailableSurveyRow[];
        return res.status(200).send(resolveAvailableSurveys(rows, farm.country_id));
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  createSurveyResponse() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, CreateSurveyResponseReqBody>,
      res: Response,
    ) => {
      try {
        const { farm_id } = req.headers;
        const user_id = req.auth?.user_id;
        const { survey_key, survey_response } = req.body;
        const survey = (await SurveyModel.query().findOne({ key: survey_key })) as unknown as
          | SurveyRow
          | undefined;
        if (!survey) {
          return res.status(400).json({ error: 'Unknown survey_key' });
        }
        const { survey_version, project_id, survey_step } = survey_response;

        const insertQuery = SurveyResponseModel.query().context({
          user_id,
        }) as unknown as InsertableQuery;
        await insertQuery.insert({
          farm_id,
          survey_id: survey.id,
          survey_response,
          survey_version,
          project_id,
          survey_step,
        });

        return res.status(201).send();
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  getLatestSurveyResponse() {
    return async (req: LiteFarmRequest<LatestSurveyResponseQuery>, res: Response) => {
      try {
        const { farm_id } = req.headers;
        const { survey_key } = req.query;
        const survey = (await SurveyModel.query().findOne({ key: survey_key })) as unknown as
          | SurveyRow
          | undefined;
        if (!survey) {
          return res.status(400).json({ error: 'Unknown survey_key' });
        }
        // Find the latest survey response of this kind for the farm.
        const result = await SurveyResponseModel.query()
          .where({ farm_id, survey_id: survey.id })
          .orderBy('created_at', 'desc')
          .first();
        if (!result) {
          return res.status(404).json({ error: 'Survey response not found' });
        }
        return res.status(200).send(result);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },
};

export default surveyController;
