import React from 'react';
import CertificationSelection from '../../../../components/CertificationSelection';
import decorators from '../../config/decorators';

export default {
  title: 'Form/Intro/CertificationSelection',
  decorators: decorators,
  component: CertificationSelection,
};

const Template = (args) => <CertificationSelection {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
