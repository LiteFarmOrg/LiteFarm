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

import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../../Pages/config/Decorators';
import CompositionInputs from '../../../components/Form/CompositionInputs';
import Button from '../../../components/Form/Button';
import { ReactComponent as RatioOptionIcon } from '../../../assets/images/ratio-option.svg';
import { NPK, UNIT, Unit } from '../../../components/Form/CompositionInputs/NumberInputWithSelect';

const meta: Meta<typeof CompositionInputs> = {
  title: 'Components/CompositionInput',
  component: CompositionInputs,
  args: {
    unitOptions: [
      { label: '%', value: Unit.PERCENT },
      {
        label: <RatioOptionIcon />,
        value: Unit.RATIO,
      },
    ],
    inputsInfo: [
      { name: NPK.N, label: 'Nitrogen (N)' },
      { name: NPK.P, label: 'Phosphorous (P)' },
      { name: NPK.K, label: 'Potassium (K)' },
    ],
  },
  decorators: [...componentDecorators],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const { control } = useForm({
      mode: 'onChange',
      defaultValues: {
        composition: {
          [UNIT]: Unit.PERCENT,
          n: undefined,
          p: undefined,
          k: undefined,
        },
      },
    });

    return (
      <Controller
        name="composition"
        control={control}
        rules={{
          validate: (value) => {
            const { n, p, k, npk_unit } = value;
            return (
              npk_unit === Unit.PERCENT &&
              (n || 0) + (p || 0) + (k || 0) > 100 &&
              'The total percentage of N, P, and K must not exceed 100%. Please adjust your values.'
            );
          },
        }}
        render={({ field, fieldState }) => {
          return (
            <CompositionInputs
              {...args}
              error={fieldState.error?.message}
              values={field.value}
              onChange={(name, value) => {
                field.onChange({ ...field.value, [name]: value });
              }}
            />
          );
        }}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    values: {
      n: 20,
      p: 30,
      k: 50,
      [UNIT]: Unit.PERCENT,
    },
  },
};

export const WithError: Story = {
  args: {
    error:
      'Error message will appear here. Error message will appear here. Error message will appear here. Error message will appear here.',
  },
  render: (args) => {
    const [values, setValues] = useState({});
    const onChange = (name: string, value: number | string | null) => {
      setValues({ ...values, [name]: value });
    };

    return <CompositionInputs {...args} onChange={onChange} values={values} />;
  },
};

export const SwitchModes: Story = {
  render: (args) => {
    const [disabled, setDisabled] = useState(false);

    const { control } = useForm({
      mode: 'onBlur',
      defaultValues: {
        composition: {
          [UNIT]: Unit.PERCENT,
        },
      },
    });

    return (
      <>
        <Button onClick={() => setDisabled(!disabled)}>{disabled ? 'Edit' : 'Lock'}</Button>
        <Controller
          name="composition"
          control={control}
          render={({ field, fieldState }) => {
            return (
              <CompositionInputs
                {...args}
                disabled={disabled}
                error={fieldState.error?.message}
                values={field.value}
                onChange={(name, value) => {
                  field.onChange({ ...field.value, [name]: value });
                }}
              />
            );
          }}
        />
      </>
    );
  },
};
