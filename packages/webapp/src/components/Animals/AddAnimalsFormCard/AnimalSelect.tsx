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

import { Controller, FieldError, FieldValues, UseControllerProps } from 'react-hook-form';
import { CreatableSelect } from '../../Form/ReactSelect';
import { useTranslation } from 'react-i18next';
import { RefObject } from 'react';
import { GroupBase, SelectInstance, OptionsOrGroups } from 'react-select';
import { Error } from '../../Typography';

export type Option = {
  label: string;
  value: string;
  type?: string;
};

export type AnimalTypeSelectProps = {
  typeOptions: OptionsOrGroups<Option, GroupBase<Option>>;
  onTypeChange?: (Option: Option | null) => void;
  error?: FieldError;
};

export function AnimalTypeSelect<T extends FieldValues>({
  name,
  control,
  typeOptions,
  onTypeChange,
  error,
}: AnimalTypeSelectProps & UseControllerProps<T>) {
  const { t } = useTranslation();
  return (
    <div>
      <Controller
        name={name}
        control={control}
        rules={{ required: { value: true, message: t('common:REQUIRED') } }}
        render={({ field: { onChange, value } }) => (
          <CreatableSelect
            label={t('ADD_ANIMAL.TYPE')}
            placeholder={t('ADD_ANIMAL.TYPE_PLACEHOLDER')}
            options={typeOptions}
            onChange={(option) => {
              onChange(option);
              onTypeChange?.(option);
            }}
            value={value}
          />
        )}
      />
      {error && <Error>{error.message}</Error>}
    </div>
  );
}

export type AnimalBreedSelectProps = {
  breedOptions: Option[];
  isTypeSelected?: boolean;
  breedSelectRef?: RefObject<SelectInstance>;
};

export function AnimalBreedSelect<T extends FieldValues>({
  name,
  control,
  breedOptions,
  isTypeSelected,
  breedSelectRef,
}: AnimalBreedSelectProps & UseControllerProps<T>) {
  const { t } = useTranslation();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <CreatableSelect
          ref={breedSelectRef}
          options={breedOptions}
          label={t('ADD_ANIMAL.BREED')}
          optional
          controlShouldRenderValue={isTypeSelected}
          placeholder={
            isTypeSelected
              ? t('ADD_ANIMAL.BREED_PLACEHOLDER')
              : t('ADD_ANIMAL.BREED_PLACEHOLDER_DISABLED')
          }
          isDisabled={!isTypeSelected}
          onChange={(option) => onChange(option)}
          value={value}
        />
      )}
    />
  );
}
