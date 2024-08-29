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
import { UseFieldArrayReplace, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import groupBy from 'lodash-es/groupBy';
import { STEPS } from '..';
import {
  AddAnimalsFormFields,
  AnimalBasicsFormFields,
  AnimalDetailsFormFields,
  BasicsFields,
  DetailsFields,
} from '../types';
import { AnimalOrBatchKeys } from '../../types';

export const usePopulateDetails = (
  replace: UseFieldArrayReplace<AddAnimalsFormFields, 'details'>,
) => {
  const { getValues } = useFormContext<AddAnimalsFormFields>();

  useEffect(() => {
    const detailsArray: AnimalDetailsFormFields[] = [];

    const createAnimal = (animalOrBatch: AnimalBasicsFormFields, sex_id?: number) => {
      return {
        [DetailsFields.TYPE]: animalOrBatch[BasicsFields.TYPE]!,
        [DetailsFields.BREED]: animalOrBatch[BasicsFields.BREED],
        [DetailsFields.SEX]: sex_id,
        [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.ANIMAL,
        [DetailsFields.BASICS_FIELD_ARRAY_ID]: animalOrBatch[BasicsFields.FIELD_ARRAY_ID],
      };
    };

    const createBatch = (animalOrBatch: AnimalBasicsFormFields) => {
      return {
        [DetailsFields.TYPE]: animalOrBatch[BasicsFields.TYPE]!,
        [DetailsFields.BREED]: animalOrBatch[BasicsFields.BREED],
        [DetailsFields.COUNT]: animalOrBatch[BasicsFields.COUNT],
        [DetailsFields.BATCH_NAME]: animalOrBatch[BasicsFields.BATCH_NAME],
        [DetailsFields.SEX_DETAILS]: animalOrBatch[BasicsFields.SEX_DETAILS],
        [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.BATCH,
        [DetailsFields.BASICS_FIELD_ARRAY_ID]: animalOrBatch[BasicsFields.FIELD_ARRAY_ID],
      };
    };

    getValues(STEPS.BASICS).forEach((animalOrBatch: AnimalBasicsFormFields) => {
      if (animalOrBatch.createIndividualProfiles) {
        const transformedSexDetails = animalOrBatch[BasicsFields.SEX_DETAILS]?.flatMap(
          (sexDetail) =>
            // flatMap to output an array of ids, e.g. [1, 1, 1, 2, 2]
            Array(sexDetail.count).fill(sexDetail.id),
        );
        for (let i = 0; i < animalOrBatch[BasicsFields.COUNT]; i++) {
          detailsArray.push(createAnimal(animalOrBatch, transformedSexDetails?.[i]));
        }
      } else {
        detailsArray.push(createBatch(animalOrBatch));
      }
    });
    const currentDetails = getValues(STEPS.DETAILS);

    if (currentDetails.length === 0) {
      replace(detailsArray);
      return;
    }
    const groupedOrigDetails = groupBy(currentDetails, DetailsFields.BASICS_FIELD_ARRAY_ID);
    const groupedUpdated = groupBy(detailsArray, DetailsFields.BASICS_FIELD_ARRAY_ID);

    // Merge the new data with the original and trim the original data to reflect the updated count
    const updatedDetailsArray = Object.keys(groupedUpdated).flatMap((fieldArrayId) => {
      const updatedData = groupedUpdated[fieldArrayId];
      const origGroup = groupedOrigDetails[fieldArrayId] || [];
      const trimmedOrigGroup = origGroup.slice(0, updatedData.length);

      return updatedData.map((entity, index) => {
        const origData = trimmedOrigGroup[index] || {};
        return {
          ...origData,
          ...entity,
        };
      });
    });
    // Update the details array
    replace(updatedDetailsArray);
  }, []);
};

export default usePopulateDetails;
