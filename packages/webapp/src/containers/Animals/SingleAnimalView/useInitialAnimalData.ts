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

import { RouteComponentProps } from 'react-router-dom';
import { useGetAnimalBatchesQuery, useGetAnimalsQuery } from '../../../store/api/apiSlice';
import { useAnimalOptions } from '../AddAnimals/useAnimalOptions';
import { DetailsFields } from '../AddAnimals/types';
import { generateFormDate } from './utils';
import { AnimalOrBatchKeys } from '../types';
import type { Details } from '../../../components/Form/SexDetails/SexDetailsPopover';

interface RouteParams {
  id: string;
}

interface UseInitialFormValuesProps extends RouteComponentProps<RouteParams> {}

const useInitialFormValues = ({ match }: UseInitialFormValuesProps) => {
  const { selectedAnimal } = useGetAnimalsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      selectedAnimal: data?.find(
        (animal) => animal.internal_identifier === Number(match.params.id),
      ),
    }),
  });

  const { selectedBatch } = useGetAnimalBatchesQuery(undefined, {
    selectFromResult: ({ data }) => ({
      selectedBatch: data?.find((batch) => batch.internal_identifier === Number(match.params.id)),
    }),
  });

  const { sexDetailsOptions }: { sexDetailsOptions: Details } = useAnimalOptions('sexDetails');

  const otherAnimalUse =
    selectedAnimal?.animal_use_relationships?.find(
      (relationship) => relationship?.other_use !== null,
    ) ||
    selectedBatch?.animal_batch_use_relationships?.find(
      (relationship) => relationship?.other_use !== null,
    );

  const transformedSexDetails = sexDetailsOptions.map((option) => {
    const detail = selectedBatch?.sex_detail.find((detail) => detail.sex_id === option.id);
    if (detail) {
      return {
        ...option,
        count: detail.count,
      };
    }
    return option;
  });

  const defaultFormValues = {
    ...(selectedAnimal
      ? {
          ...selectedAnimal,
          [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.ANIMAL,
          [DetailsFields.DATE_OF_BIRTH]: generateFormDate(selectedAnimal.birth_date),
          [DetailsFields.BROUGHT_IN_DATE]: generateFormDate(selectedAnimal.brought_in_date),
          [DetailsFields.WEANING_DATE]: generateFormDate(selectedAnimal.weaning_date),
          [DetailsFields.OTHER_USE]: otherAnimalUse ? otherAnimalUse.other_use : null,
        }
      : {}),
    ...(selectedBatch
      ? {
          ...selectedBatch,
          [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.BATCH,
          [DetailsFields.DATE_OF_BIRTH]: generateFormDate(selectedBatch.birth_date),
          [DetailsFields.BROUGHT_IN_DATE]: generateFormDate(selectedBatch.brought_in_date),
          [DetailsFields.SEX_DETAILS]: transformedSexDetails,
          [DetailsFields.BATCH_NAME]: selectedBatch.name,
          [DetailsFields.OTHER_USE]: otherAnimalUse ? otherAnimalUse.other_use : null,
        }
      : {}),
  };

  return { defaultFormValues, selectedAnimal, selectedBatch };
};

export default useInitialFormValues;
