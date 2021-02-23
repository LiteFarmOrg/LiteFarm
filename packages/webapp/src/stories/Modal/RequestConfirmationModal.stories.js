import React from 'react';
import RequestConfirmationModal from '../../components/Modals/RequestConfirmationModal';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Modals/RequestConfirmationModal',
  decorators: componentDecorators,
  component: RequestConfirmationModal,
};

const Template = (args) => <RequestConfirmationModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
