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

import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import AnimalBatchBasicInfo from '../../../components/Animals/AnimalBatchBasicInfo';
import useImagePickerUpload from '../../../components/ImagePicker/useImagePickerUpload';
import { useAnimalOptions } from '../AddAnimals/useAnimalOptions';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { CommonDetailsProps } from '../AddAnimals/types';
import { AnimalOrBatchKeys } from '../types';

const AnimalReadonlyEdit = ({ isEditing = false }) => {
  const { getOnFileUpload } = useImagePickerUpload();
  const { t } = useTranslation(['translation', 'common', 'animal']);

  const {
    formState: { defaultValues },
  } = useFormContext();

  const isAnimal = defaultValues?.animal_or_batch === AnimalOrBatchKeys.ANIMAL;

  const {
    typeOptions,
    breedOptions,
    sexOptions,
    sexDetailsOptions,
    animalUseOptions,
    tagTypeOptions,
    tagColorOptions,
    organicStatusOptions,
    originOptions,
  } = useAnimalOptions(
    'type',
    'breed',
    'sex',
    'sexDetails',
    'use',
    'tagType',
    'tagColor',
    'organicStatus',
    'origin',
  );

  const currency = useCurrencySymbol();

  const commonProps: CommonDetailsProps = {
    t,
    mode: isEditing ? 'edit' : 'readonly',
  };

  const generalDetailProps = {
    typeOptions,
    breedOptions,
    sexOptions,
    sexDetailsOptions,
    animalUseOptions,
    animalOrBatch: isAnimal ? AnimalOrBatchKeys.ANIMAL : AnimalOrBatchKeys.BATCH,
    ...commonProps,
  };
  const otherDetailsProps = {
    organicStatusOptions,
    getOnFileUpload,
    imageUploadTargetRoute: isAnimal ? 'animal' : 'animalBatch',
    animalOrBatch: isAnimal ? AnimalOrBatchKeys.ANIMAL : AnimalOrBatchKeys.BATCH,
    ...commonProps,
  };
  const originProps = {
    currency: currency,
    originOptions,
    ...commonProps,
  };

  const uniqueDetailsProps = {
    tagTypeOptions,
    tagColorOptions,
    ...commonProps,
  };

  return (
    <>
      <AnimalBatchBasicInfo
        isAnimal={isAnimal}
        generalDetailProps={generalDetailProps}
        uniqueDetailsProps={uniqueDetailsProps}
        otherDetailsProps={otherDetailsProps}
        originProps={originProps}
      />
    </>
  );
};

export default AnimalReadonlyEdit;
