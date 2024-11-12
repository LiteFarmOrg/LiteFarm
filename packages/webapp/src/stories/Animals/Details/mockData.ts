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

import { ChangeEvent, DragEvent } from 'react';
import {
  DetailsFields,
  AnimalDetailsFormFields,
  ReactSelectOption,
} from '../../../containers/Animals/AddAnimals/types';
import { FileEvent } from '../../../components/ImagePicker';
import { GetOnFileUpload } from '../../../components/ImagePicker/useImagePickerUpload';
import { OrganicStatus } from '../../../types';

export const typeOptions = [
  {
    label: 'Cattle',
    value: 'default_1',
  },
  {
    label: 'Pigs',
    value: 'default_2',
  },
  {
    label: 'Chicken',
    value: 'default_3',
  },
];

export const breedOptions = [
  {
    label: 'Angus',
    value: 'default_1',
    type: 'default_1',
  },
  {
    label: 'Yorkshire Large White',
    value: 'default_4',
    type: 'default_2',
  },
  {
    label: 'Landrace',
    value: 'default_5',
    type: 'default_2',
  },
  {
    label: 'Cornish Cross',
    value: 'default_7',
    type: 'default_3',
  },
  {
    label: 'Ross 308',
    value: 'default_8',
    type: 'default_3',
  },
];

export const sexOptions = [
  { value: 0, label: `I don't know` },
  { value: 1, label: 'Male' },
  { value: 2, label: 'Female' },
];

export const sexDetailsOptions = [
  { id: 0, label: 'Male', count: 1 },
  { id: 1, label: 'Female', count: 2 },
];

export const animalUseOptions = [
  { label: 'A', value: 0 },
  { label: 'B', value: 1 },
  { label: 'Other', value: 2, key: 'OTHER' },
];

export const tagTypeOptions = [
  { value: 1, label: 'Ear tags' },
  { value: 2, label: 'Leg bands' },
  { value: 3, label: 'Other', key: 'OTHER' },
];

export const tagColorOptions = [
  { value: 1, label: 'Yellow' },
  { value: 2, label: 'White' },
  { value: 3, label: 'Orange' },
  { value: 4, label: 'Green' },
  { value: 5, label: 'Blue' },
  { value: 6, label: 'Red' },
];

export const organicStatusOptions: ReactSelectOption<OrganicStatus>[] = [
  { value: OrganicStatus.NON_ORGANIC, label: 'Non-Organic' },
  { value: OrganicStatus.ORGANIC, label: 'Organic' },
  { value: OrganicStatus.TRANSITIONAL, label: 'Transitioning' },
];

export const originOptions = [
  { value: 1, label: 'Brought in', key: 'BROUGHT_IN' },
  { value: 2, label: 'Born at the farm', key: 'BORN_AT_FARM' },
];

export const addDefaults: Partial<AnimalDetailsFormFields> = {
  [DetailsFields.TYPE]: { value: 'default_1', label: 'Cattle' },
  [DetailsFields.BREED]: {
    label: 'Angus',
    value: 'default_1',
    type: 'default_1',
  },
  [DetailsFields.SEX]: 2,
  [DetailsFields.COUNT]: 3,
};

export const defaultValues: Partial<AnimalDetailsFormFields> = {
  ...addDefaults,
  [DetailsFields.USE]: [{ value: 2, label: 'Other', key: 'OTHER' }],
  [DetailsFields.ID]: 'ID12',
  [DetailsFields.ORIGIN]: 1,
  [DetailsFields.BROUGHT_IN_DATE]: '2024-10-01',
  [DetailsFields.TAG_TYPE]: { value: 3, label: 'Other', key: 'OTHER' },
  [DetailsFields.TAG_TYPE_INFO]: 'Microchip',
  [DetailsFields.ANIMAL_IMAGE]: '/src/assets/images/certification/Farmland.svg',
};

export const getOnFileUpload: GetOnFileUpload =
  (targetRoute, onSelectImage) => async (e, setPreviewUrl, setFileSizeExceeded, event) => {
    const file =
      event === FileEvent.CHANGE
        ? (e as ChangeEvent<HTMLInputElement>)?.target?.files?.[0]
        : (e as DragEvent).dataTransfer?.files?.[0];

    if (file) {
      if (file.size > 5e6) {
        setFileSizeExceeded(true);
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onSelectImage(url);
      console.log(targetRoute);
    }
  };
