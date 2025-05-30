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

const UNIT_FIELD_NAME = 'unit';
const PERCENT = 'percent';

const unitOptions = [
  { label: '%', value: 'percent' },
  { label: 'ratio', value: 'ratio' },
  { label: 'mg/kg', value: 'mg/kg' },
  { label: 'ppm', value: 'ppm' },
];

const meta: Meta<typeof CompositionInputs> = {
  title: 'Components/CompositionInput',
  component: CompositionInputs,
  args: {
    inputsInfo: [
      { name: 'n', label: 'Nitrogen (N)' },
      { name: 'p', label: 'Phosphorous (P)' },
      { name: 'k', label: 'Potassium (K)' },
    ],
    unitFieldName: UNIT_FIELD_NAME,
    reactSelectWidth: 76,
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
          [UNIT_FIELD_NAME]: PERCENT,
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
            const { n, p, k, unit } = value;
            return (
              unit === PERCENT &&
              (n || 0) + (p || 0) + (k || 0) > 100 &&
              'The total percentage of N, P, and K must not exceed 100%. Please adjust your values.'
            );
          },
        }}
        render={({ field, fieldState }) => {
          return (
            <CompositionInputs
              {...args}
              inputsInfo={args.inputsInfo}
              mainLabel="Composition"
              unitOptions={unitOptions}
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
    mainLabel: 'Composition',
    unitOptions,
    disabled: true,
    values: {
      n: 20,
      p: 30,
      k: 50,
      [UNIT_FIELD_NAME]: PERCENT,
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

    return (
      <CompositionInputs
        {...args}
        inputsInfo={args.inputsInfo}
        mainLabel="Composition"
        unitOptions={unitOptions}
        onChange={onChange}
        values={values}
      />
    );
  },
};

export const SwitchModes: Story = {
  render: (args) => {
    const [disabled, setDisabled] = useState(false);

    const { control } = useForm({
      mode: 'onBlur',
      defaultValues: {
        composition: {
          [UNIT_FIELD_NAME]: PERCENT,
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
                inputsInfo={args.inputsInfo}
                mainLabel="Composition"
                unitOptions={unitOptions}
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

export const OneUnit: Story = {
  render: (args) => {
    const { watch, setValue } = useForm({ mode: 'onBlur' });
    const values = watch();

    return (
      <CompositionInputs
        {...args}
        values={values}
        onChange={(name, value) => {
          const theOtherField = name === 'moistureContent' ? 'dryMatterContent' : 'moistureContent';
          const inputtedFieldValue = Math.min(100, +(value || 0));
          const theOtherFieldValue = 100 - inputtedFieldValue;

          setValue(name, inputtedFieldValue);
          setValue(theOtherField, theOtherFieldValue);
        }}
        inputsInfo={[
          { name: 'moistureContent', label: 'Moisture content' },
          { name: 'dryMatterContent', label: 'Dry matter content' },
        ]}
        unit="%"
      />
    );
  },
};

export const SixInputs: Story = {
  args: {
    inputsInfo: [
      { name: 'Ca', label: 'Calcium (Ca)' },
      { name: 'Mg', label: 'Magnesium (Mg)' },
      { name: 'S', label: 'Sulfur (S)' },
      { name: 'Cu', label: 'Copper (Cu)' },
      { name: 'Mn', label: 'Manganese (Mn)' },
      { name: 'B', label: 'Boron (B)' },
    ],
    unitOptions,
  },
  render: (args) => {
    const { control } = useForm({
      mode: 'onChange',
      defaultValues: {
        composition: {
          [UNIT_FIELD_NAME]: PERCENT,
          Ca: undefined,
          Mg: undefined,
          S: undefined,
          Cu: undefined,
          Mn: undefined,
          B: undefined,
        },
      },
    });

    return (
      <Controller
        name="composition"
        control={control}
        rules={{
          validate: (value) => {
            const { Ca, Mg, S, Cu, Mn, B, unit } = value;
            const totalPercentage = [Ca, Mg, S, Cu, Mn, B].reduce(
              (acc, current) => acc + (current || 0),
              0,
            );
            return (
              unit === PERCENT &&
              totalPercentage > 100 &&
              'The total percentage must not exceed 100%. Please adjust your values.'
            );
          },
        }}
        render={({ field, fieldState }) => {
          return (
            <CompositionInputs
              {...args}
              inputsInfo={args.inputsInfo}
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
