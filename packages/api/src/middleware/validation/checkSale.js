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

import SaleModel from '../../models/saleModel.js';
import RevenueTypeModel from '../../models/revenueTypeModel.js';
import AnimalModel from '../../models/animalModel.js';
import AnimalBatchModel from '../../models/animalBatchModel.js';

export function checkSaleBody(operation = 'add') {
  return async (req, res, next) => {
    const { farm_id } = req.headers;
    const { value, revenue_type_id, crop_variety_sale, animal_sale } = req.body;
    let revenueTypeId = revenue_type_id;
    let oldRevenueTypeId;

    try {
      if (operation === 'add' && !revenue_type_id) {
        return res.status(400).send('revenue type id is required');
      }

      if (operation === 'update') {
        const { sale_id } = req.params;
        const oldSale = await SaleModel.query().findById(sale_id);
        oldRevenueTypeId = oldSale.revenue_type_id;

        if (!revenueTypeId) {
          revenueTypeId = oldRevenueTypeId;
        }
      }

      const revenueType = await RevenueTypeModel.query().findById(revenueTypeId);

      if (revenue_type_id && !isValidRevenueType(revenueType, farm_id)) {
        return res.status(400).send('invalid revenue type id');
      }

      const isCropSale = revenueType.entity_type === 'crop';
      const isAnimalSale = revenueType.entity_type === 'animal';
      const isGeneralSale = !isCropSale && !isAnimalSale;

      if (operation === 'add') {
        if (isCropSale && !crop_variety_sale) {
          return res.status(400).send('crop sales are required for crop revenue type');
        }
        if (isAnimalSale && !animal_sale) {
          return res.status(400).send('animal sales are required for animal revenue type');
        }
      } else if (operation === 'update') {
        res.locals.isCropSale = isCropSale;
        res.locals.isAnimalSale = isAnimalSale;

        if (revenueTypeId === oldRevenueTypeId) {
          res.locals.wasCropSale = isCropSale;
          res.locals.wasAnimalSale = isAnimalSale;
        } else {
          const oldRevenueType = await RevenueTypeModel.query().findById(oldRevenueTypeId);
          res.locals.wasCropSale = oldRevenueType.entity_type === 'crop';
          res.locals.wasAnimalSale = oldRevenueType.entity_type === 'animal';
        }
      }

      if ((isCropSale || isAnimalSale) && value) {
        return res.status(400).send('cannot add value to line-item sale');
      }
      if (!isCropSale && crop_variety_sale) {
        return res.status(400).send('must be crop revenue type to add crop variety sale');
      }
      if (isCropSale && crop_variety_sale && !crop_variety_sale.length) {
        return res.status(400).send('crop sales cannot be empty');
      }
      if (!isAnimalSale && animal_sale) {
        return res.status(400).send('must be animal revenue type to add animal sale');
      }
      if (isAnimalSale && animal_sale && !animal_sale.length) {
        return res.status(400).send('animal sales cannot be empty');
      }
      if (isGeneralSale) {
        const isTransitioningToGeneral =
          operation === 'update' && (res.locals.wasCropSale || res.locals.wasAnimalSale);
        if (
          (operation === 'add' || isTransitioningToGeneral) &&
          (value === undefined || value === null)
        ) {
          return res.status(400).send('must have value for non line-item sale');
        }
      }

      if (animal_sale) {
        let animalIds = [];
        let batchIds = [];

        try {
          ({ animalIds, batchIds } = getUniqueAnimalAndBatchIdsFromAnimalSale(animal_sale));
        } catch (e) {
          return res.status(400).send(e.message);
        }

        if (animalIds.length + batchIds.length !== animal_sale.length) {
          return res
            .status(400)
            .send('cannot have duplicate animal_id or animal_batch_id in animal_sale');
        }

        if (
          (await hasInvalidAnimalIds(animalIds, farm_id)) ||
          (await hasInvalidBatchIds(batchIds, farm_id))
        ) {
          return res.status(400).send('one or more animal or batches do not belong to farm');
        }
      }

      next();
    } catch (error) {
      console.log(error);
      return res.status(400).json({
        error,
      });
    }
  };
}

const isValidRevenueType = (revenueType, farmId) => {
  return (
    revenueType &&
    !revenueType.deleted &&
    !revenueType.retired &&
    (!revenueType.farm_id || revenueType.farm_id === farmId)
  );
};

const getUniqueAnimalAndBatchIdsFromAnimalSale = (animalSale) => {
  const animalIdsSet = new Set();
  const batchIdsSet = new Set();

  for (const { animal_id, animal_batch_id } of animalSale) {
    if (!animal_id && !animal_batch_id) {
      throw new Error('animal_sale item must have either animal_id or animal_batch_id');
    }
    if (animal_id && animal_batch_id) {
      throw new Error('cannot have both animal_id and animal_batch_id in same animal_sale item');
    }
    if (animal_id) {
      animalIdsSet.add(animal_id);
    }
    if (animal_batch_id) {
      batchIdsSet.add(animal_batch_id);
    }
  }

  return { animalIds: [...animalIdsSet], batchIds: [...batchIdsSet] };
};

const hasInvalidAnimalIds = async (animalIds, farmId) => {
  if (!animalIds.length) {
    return false;
  }

  return !(await AnimalModel.animalsBelongToFarm(animalIds, farmId));
};

const hasInvalidBatchIds = async (batchIds, farmId) => {
  if (!batchIds.length) {
    return false;
  }

  return !(await AnimalBatchModel.batchesBelongToFarm(batchIds, farmId));
};
