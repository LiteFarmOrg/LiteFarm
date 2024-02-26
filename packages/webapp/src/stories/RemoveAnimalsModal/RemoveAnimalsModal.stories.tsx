import RemoveAnimalsModal from '../../components/Animals/RemoveAnimalsModal';
import { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RemoveAnimalsModal> = {
  title: 'Components/RemoveAnimalsModal',
  component: RemoveAnimalsModal,
};

export default meta;

type Story = StoryObj<typeof RemoveAnimalsModal>;

export const Primary: Story = {
  args: {
    isOpen: true,
  },
};

export const WithSuccessMessage: Story = {
  args: {
    isOpen: true,
    showSuccessMessage: true,
  },
};
