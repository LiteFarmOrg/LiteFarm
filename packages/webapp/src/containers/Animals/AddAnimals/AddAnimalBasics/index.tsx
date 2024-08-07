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

import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import {
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetCustomAnimalBreedsQuery,
  useGetAnimalSexesQuery,
} from '../../../../store/api/apiSlice';
import AddAnimalsFormCard from '../../../../components/Animals/AddAnimalsFormCard/AddAnimalsFormCard';
import MoreAnimalsCard from '../../../../components/Animals/AddAnimalsForm/MoreAnimalsCard';
import { ANIMAL_BASICS_FIELD_NAMES as FIELD_NAMES } from '../types';
import { AddAnimalsFormFields } from '../types';
import { generateUniqueAnimalId } from '../../../../util/animal';
import { ANIMAL_ID_PREFIX } from '../../types';
import { STEPS } from '..';

export const animalBasicsDefaultValues = {
  [FIELD_NAMES.TYPE]: undefined,
  [FIELD_NAMES.BREED]: undefined,
  [FIELD_NAMES.SEX_DETAILS]: [{ id: '', label: '', count: NaN }],
  [FIELD_NAMES.COUNT]: NaN,
  [FIELD_NAMES.CREATE_INDIVIDUAL_PROFILES]: false,
  [FIELD_NAMES.GROUP]: '',
  [FIELD_NAMES.BATCH]: '',
};

const AddAnimalBasics = () => {
  const { t } = useTranslation(['animal', 'common', 'translation']);
  const { control } = useFormContext<AddAnimalsFormFields>();

  const { fields, append, remove } = useFieldArray({
    name: STEPS.BASICS,
    control,
  });

  const onAddCard = (): void => {
    append(animalBasicsDefaultValues);
  };
  const onRemoveCard = (index: number): void => {
    remove(index);
  };

  const { data: defaultTypes = [] } = useGetDefaultAnimalTypesQuery();
  const { data: customTypes = [] } = useGetCustomAnimalTypesQuery();
  const { data: defaultBreeds = [] } = useGetDefaultAnimalBreedsQuery();
  const { data: customBreeds = [] } = useGetCustomAnimalBreedsQuery();
  const { data: sexes = [] } = useGetAnimalSexesQuery();

  const typeOptions = [
    ...defaultTypes.map((defaultType) => ({
      label: t(`animal:TYPE.${defaultType.key}`),
      value: generateUniqueAnimalId(defaultType),
    })),
    ...customTypes.map((customType) => ({
      label: customType.type,
      value: generateUniqueAnimalId(customType),
    })),
  ];

  const breedOptions = [
    ...defaultBreeds.map((defaultBreed) => ({
      label: t(`animal:BREED.${defaultBreed.key}`),
      value: generateUniqueAnimalId(defaultBreed),
      type: generateUniqueAnimalId(ANIMAL_ID_PREFIX.DEFAULT, defaultBreed.default_type_id),
    })),
    ...customBreeds.map((customBreed) => ({
      label: customBreed.breed,
      value: generateUniqueAnimalId(customBreed),
      type: customBreed.default_type_id
        ? generateUniqueAnimalId(ANIMAL_ID_PREFIX.DEFAULT, customBreed.default_type_id)
        : generateUniqueAnimalId(ANIMAL_ID_PREFIX.CUSTOM, customBreed.custom_type_id),
    })),
  ];

  const sexDetailsOptions = sexes.map(({ id, key }) => ({
    id,
    label: t(`animal:SEX.${key}`),
    count: 0,
  }));

  return (
    <div className={styles.cardContainer}>
      {fields.map((field, index) => {
        const namePrefix = `${STEPS.BASICS}.${index}`;

        return (
          <AddAnimalsFormCard
            key={field.id}
            typeOptions={typeOptions}
            breedOptions={breedOptions}
            sexDetailsOptions={sexDetailsOptions}
            showRemoveButton={fields.length > 1}
            onRemoveButtonClick={() => onRemoveCard(index)}
            namePrefix={namePrefix}
          />
        );
      })}
      <MoreAnimalsCard onClick={onAddCard} />
    </div>
  );
};

export default AddAnimalBasics;
