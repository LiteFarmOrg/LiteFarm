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

import type { Meta, StoryObj } from '@storybook/react';
import NumberInputRHF from '../../../components/Form/NumberInput';
import { componentDecorators } from '../../Pages/config/Decorators';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { FormProvider, useForm } from 'react-hook-form';

const meta: Meta<typeof NumberInputRHF> = {
  title: 'Components/NumberInput',
  component: NumberInputRHF,
  args: {
    name: 'test',
  },
  decorators: [
    ...componentDecorators,
    (Story) => {
      const methods = useForm({ mode: 'onChange' });
      return (
        <FormProvider {...methods}>
          <Story />
        </FormProvider>
      );
    },
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ step }) => {
    await step(
      'Enter invalid characters',
      test('aD@j)+-ec&', { expectValue: '', expectValueOnBlur: '', expectValueOnReFocus: '' }),
    );
    await step(
      'Enter invalid and valid characters',
      test('1a4D@^,8).+-ec3.&4', {
        expectValue: '148.34',
        expectValueOnBlur: '148.34',
        expectValueOnReFocus: '148.34',
      }),
    );
    await step(
      'Enter negative number',
      test('-22', { expectValue: '22', expectValueOnBlur: '22', expectValueOnReFocus: '22' }),
    );

    // test handling of multiple thousands seperators
    await step(
      'Enter number above 1,000,000',
      test('1556398', {
        expectValue: '1556398',
        expectValueOnBlur: '1,556,398',
        expectValueOnReFocus: '1556398',
      }),
    );

    await step(
      'Enter number with leading zeroes',
      test('00078', { expectValue: '00078', expectValueOnBlur: '78', expectValueOnReFocus: '78' }),
    );
  },
};

export const WithLocale: Story = {
  args: { locale: 'pt', info: 'Invalid locale defaults to browsers locale' },
  render: (args) => {
    return <NumberInputRHF {...args} label={`Locale: ${args.locale}`} />;
  },
  argTypes: { locale: { description: 'Overrides locale used internally with i18n' } },
  play: async ({ step }) => {
    // should be able to enter numbers in specified locale
    await step(
      'Enter number with locale decimal separator',
      test('7498,431', {
        expectValue: '7498,431',
        expectValueOnBlur: '7.498,431',
        expectValueOnReFocus: '7498,431',
      }),
    );

    // should be able to enter english numbers
    // should format to localized number on blur
    await step(
      'Enter number with decimal period',
      test('7498.431', {
        expectValue: '7498.431',
        expectValueOnBlur: '7.498,431',
        expectValueOnReFocus: '7498,431',
      }),
    );
  },
};

export const WithoutGrouping: Story = {
  args: { useGrouping: false },
  play: async ({ step, canvasElement }) => {
    //should not insert thousands separator
    await step(
      'Enter whole number above 1000',
      test('122492', {
        expectValue: '122492',
        expectValueOnBlur: '122492',
        expectValueOnReFocus: '122492',
      }),
    );
    await step(
      'Enter decimal number above 1000',
      test('7642.1', {
        expectValue: '7642.1',
        expectValueOnBlur: '7642.1',
        expectValueOnReFocus: '7642.1',
      }),
    );
  },
};

export const WithoutDecimal: Story = {
  args: { allowDecimal: false },
  play: async ({ step, canvasElement }) => {
    await step(
      'Enter number with decimal',
      test('9.1', { expectValue: '91', expectValueOnBlur: '91', expectValueOnReFocus: '91' }),
    );
  },
};
export const WithoutDecimalAndWithFractionalStep: Story = {
  args: { allowDecimal: false, step: 1.7 },
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);
    const { incrementButton, decrementButton } = getStepperButtons(canvasElement);

    // should round step value down to nearest whole number
    await userEvent.click(incrementButton);
    expect(input).toHaveValue('1');
    await userEvent.click(decrementButton);
    expect(input).toHaveValue('0');
    expect(decrementButton).toBeDisabled();
    userEvent.clear(input);
  },
};

