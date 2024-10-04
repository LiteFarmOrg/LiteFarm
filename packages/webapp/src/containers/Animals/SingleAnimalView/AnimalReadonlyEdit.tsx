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

import useImagePickerUpload from '../../../components/ImagePicker/useImagePickerUpload';
import { useAnimalOptions } from '../AddAnimals/useAnimalOptions';
import { useCurrencySymbol } from '../../hooks/useCurrencySymbol';
import { useTranslation } from 'react-i18next';
import { AnimalOrBatchKeys } from '../types';
import GeneralDetails from '../../../components/Animals/DetailCards/General';
import UniqueDetails from '../../../components/Animals/DetailCards/Unique';
import Origin from '../../../components/Animals/DetailCards/Origin';
import OtherDetails from '../../../components/Animals/DetailCards/Other';

// TODO: LF-4383 Animal Details Form Container. This is placeholder
const AnimalReadonlyEdit = ({ isEditing = false }) => {
  const { getOnFileUpload } = useImagePickerUpload();
  const { t } = useTranslation(['translation', 'common', 'animal']);

  const isAnimal = true; // TODO LF-4383 decide how to handle animals vs batches

  const {
    sexOptions,
    sexDetailsOptions,
    useOptions,
    tagTypeOptions,
    tagColorOptions,
    organicStatusOptions,
    originOptions,
  } = useAnimalOptions(
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

  const commonProps = {
    t,
    animalOrBatch: isAnimal ? AnimalOrBatchKeys.ANIMAL : AnimalOrBatchKeys.BATCH,
    // mode: isEditing ? 'edit' : 'readonly', // Requires merge of LF-4388 with these modes
  };

  const generalDetailProps = {
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

  // TODO: LF-4383 Animal details Form container -- Create a real wrapping component with styles for these cards, passing of readonly and edit modes in child components, and decision about whether Animal + Batch will be handled via prop or via separate components (as in AnimalDetails and BatchDetails). ExpandableItem is not necessary for this component as they will never collapse
  return (
    <>
      <h2>LF-4383 Animal Details Form Container</h2>
      <h3>Readonly mode requires merge of LF-4388</h3>
      {isEditing && <h3>Editing...</h3>}
      <GeneralDetails {...generalDetailProps} {...commonProps} />
      <UniqueDetails {...uniqueDetailsProps} {...commonProps} />
      <OtherDetails {...commonProps} {...otherDetailsProps} />
      <Origin {...originProps} {...commonProps} />
    </>
  );
};

export default AnimalReadonlyEdit;
