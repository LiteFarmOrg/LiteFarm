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

import { useGetAnimalBatchesQuery, useGetAnimalsQuery } from '../../../store/api/apiSlice';
import { useAnimalOptions } from '../AddAnimals/useAnimalOptions';
import { DetailsFields } from '../AddAnimals/types';
import { generateFormDate } from './utils';
import { ANIMAL_ID_PREFIX, AnimalOrBatchKeys } from '../types';
import { generateUniqueAnimalId } from '../../../util/animal';
import { CustomRouteComponentProps } from '../../../types';

interface RouteParams {
  id: string;
}

interface UseInitialAnimalDataProps extends CustomRouteComponentProps<RouteParams> {}

export const useInitialAnimalData = ({ match }: UseInitialAnimalDataProps) => {
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

  const {
    sexDetailsOptions,
    animalUseOptions,
    typeOptions,
    breedOptions,
    organicStatusOptions,
    tagTypeOptions,
    tagColorOptions,
  } = useAnimalOptions(
    'sexDetails',
    'use',
    'type',
    'breed',
    'organicStatus',
    'tagType',
    'tagColor',
  );

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

  const selectedEntity = selectedAnimal || selectedBatch;
  let typeId: string, breedId: string;

  if ((typeOptions && selectedEntity?.custom_type_id) || selectedEntity?.default_type_id) {
    typeId = selectedEntity?.custom_type_id
      ? generateUniqueAnimalId(ANIMAL_ID_PREFIX.CUSTOM, selectedEntity?.custom_type_id)
      : generateUniqueAnimalId(ANIMAL_ID_PREFIX.DEFAULT, selectedEntity.default_type_id!);
  }

  if ((breedOptions && selectedEntity?.custom_breed_id) || selectedEntity?.default_breed_id) {
    breedId = selectedEntity?.custom_breed_id
      ? generateUniqueAnimalId(ANIMAL_ID_PREFIX.CUSTOM, selectedEntity?.custom_breed_id)
      : generateUniqueAnimalId(ANIMAL_ID_PREFIX.DEFAULT, selectedEntity?.default_breed_id!);
  }

  // Show all uses that have been selected, regardless of whether they are appropriate to the given animal type
  const allAnimalUses =
    animalUseOptions.find(({ default_type_id }) => default_type_id === null)?.uses || [];

  const mapUses = (relationships: { use_id: number }[]) =>
    relationships?.flatMap(
      ({ use_id }) => allAnimalUses?.find(({ value }) => value === use_id) || [],
    );

  const commonFields = {
    [DetailsFields.DATE_OF_BIRTH]: generateFormDate(selectedEntity?.birth_date),
    [DetailsFields.BROUGHT_IN_DATE]: generateFormDate(selectedEntity?.brought_in_date),
    [DetailsFields.OTHER_USE]: otherAnimalUse ? otherAnimalUse.other_use : null,
    [DetailsFields.TYPE]: typeOptions.find(({ value }) => value === typeId),
    [DetailsFields.BREED]: breedOptions.find(({ value }) => value === breedId),
    [DetailsFields.ORGANIC_STATUS]: organicStatusOptions.find(
      ({ value }) => value === selectedEntity?.organic_status,
    ),
  };

  const defaultFormValues = {
    ...(selectedAnimal
      ? {
          ...selectedAnimal,
          ...commonFields,
          [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.ANIMAL,
          [DetailsFields.WEANING_DATE]: generateFormDate(selectedAnimal.weaning_date),
          [DetailsFields.USE]: mapUses(selectedAnimal?.animal_use_relationships ?? []),
          [DetailsFields.TAG_TYPE]: tagTypeOptions.find(
            ({ value }) => value === selectedAnimal?.identifier_type_id,
          ),
          [DetailsFields.TAG_COLOR]: tagColorOptions.find(
            ({ value }) => value === selectedAnimal?.identifier_color_id,
          ),
        }
      : {}),
    ...(selectedBatch
      ? {
          ...selectedBatch,
          ...commonFields,
          [DetailsFields.ANIMAL_OR_BATCH]: AnimalOrBatchKeys.BATCH,
          [DetailsFields.SEX_DETAILS]: transformedSexDetails,
          [DetailsFields.BATCH_NAME]: selectedBatch.name,
          [DetailsFields.USE]: mapUses(selectedBatch?.animal_batch_use_relationships ?? []),
        }
      : {}),
  };

  return { defaultFormValues, selectedAnimal, selectedBatch };
};
