import type { Meta, StoryObj } from '@storybook/react';
import { Controller, useForm } from 'react-hook-form';
import NumberInput, { type NumberInputProps } from '../../../components/Form/NumberInput';
import { componentDecorators } from '../../Pages/config/Decorators';

const NumberInputWithRHF = (props: Omit<NumberInputProps, 'value' | 'onChange'>) => {
  const { control } = useForm();
  return (
    <Controller
      name="test"
      control={control}
      render={({ field }) => (
        <NumberInput value={field.value} onChange={field.onChange} {...props} />
      )}
    />
  );
};

const meta = {
  title: 'Components/NumberInput',
  component: NumberInputWithRHF,
  decorators: componentDecorators,
} satisfies Meta<typeof NumberInputWithRHF>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutGrouping: Story = { args: { useGrouping: false } };