export const WithDecimalDigits: Story = {
  args: { decimalDigits: 2 },
  play: async ({ step }) => {
    await step(
      'Enter number with more than 2 decimal places',
      test('8.5751', {
        expectValue: '8.5751',
        expectValueOnBlur: '8.58',
        expectValueOnReFocus: '8.58',
      }),
    );

    await step(
      'Enter number with less than 2 decimal places',
      test('8', {
        expectValue: '8',
        expectValueOnBlur: '8.00',
        expectValueOnReFocus: '8.00',
      }),
    );
  },
};

export const WithInitialValue: Story = {
  args: { value: 33 },
};

export const Unit: Story = {
  args: {
    unit: 'kg',
  },
};

export const Stepper: Story = {
  args: {
    step: 0.1,
  },
  play: async ({ canvasElement }) => {
    const input = getInput(canvasElement);
    const { incrementButton, decrementButton } = getStepperButtons(canvasElement);

    await userEvent.click(incrementButton);
    expect(input).toHaveValue('0.1');
    await userEvent.click(decrementButton);
    expect(input).toHaveValue('0.0');
    expect(decrementButton).toBeDisabled();
    userEvent.clear(input);
  },
};

export const StepperDisabled: Story = {
  args: {
    step: 0.1,
    disabled: true,
  },
};
export const StepperWithMinMax: Story = {
  args: {
    step: 1,
    min: 7,
    max: 14,
  },
  play: async ({ canvasElement, args, step }) => {
    const input = getInput(canvasElement);
    const { incrementButton, decrementButton } = getStepperButtons(canvasElement);

    expect(input).toHaveValue('');
    // should clamp to min when clicking stepper and current value is below min
    await userEvent.click(incrementButton);
    expect(input).toHaveValue('7');
    expect(decrementButton).toBeDisabled();

    // increment to max
    let value = 7;
    while (value !== args.max) {
      await userEvent.click(incrementButton);
      expect(input).toHaveValue((value + args.step!).toString());
      value++;
    }
    expect(incrementButton).toBeDisabled();
    userEvent.clear(input);

    // should clamp to max when entering value above max
    await step(
      'Enter value above max',
      test('2566', {
        expectValue: '2566',
        expectValueOnBlur: '14',
        expectValueOnReFocus: '14',
      }),
    );

    // should clamp to min when entering value above max
    await step(
      'Enter value below min',
      test('2', {
        expectValue: '2',
        expectValueOnBlur: '7',
        expectValueOnReFocus: '7',
      }),
    );
  },
};

export const WithError: Story = {
  args: {
    rules: {
      max: { value: 10, message: 'Error - number should be below 10.' },
    },
    info: 'Enter number above 10 to trigger error',
  },
};

export const ErrorWithUnitAndStepper: Story = {
  args: {
    unit: 'kg',
    step: 3,
    rules: {
      max: { value: 10, message: 'Error - number should be below 10.' },
    },
    info: 'Enter number above 10 to trigger error',
  },
};

export const WithOptionalLabel: Story = {
  args: {
    label: 'A label',
    optional: true,
  },
};

function test(
  value: string,
  {
    expectValue,
    expectValueOnBlur,
    expectValueOnReFocus,
  }: { expectValue: string; expectValueOnBlur: string; expectValueOnReFocus: string },
): NonNullable<Story['play']> {
  return async ({ canvasElement }) => {
    const input = getInput(canvasElement);

    // enter value
    await userEvent.click(input);
    await userEvent.type(input, value);
    expect(input).toHaveValue(expectValue);

    //blur
    await userEvent.tab();
    expect(input).toHaveValue(expectValueOnBlur);

    //reFocus
    await userEvent.click(input);
    expect(input).toHaveValue(expectValueOnReFocus);

    await userEvent.clear(input);
  };
}

function getInput(canvasElement: HTMLElement) {
  return within(canvasElement).getByRole('textbox');
}

function getStepperButtons(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  const incrementButton = canvas.getByRole('button', { name: 'increase' });
  const decrementButton = canvas.getByRole('button', { name: 'decrease' });

  return {
    incrementButton,
    decrementButton,
  };
}
