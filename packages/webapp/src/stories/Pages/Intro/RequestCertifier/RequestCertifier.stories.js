import React from 'react';
import PureRequestCertifier from '../../../../components/OrganicCertifierSurvey/RequestCertifier';
import decorators from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/RequestCertifier',
  decorators: decorators,
  component: PureRequestCertifier,
};

const Template = (args) => <PureRequestCertifier {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  certificationType: {
    certificationName: 'Other',
    certification_id: null,
    requestedCertification: 'Certification',
  },
  onGoBack: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
