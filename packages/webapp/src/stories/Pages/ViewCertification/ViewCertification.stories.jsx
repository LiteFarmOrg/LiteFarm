import React from 'react';
import decorators from '../config/Decorators';
import PureViewNotInterestedInCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewNotInterestedInCertification';
import { chromaticSmallScreen } from '../config/chromatic';
import PureViewSupportedCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewSupportedCertification';
import PureViewUnsupportedCertification from '../../../components/OrganicCertifierSurvey/ViewCertification/PureViewUnsupportedCertification';

export default {
  title: 'Page/ViewCertification',
  decorators: decorators,
  component: PureViewSupportedCertification,
};

const supportedCertifier = {
  certifier_name: 'British Columbia Association for Regenerative Agriculture',
  certifier_acronym: 'BCARA',
};
const supportedCertificationName = 'Organic';

const unsupportedCertifierName = 'Oregon Tilth';

const unsupportedCertificationName = 'Organic';

const Supported = (args) => <PureViewSupportedCertification {...args} />;

export const SupportedCertification = Supported.bind({});
SupportedCertification.args = {
  supportedCertificationName,
  supportedCertifier,
  onBack: () => {},
};
SupportedCertification.parameters = {
  ...chromaticSmallScreen,
};

const Unsupported = (args) => <PureViewUnsupportedCertification {...args} />;

export const UnsupportedCertification = Unsupported.bind({});
UnsupportedCertification.args = {
  unsupportedCertifierName,
  unsupportedCertificationName,
};
UnsupportedCertification.parameters = {
  ...chromaticSmallScreen,
};

const NotInterested = (args) => <PureViewNotInterestedInCertification {...args} />;

export const NotInterestedInCertification = NotInterested.bind({});
NotInterestedInCertification.args = {};
NotInterestedInCertification.parameters = {
  ...chromaticSmallScreen,
};
