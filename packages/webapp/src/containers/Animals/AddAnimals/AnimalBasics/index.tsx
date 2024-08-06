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
import { useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import {
  useGetDefaultAnimalTypesQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetCustomAnimalBreedsQuery,
  useGetAnimalSexesQuery,
} from '../../../../store/api/apiSlice';
import FixedHeaderContainer, {
  ContainerKind,
} from '../../../../components/Animals/FixedHeaderContainer';
import StepperProgressBar from '../../../../components/StepperProgressBar';
import AddAnimalsFormCard from '../../../../components/Animals/AddAnimalsFormCard/AddAnimalsFormCard';
import MoreAnimalsCard from '../../../../components/Animals/AddAnimalsForm/MoreAnimalsCard';
import { FIELD_NAMES } from '../../../../components/Animals/AddAnimalsFormCard/AddAnimalsFormCard';
import { AddAnimalsFormFields, ANIMAL_BASICS_FIELD_ARRAY_NAME } from '../types';
import { generateUniqueAnimalId } from '../../../../util/animal';

export const defaultValues = {
  [FIELD_NAMES.TYPE]: undefined,
  [FIELD_NAMES.BREED]: undefined,
  [FIELD_NAMES.SEX_DETAILS]: [{ id: '', label: '', count: NaN }],
  [FIELD_NAMES.COUNT]: NaN,
  [FIELD_NAMES.CREATE_INDIVIDUAL_PROFILES]: false,
  [FIELD_NAMES.GROUP]: '',
  [FIELD_NAMES.BATCH]: '',
};

const AnimalBasics = () => {
  const { t } = useTranslation(['animal', 'common', 'translation']);
  const {
    control,
    setValue,
    getValues,
    watch,
    formState: { isValid },
  } = useFormContext<AddAnimalsFormFields>();

  const { fields, append, remove } = useFieldArray({
    name: ANIMAL_BASICS_FIELD_ARRAY_NAME,
    control,
  });

  const onAddCard = (): void => {
    append(defaultValues);
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
    })),
    ...customBreeds.map((customBreed) => ({
      label: customBreed.breed,
      value: generateUniqueAnimalId(customBreed),
    })),
  ];

  const sexDetailsOptions = sexes.map(({ id, key }) => ({
    id,
    label: t(`animal:SEX.${key}`),
    count: 0, // TODO: make sure this correct; surprised it is included in the options object
  }));

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const progressBarSteps = [
    t('translation:ADD_ANIMAL.ANIMAL_BASICS'),
    t('translation:ADD_ANIMAL.ANIMAL_DETAILS'),
    t('common:DONE'),
  ];

  return (
    <FixedHeaderContainer
      header={
        <StepperProgressBar
          steps={progressBarSteps}
          activeStep={0}
          isMobile={isMobile}
          isDarkMode
        />
      }
      kind={ContainerKind.OVERFLOW}
    >
      <div className={styles.cardContainer}>
        {fields.map((field, index) => {
          const namePrefix = `${ANIMAL_BASICS_FIELD_ARRAY_NAME}.${index}`;
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
    </FixedHeaderContainer>
  );
};

export default AnimalBasics;
