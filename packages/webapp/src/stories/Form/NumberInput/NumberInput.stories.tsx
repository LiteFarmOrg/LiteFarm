import type { Meta, StoryObj } from '@storybook/react';
import { Controller, useForm } from 'react-hook-form';
import NumberInput from '../../../components/Form/NumberInput';
import { ComponentProps } from 'react';

type NumberInputProps = ComponentProps<typeof NumberInput>;

const NumberInputWithHookForm = (props: Omit<NumberInputProps, 'value' | 'onChange'>) => {
  const { control } = useForm();

  return (
    <Controller
      name="test"
      control={control}
      render={({ field }) => <NumberInput {...field} {...props} />}
    />
  );
};

const meta = {
  title: 'Components/NumberInput',
  component: NumberInputWithHookForm,
} satisfies Meta<typeof NumberInputWithHookForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
