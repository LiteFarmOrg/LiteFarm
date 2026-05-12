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

import { NextFunction, Response } from 'express';
import CropVarietyModel from '../../models/cropVarietyModel.js';
import { HttpError, LiteFarmRequest } from '../../types.js';
import { BaseProperties } from '../../models/types.js';
import {
  getUniqueAnimalAndBatchIds,
  hasInvalidAnimalIds,
  hasInvalidBatchIds,
} from '../../util/finance.js';

interface AnimalExpenseItem {
  id?: number;
  farm_expense_id: number;
  animal_id?: number | null;
  animal_batch_id?: number | null;
  allocated_value: number;
}

interface CropVarietyExpenseItem {
  farm_expense_id: number;
  crop_variety_id: string | null;
  allocated_value: number;
}

interface ExpenseBody extends BaseProperties {
  farm_expense_id?: number;
  farm_id?: string;
  expense_type_id?: string;
  expense_date?: string;
  note?: string;
  value?: number;
  picture?: string;
  farm_expense_animal?: AnimalExpenseItem[];
  farm_expense_crop_variety?: CropVarietyExpenseItem[];
}

const hasInvalidCropVarietyIds = async (cropVarietyIds: string[], farmId: string) => {
  if (!cropVarietyIds.length) {
    return false;
  }
  return !(await CropVarietyModel.cropVarietiesBelongToFarm({ cropVarietyIds, farmId }));
};

export function checkFarmExpenseBody() {
  return async (
    req: LiteFarmRequest<unknown, unknown, unknown, ExpenseBody | ExpenseBody[]>,
    res: Response,
    next: NextFunction,
  ) => {
    const farm_id = req.headers.farm_id!;
    const { body } = req;
    const expenses = Array.isArray(body) ? body : [body];

    try {
      for (const expense of expenses) {
        const { farm_expense_animal, farm_expense_crop_variety } = expense;

        if (farm_expense_animal?.length && farm_expense_crop_variety?.length) {
          return res
            .status(400)
            .send('an expense cannot have both animal and crop variety allocations');
        }

        if (farm_expense_animal?.length) {
          let animalIds: number[] = [];
          let batchIds: number[] = [];

          try {
            ({ animalIds, batchIds } = getUniqueAnimalAndBatchIds(
              farm_expense_animal,
              'farm_expense_animal',
            ));
          } catch (error: unknown) {
            return res.status(400).send((error as Error).message);
          }

          if (animalIds.length + batchIds.length !== farm_expense_animal.length) {
            return res
              .status(400)
              .send('cannot have duplicate animal_id or animal_batch_id in farm_expense_animal');
          }

          if (
            (await hasInvalidAnimalIds(animalIds, farm_id)) ||
            (await hasInvalidBatchIds(batchIds, farm_id))
          ) {
            return res.status(400).send('one or more animals or batches do not belong to the farm');
          }
        }

        if (farm_expense_crop_variety?.length) {
          const cropVarietyIds = farm_expense_crop_variety.map((item) => item.crop_variety_id);

          if (cropVarietyIds.some((id) => !id)) {
            return res
              .status(400)
              .send('crop_variety_id is required for each crop variety allocation');
          }

          const uniqueIds = new Set(cropVarietyIds);
          if (uniqueIds.size !== cropVarietyIds.length) {
            return res
              .status(400)
              .send('cannot have duplicate crop_variety_id in farm_expense_crop_variety');
          }

          if (await hasInvalidCropVarietyIds(cropVarietyIds as string[], farm_id)) {
            return res.status(400).send('one or more crop varieties do not belong to the farm');
          }
        }
      }

      next();
    } catch (error: unknown) {
      console.error(error);

      const err = error as HttpError;
      const status = err.status || err.code || 500;
      return res.status(status).json({
        error: err.message || err,
      });
    }
  };
}
