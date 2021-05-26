import React from 'react';
import PureSetCertificationSummary from '../../../../components/SetCertificationSummary';
import decorators from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/SetCertificationSummary',
  decorators: decorators,
  component: PureSetCertificationSummary,
};

const Template = (args) => <PureSetCertificationSummary {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  certificationType: {
    certificationName: 'Participatory Guarantee System',
    certificationID: 2,
    requestedCertification: null,
  },
  name: 'Certifier',
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
