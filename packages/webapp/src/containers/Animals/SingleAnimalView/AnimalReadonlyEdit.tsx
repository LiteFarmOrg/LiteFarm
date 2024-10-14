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
import AnimalBatchBasicInfo from '../../../components/Animals/AnimalBatchBasicInfo';
import useImagePickerUpload from '../../../components/ImagePicker/useImagePickerUpload';
import { useAnimalOptions } from '../AddAnimals/useAnimalOptions';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { CommonDetailsProps } from '../AddAnimals/types';

// TODO: LF-4383 Animal Details Form Container. This is placeholder
const AnimalReadonlyEdit = ({ isEditing = false }) => {
  const { getOnFileUpload } = useImagePickerUpload();
  const { t } = useTranslation(['translation', 'common', 'animal']);

  const isAnimal = true; // TODO LF-4383 decide how to handle animals vs batches

  const {
    typeOptions,
    breedOptions,
    sexOptions,
    sexDetailsOptions,
    useOptions,
    tagTypeOptions,
    tagColorOptions,
    organicStatusOptions,
    originOptions,
  } = useAnimalOptions(
    'type',
    'breed',
    'default_types',
    'sex',
    'sexDetails',
    'use',
    'tagType',
    'tagColor',
    'organicStatus',
    'origin',
  );

  // TODO: LF-4383 Form container -- useOptions per type used to be narrowed in the container; now since type can be altered this will have to be moved to the component

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
    useOptions,
  };
  const otherDetailsProps = {
    organicStatusOptions,
    getOnFileUpload,
    imageUploadTargetRoute: isAnimal ? 'animal' : 'animalBatch',
  };
  const originProps = {
    currency: currency,
    originOptions,
  };

  const uniqueDetailsProps = {
    tagTypeOptions,
    tagColorOptions,
  };

  return (
    <>
      <AnimalBatchBasicInfo
        isAnimal={isAnimal}
        generalDetailProps={generalDetailProps}
        uniqueDetailsProps={uniqueDetailsProps}
        otherDetailsProps={otherDetailsProps}
        originProps={originProps}
        commonProps={commonProps}
      />
    </>
  );
};

export default AnimalReadonlyEdit;
