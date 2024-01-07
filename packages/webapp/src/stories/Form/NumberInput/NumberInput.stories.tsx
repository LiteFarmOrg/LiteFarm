import type { Meta, StoryObj } from '@storybook/react';
import NumberInput from '../../../components/Form/NumberInput';
import { componentDecorators } from '../../Pages/config/Decorators';

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput,
  decorators: componentDecorators,
} satisfies Meta<typeof NumberInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutGrouping: Story = { args: { useGrouping: false } };
export const WithoutDecimal: Story = { args: { allowDecimal: false } };
