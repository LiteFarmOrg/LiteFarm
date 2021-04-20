import React from 'react';
import PureRequestCertifier from '../../../../components/RequestCertifier';
import decorators from '../../config/decorators';

export default {
  title: 'Form/Intro/RequestCertifier',
  decorators: decorators,
  component: PureRequestCertifier,
};

const Template = (args) => <PureRequestCertifier {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
