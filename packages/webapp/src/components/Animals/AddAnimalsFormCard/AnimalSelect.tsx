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
import { components, MenuProps } from 'react-select';
import { useTranslation } from 'react-i18next';

export type Option = {
  label: string;
  value: string | number;
};

export type AnimalTypeSelectProps = {
  typeOptions: Option[];
  onTypeChange?: (Option: Option | null) => void;
};

export type AnimalBreedSelectProps = {
  breedOptions: Option[];
  showNoTypeSelectedMessage: boolean;
};

export function AnimalTypeSelect<T extends FieldValues>({
  name,
  control,
  typeOptions,
  onTypeChange,
}: AnimalTypeSelectProps & UseControllerProps<T>) {
  const { t } = useTranslation();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CreatableSelect
          label={t('ADD_ANIMAL.TYPE')}
          placeholder={t('ADD_ANIMAL.TYPE_PLACEHOLDER')}
          options={typeOptions}
          onChange={(option) => {
            field.onChange(option);
            onTypeChange?.(option);
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
  showNoTypeSelectedMessage,
}: AnimalBreedSelectProps & UseControllerProps<T>) {
  const { t } = useTranslation();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <CreatableSelect
          options={breedOptions}
          label={t('ADD_ANIMAL.BREED')}
          placeholder={t('ADD_ANIMAL.BREED_PLACEHOLDER')}
          //@ts-ignore
          showNoTypeSelectedMessage={showNoTypeSelectedMessage}
          styles={
            showNoTypeSelectedMessage
              ? {
                  menu: (baseStyles) => ({
                    ...baseStyles,
                    boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
                    borderRadius: '4px',
                    padding: '10px',
                    color: 'var(--Colors-Neutral-Neutral-600)',
                    fontSize: '16px',
                    lineHeight: '20px',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }),
                }
              : undefined
          }
          components={{ Menu: AnimalBreedMenu }}
          onChange={(option) => field.onChange(option)}
        />
      )}
    />
  );
}

function AnimalBreedMenu(props: MenuProps) {
  const { t } = useTranslation();

  //@ts-ignore
  if (props.selectProps.showNoTypeSelectedMessage)
    return <components.Menu {...props}>{t('ADD_ANIMAL.NO_TYPE_SELECTED_MESSAGE')}</components.Menu>;
  return <components.Menu {...props} />;
}
