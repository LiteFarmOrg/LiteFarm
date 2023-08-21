import React from 'react';
import { DocumentIcon } from '../../components/Icons/DocumentIcon';

import { componentDecoratorsGreyBackground } from '../Pages/config/Decorators';

export default {
  title: 'Components/DocumentIcon',
  decorators: componentDecoratorsGreyBackground,
  component: DocumentIcon,
};
const Template = (args) => <DocumentIcon {...args} />;

export const PDF = Template.bind({});

PDF.args = {
  extensionName: 'pdf',
};

export const DOCX = Template.bind({});
DOCX.args = {
  extensionName: 'docx',
};
