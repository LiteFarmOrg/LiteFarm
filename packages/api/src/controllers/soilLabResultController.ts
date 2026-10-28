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
import { Model, transaction, Transaction, UniqueViolationError } from 'objection';
import knex from '../util/knex.js';
import SoilLabResultModel from '../models/soilLabResultModel.js';
import { handleObjectionError } from '../util/errorCodes.js';
import { LiteFarmRequest } from '../types.js';
import {
  SoilLabResultBody,
  SoilLabResultRow,
} from '../middleware/validation/checkSoilLabResult.js';

interface StoredRow {
  id: string;
  row: number;
  farm_id: string;
}

const getLiveBatch = async (submission_id: string, trx?: Transaction): Promise<StoredRow[]> =>
  /* @ts-expect-error known issue with models */
  SoilLabResultModel.query(trx)
    .whereNotDeleted()
    .where({ submission_id })
    .select('id', 'row', 'farm_id');

const isOnOtherFarm = (rows: StoredRow[], farm_id?: string) =>
  rows.some((row) => row.farm_id !== farm_id);

const toBatchResponse = (submission_id: string, rows: StoredRow[]) => ({
  submission_id,
  soil_lab_results: [...rows].sort((a, b) => a.row - b.row).map(({ row, id }) => ({ row, id })),
});

const insertRows = async (
  rows: SoilLabResultRow[],
  user_id: string,
  trx: Transaction,
): Promise<StoredRow[]> =>
  /* @ts-expect-error known issue with models */
  SoilLabResultModel.query(trx)
    .context({ user_id })
    .insert(rows)
    .returning(['id', 'row', 'farm_id']);

const soilLabResultController = {
  getSoilLabResults() {
    return async (req: LiteFarmRequest, res: Response) => {
      try {
        const { farm_id } = req.headers;

        /* @ts-expect-error known issue with models */
        const results = await SoilLabResultModel.query()
          .whereNotDeleted()
          .where({ farm_id })
          .select(
            'id',
            'farm_id',
            'submission_id',
            'row',
            'location_id',
            'match_method',
            'sample_label',
            knex.raw(`to_char(sampled_on, 'YYYY-MM-DD') as sampled_on`),
            'depth_top_cm',
            'depth_bottom_cm',
            'depth_assumed',
            'lat',
            'lng',
            'values',
            'lab_name',
            'source_filename',
            'source_sha256',
          )
          .orderBy([{ column: 'submission_id' }, { column: 'row' }]);

        return res.status(200).json(results);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }
    };
  },

  addSoilLabResults() {
    return async (
      req: LiteFarmRequest<unknown, unknown, unknown, SoilLabResultBody>,
      res: Response,
    ) => {
      const { farm_id } = req.headers;
      const user_id = req.auth!.user_id!;
      const { submission_id } = req.body;

      const respondWithStoredBatch = async (stored: StoredRow[]) => {
        if (isOnOtherFarm(stored, farm_id)) {
          return res.status(409).json({ error: 'submission_id belongs to another farm' });
        }
        return res.status(200).json(toBatchResponse(submission_id, stored));
      };

      try {
        const stored = await getLiveBatch(submission_id);
        if (stored.length) {
          return await respondWithStoredBatch(stored);
        }
      } catch (error) {
        console.error(error);
        return res.status(500).json({ error });
      }

      const trx = await transaction.start(Model.knex());
      try {
        const inserted = await insertRows(res.locals.soilLabResultRows, user_id, trx);
        await trx.commit();
        return res.status(201).json(toBatchResponse(submission_id, inserted));
      } catch (error) {
        if (!(error instanceof UniqueViolationError)) {
          return await handleObjectionError(error as Error, res, trx);
        }
        await trx.rollback();
        try {
          return await respondWithStoredBatch(await getLiveBatch(submission_id));
        } catch (lookupError) {
          console.error(lookupError);
          return res.status(500).json({ error: lookupError });
        }
      }
    };
  },
};

export default soilLabResultController;
