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

import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import { CreatableSelect } from '../../Form/ReactSelect';

export type Option = {
  label: string;
  value: string | number;
};

export type AnimalTypeSelectProps = {
  typeOptions: Option[];
  onTypeChange?: (option: Option) => void;
};

export type AnimalBreedSelectProps = {
  breedOptions: Option[];
};

export function AnimalTypeSelect<T extends FieldValues>({
  name,
  control,
  typeOptions,
  onTypeChange,
}: AnimalTypeSelectProps & UseControllerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CreatableSelect
          label="Type"
          options={typeOptions}
          onChange={(option) => {
            if (option) {
              field.onChange(option);
              onTypeChange?.(option);
            }
          }}
        />
      )}
    />
  );
}

export function AnimalBreedSelect<T extends FieldValues>({
  name,
  control,
  breedOptions,
}: AnimalBreedSelectProps & UseControllerProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CreatableSelect
          label="Breed"
          options={breedOptions}
          onChange={(option) => {
            if (option) {
              field.onChange(option);
            }
          }}
        />
      )}
    />
  );
}
