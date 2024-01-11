import type { Meta, StoryObj } from '@storybook/react';
import NumberInput from '../../../components/Form/NumberInput';
import { componentDecorators } from '../../Pages/config/Decorators';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
  decorators: componentDecorators,
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
  args: { locale: 'pt' },
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
  play: async ({ step }) => {
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
  play: async ({ step }) => {
    await step(
      'Enter number with decimal',
      test('9.1', { expectValue: '91', expectValueOnBlur: '91', expectValueOnReFocus: '91' }),
    );
  },
};

export const Round: Story = {
  args: { roundToDecimalPlaces: 2 },
  play: async ({ step }) => {
    await step(
      'Enter number with more than 2 decimal places',
      test('8.5751', {
        expectValue: '8.5751',
        expectValueOnBlur: '8.58',
        expectValueOnReFocus: '8.58',
      }),
    );
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
  return async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

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
