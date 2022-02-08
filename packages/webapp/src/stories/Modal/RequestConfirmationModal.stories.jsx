import React from 'react';
import RequestConfirmationModal from '../../components/Modals/RequestConfirmationModal';
import { componentDecorators } from '../Pages/config/Decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/RequestConfirmationModal',
  decorators: componentDecorators,
  component: RequestConfirmationModal,
};

const Template = (args) => <RequestConfirmationModal {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  ...chromaticSmallScreen,
};
