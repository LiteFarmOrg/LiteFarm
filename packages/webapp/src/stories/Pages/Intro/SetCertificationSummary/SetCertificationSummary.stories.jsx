import React from 'react';
import { PureSetCertificationSummary } from '../../../../components/OrganicCertifierSurvey/SetCertificationSummary/PureSetCertificationSummary';
import decorators from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/SetCertificationSummary',
  decorators: decorators,
  component: PureSetCertificationSummary,
};

const Template = (args) => <PureSetCertificationSummary {...args} />;

export const RequestedCertifier = Template.bind({});
RequestedCertifier.args = {
  certificationName: 'Participatory Guarantee System',
  certifierName: 'Certifier',
  isRequestedCertifier: true,
  onGoBack: () => {},
};
RequestedCertifier.parameters = {
  ...chromaticSmallScreen,
};

export const SupportedCertifier = Template.bind({});
SupportedCertifier.args = {
  certificationName: 'Participatory Guarantee System',
  certifierName: 'Supported Certifier',
  isRequestedCertifier: false,
  onGoBack: () => {},
};
SupportedCertifier.parameters = {
  ...chromaticSmallScreen,
};
