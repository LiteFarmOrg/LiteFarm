import React from 'react';
import PureSetCertificationSummary from '../../../../components/SetCertificationSummary';
import decorators from '../../config/decorators';

export default {
  title: 'Form/Intro/SetCertificationSummary',
  decorators: decorators,
  component: PureSetCertificationSummary,
};

const Template = (args) => <PureSetCertificationSummary {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
