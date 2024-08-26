import FileSizeExceedModal from '../../components/Modals/FileSizeExceedModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';
import type { Meta, StoryObj } from '@storybook/react/*';

const meta: Meta<typeof FileSizeExceedModal> = {
  title: 'Components/Modals/FileSizeExceedModal',
  decorators: componentDecorators,
  component: FileSizeExceedModal,
  parameters: { ...chromaticSmallScreen },
};

export default meta;
type Story = StoryObj<typeof FileSizeExceedModal>;

export const Primary: Story = {};
export const DynamicSize: Story = { args: { size: 5 } };
