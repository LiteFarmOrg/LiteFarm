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

export const sexOptions = [
  { value: 0, label: `I don't know` },
  { value: 1, label: 'Male' },
  { value: 2, label: 'Female' },
];

export const sexDetailsOptions = [
  { id: 0, label: 'Male', count: 0 },
  { id: 1, label: 'Female', count: 0 },
];

export const useOptions = [
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
  { value: { id: 1, key: 'BROUGHT_IN' }, label: 'Brought in' },
  { value: { id: 2, key: 'BORN_AT_FARM' }, label: 'Born at the farm' },
];

export const defaultValues: Partial<AnimalDetailsFormFields> = {
  [DetailsFields.TYPE]: { value: 'default_1', label: 'Cattle' },
  [DetailsFields.BREED]: { value: 'default_2', label: 'Angus' },
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
