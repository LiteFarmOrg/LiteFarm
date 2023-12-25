import type { Meta, StoryObj } from '@storybook/react';
import { Controller, useForm } from 'react-hook-form';
import NumberInput, { type NumberInputProps } from '../../../components/Form/NumberInput';

const NumberInputWithHookForm = (props: Omit<NumberInputProps, 'value' | 'onChange'>) => {
  const { control } = useForm({ defaultValues: { test: '' } });

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
  component: NumberInputWithHookForm,
} satisfies Meta<typeof NumberInputWithHookForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default = {} satisfies Story;
