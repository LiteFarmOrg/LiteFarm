import type { Meta, StoryObj } from '@storybook/react';
import NumberInput from '../../../components/Form/NumberInput';
import { componentDecorators } from '../../Pages/config/Decorators';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  decorators: componentDecorators,
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ step }) => {
    await step(
      'Enter invalid characters',
      test('aD@j)+-ec&', { expectValue: '', expectValueOnBlur: '' }),
    );
    await step(
      'Enter invalid and valid characters',
      test('1a4D@^,8).+-ec3.&4', {
        expectValue: '148.34',
        expectValueOnBlur: '148.34',
      }),
    );
    await step(
      'Enter negative number',
      test('-22', { expectValue: '22', expectValueOnBlur: '22' }),
    );
    await step(
      'Enter number above 1000',
      test('29487.44', { expectValue: '29487.44', expectValueOnBlur: '29,487.44' }),
    );
    await step(
      'Enter number with leading zeroes',
      test('00078', { expectValue: '00078', expectValueOnBlur: '78' }),
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
      test('7498,431', { expectValue: '7498,431', expectValueOnBlur: '7.498,431' }),
    );

    // should be able to enter english numbers
    // should format to localized number on blur
    await step(
      'Enter number with decimal period',
      test('7498.431', { expectValue: '7498.431', expectValueOnBlur: '7.498,431' }),
    );
  },
};

export const WithoutGrouping: Story = {
  args: { useGrouping: false },
  play: async ({ step }) => {
    //should not insert thousands separator
    await step(
      'Enter whole number above 1000',
      test('122492', { expectValue: '122492', expectValueOnBlur: '122492' }),
    );
    await step(
      'Enter decimal number above 1000',
      test('7642.1', { expectValue: '7642.1', expectValueOnBlur: '7642.1' }),
    );
  },
};
export const WithoutDecimal: Story = {
  args: { allowDecimal: false },
  play: async ({ step }) => {
    await step(
      'Enter number with decimal',
      test('9.1', { expectValue: '91', expectValueOnBlur: '91' }),
    );
  },
};

function test(
  value: string,
  { expectValue, expectValueOnBlur }: { expectValue: string; expectValueOnBlur: string },
): NonNullable<Story['play']> {
  return async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');

    // enter value
    await userEvent.type(input, value);
    expect(input).toHaveValue(expectValue);

    //blur
    await userEvent.tab();
    expect(input).toHaveValue(expectValueOnBlur);

    // delete backwards
    // userEvent.click(input);
    // userEvent.keyboard('{Backspace}');
    // expect(input).toHaveValue(value.slice(0, -1));

    await userEvent.clear(input);
  };
}
