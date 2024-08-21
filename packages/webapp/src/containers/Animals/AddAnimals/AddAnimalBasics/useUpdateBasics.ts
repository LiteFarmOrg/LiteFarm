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

import { useLayoutEffect } from 'react';
import { useFormContext, UseFieldArrayReplace } from 'react-hook-form';
import { useAnimalOptions } from '../useAnimalOptions';
import {
  AnimalBasicsFormFields,
  AnimalDetailsFormFields,
  BasicsFields,
  DetailsFields,
} from '../types';
import { AddAnimalsFormFields } from '../types';
import { STEPS } from '..';
import { Details as SexDetailsType } from '../../../../components/Form/SexDetails/SexDetailsPopover';

export const useUpdateBasics = (
  fields: AnimalBasicsFormFields[],
  replace: UseFieldArrayReplace<AddAnimalsFormFields, 'basics'>,
) => {
  const { getValues } = useFormContext<AddAnimalsFormFields>();
  const { sexDetailsOptions } = useAnimalOptions('sexDetails');
  const detailsFields = getValues(STEPS.DETAILS);

  useLayoutEffect(() => {
    if (!detailsFields.length) {
      return;
    }

    const updatedSexDetails = (detailsData: AnimalDetailsFormFields[]): SexDetailsType => {
      return sexDetailsOptions.map((option: SexDetailsType[0]) => ({
        ...option,
        count: detailsData.filter(({ sex_id }: { sex_id?: number }) => sex_id === option.id).length,
      }));
    };

    const updatedBatchData = (detailsData: AnimalDetailsFormFields[]) => {
      return {
        [BasicsFields.BATCH_NAME]: detailsData?.[0]?.[DetailsFields.BATCH_NAME],
        [BasicsFields.COUNT]: detailsData?.[0]?.[DetailsFields.COUNT] || 1,
        [BasicsFields.SEX_DETAILS]: detailsData?.[0]?.[DetailsFields.SEX_DETAILS],
      };
    };

    const generatedAnimalData = (detailsData: AnimalDetailsFormFields[]) => {
      return {
        [BasicsFields.COUNT]: detailsData.length,
        [BasicsFields.SEX_DETAILS]: updatedSexDetails(detailsData),
      };
    };

    const removalIndices: number[] = [];

    const updatedBasicsData = fields.map((field: AnimalBasicsFormFields, index: number) => {
      const basicsCardId = field[BasicsFields.FIELD_ARRAY_ID];

      const detailsData = detailsFields.filter(
        (entity) => entity[DetailsFields.BASICS_FIELD_ARRAY_ID] === basicsCardId,
      );

      if (!detailsData.length) {
        removalIndices.push(index);
        return field;
      } else {
        return field[BasicsFields.CREATE_INDIVIDUAL_PROFILES]
          ? {
              ...field,
              ...generatedAnimalData(detailsData),
            }
          : {
              ...field,
              ...updatedBatchData(detailsData),
            };
      }
    });

    const filteredFields = updatedBasicsData.filter(
      (_, index: number) => !removalIndices.includes(index),
    );
    replace(filteredFields);
  }, [!!sexDetailsOptions]);
};
