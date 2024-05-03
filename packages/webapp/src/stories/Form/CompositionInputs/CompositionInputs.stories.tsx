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

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Meta, StoryObj } from '@storybook/react';
import { componentDecorators } from '../../Pages/config/Decorators';
import CompositionInputs from '../../../components/Form/CompositionInputs';
import Button from '../../../components/Form/Button';
import { ReactComponent as RatioOptionIcon } from '../../../assets/images/ratio-option.svg';

const meta: Meta<typeof CompositionInputs> = {
  title: 'Components/CompositionInput',
  component: CompositionInputs,
  args: {
    unitName: 'compositionUnit',
    unitOptions: [
      { label: '%', value: 'percent' },
      {
        label: <RatioOptionIcon />,
        value: 'ratio',
      },
    ],
    inputsInfo: [
      { name: 'N', label: 'Nitrogen (N)' },
      { name: 'P', label: 'Phosphorous (P)' },
      { name: 'K', label: 'Potassium (K)' },
    ],
  },
  decorators: [...componentDecorators],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const methods = useForm({
      mode: 'onBlur',
      defaultValues: {
        compositionUnit: {
          label: '%',
          value: 'percent',
        },
        N: null,
        P: null,
        K: null,
        compositionSum: 0,
      },
    });

    const { watch, register, setValue, trigger } = methods;

    const n = watch('N');
    const p = watch('P');
    const k = watch('K');
    const compositionUnit = watch('compositionUnit');

    useEffect(() => {
      register('compositionSum', {
        validate: (value: number) => {
          return (
            value <= 100 ||
            'The total percentage of N, P, and K must not exceed 100%. Please adjust your values.'
          );
        },
      });
    }, []);

    useEffect(() => {
      setValue('compositionSum', (n || 0) + (p || 0) + (k || 0));
      trigger('compositionSum');
    }, [n, p, k]);

    useEffect(() => {
      const newValue = compositionUnit.value === 'ratio' ? 0 : (n || 0) + (p || 0) + (k || 0);

      setValue('compositionSum', newValue);
      trigger('compositionSum');
    }, [n, p, k, compositionUnit.value]);

    return (
      <CompositionInputs
        {...args}
        {...methods}
        error={methods.formState.errors?.compositionSum?.message}
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: (args) => {
    const methods = useForm({
      mode: 'onBlur',
      defaultValues: {
        compositionUnit: {
          label: '%',
          value: 'percent',
        },
        N: 20,
        P: 30,
        K: 50,
        compositionSum: 0,
      },
    });
    return <CompositionInputs {...args} {...methods} />;
  },
};

export const WithError: Story = {
  args: {
    error:
      'Error message will appear here. Error message will appear here. Error message will appear here. Error message will appear here.',
  },
  render: (args) => {
    const methods = useForm();
    return <CompositionInputs {...args} {...methods} />;
  },
};

export const SwitchModes: Story = {
  render: (args) => {
    const methods = useForm({
      mode: 'onBlur',
      defaultValues: {
        compositionUnit: {
          label: '%',
          value: 'percent',
        },
      },
    });
    const [disabled, setDisabled] = useState(false);

    return (
      <>
        <Button onClick={() => setDisabled(!disabled)}>{disabled ? 'Edit' : 'Lock'}</Button>
        <CompositionInputs {...args} {...methods} disabled={disabled} />
      </>
    );
  },
};
