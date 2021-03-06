import React from 'react';
import PurePopupMiniForm from '../../../components/PopupMiniForm';
import { componentDecoratorsWithoutPadding } from '../config/decorators';

export default {
  title: 'Form/PopupMiniForm',
  decorators: componentDecoratorsWithoutPadding,
  component: PurePopupMiniForm,
};

const Template = (args) => <PurePopupMiniForm {...args} />;

export const HarvestUse = Template.bind({});
HarvestUse.args = {
  title: 'Add a harvest use',
  inputInfo: 'Name of the custom harvest use',
  isOpen: true,
};
HarvestUse.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
