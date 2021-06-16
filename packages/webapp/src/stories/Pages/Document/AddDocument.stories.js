import React from 'react';
import PureAddDocumentView from '../../../components/Documents/Add';
import decorator from '../config/decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/Document/AddDocument',
  component: PureAddDocumentView,
  decorators: decorator,
};

const Template = (args) => <PureAddDocumentView {...args} />;

export const Primary = Template.bind({});

Primary.args = {
  handleSubmit: () => {},
  onGoBack: () => {},
  onCancel: () => {},
  deleteImage: () => {}
}

Primary.parameters = {...chromaticSmallScreen}