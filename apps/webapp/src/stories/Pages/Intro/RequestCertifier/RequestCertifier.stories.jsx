import React from 'react';
import {
  PureRequestCertifier,
} from '../../../../components/OrganicCertifierSurvey/RequestCertifier/PureRequestCertifier';
import decorators from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/RequestCertifier',
  decorators: decorators,
  component: PureRequestCertifier,
};

const Template = (args) => <PureRequestCertifier {...args} />;

export const RequestedCertification = Template.bind({});
RequestedCertification.args = {
  certificationName: 'Other',
  isRequestedCertification: true,
  hasSupportedCertifiers: true,
  requestedCertification: 'Certification',
  onGoBack: () => {},
};
RequestedCertification.parameters = {
  ...chromaticSmallScreen,
};

export const WithSupportedCertifier = Template.bind({});
WithSupportedCertifier.args = {
  certificationName: 'Organic',
  isRequestedCertification: false,
  hasSupportedCertifiers: true,
  requestedCertification: 'Certification',
  onGoBack: () => {},
};
WithSupportedCertifier.parameters = {
  ...chromaticSmallScreen,
};

export const NoSupportedCertifier = Template.bind({});
NoSupportedCertifier.args = {
  certificationName: 'Organic',
  isRequestedCertification: false,
  hasSupportedCertifiers: true,
  requestedCertification: 'Certification',
  onGoBack: () => {},
};
NoSupportedCertifier.parameters = {
  ...chromaticSmallScreen,
};
