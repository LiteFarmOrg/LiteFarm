/*
 *  Copyright 2024 LiteFarm.org
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
import { useEffect } from 'react';
import { STEPS } from '..';
import { AnimalBasicsFormFields, DetailsFields } from '../types';
import { AnimalOrBatchKeys } from '../../types';

export const usePopulateDetails = (getValues: Function, replace: Function) => {
  useEffect(() => {
    const detailsArray: Array<Record<string, any>> = [];

    const createAnimal = (
      animalOrBatch: AnimalBasicsFormFields,
      index: number,
      transformedSexDetails?: number[],
    ) => {
      return {
        [DetailsFields.TYPE]: animalOrBatch.type,
        [DetailsFields.BREED]: animalOrBatch.breed,
        [DetailsFields.SEX]: transformedSexDetails?.[index],
        [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.ANIMAL,
        [DetailsFields.BASICS_FIELD_ARRAY_ID]: animalOrBatch.field_array_id,
      };
    };

    const createBatch = (animalOrBatch: AnimalBasicsFormFields) => {
      return {
        [DetailsFields.TYPE]: animalOrBatch.type,
        [DetailsFields.BREED]: animalOrBatch.breed,
        [DetailsFields.COUNT]: animalOrBatch.count,
        [DetailsFields.BATCH_NAME]: animalOrBatch.batch_name,
        [DetailsFields.SEX_DETAILS]: animalOrBatch.sexDetails,
        [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.BATCH,
        [DetailsFields.BASICS_FIELD_ARRAY_ID]: animalOrBatch.field_array_id,
      };
    };

    getValues(STEPS.BASICS).forEach((animalOrBatch: AnimalBasicsFormFields) => {
      const transformedSexDetails = animalOrBatch.sexDetails?.flatMap((sexDetail) =>
        // flatMap to output an array of ids, e.g. [1, 1, 1, 2, 2]
        Array(sexDetail.count).fill(sexDetail.id),
      );

      if (animalOrBatch.createIndividualProfiles) {
        for (let i = 0; i < animalOrBatch.count; i++) {
          detailsArray.push(createAnimal(animalOrBatch, i, transformedSexDetails));
        }
      } else {
        detailsArray.push(createBatch(animalOrBatch));
      }
    });

    const currentDetails = getValues(STEPS.DETAILS);
    const updatedDetailsArray = detailsArray
      .map((entity, index) => {
        const origData = currentDetails[index];
        return { ...origData, ...entity };
      })
      // Remove extra items if the count has been decreased
      .slice(0, detailsArray.length);

    // Update the details array
    replace(updatedDetailsArray);
  }, [getValues, replace]);
};

export default usePopulateDetails;
