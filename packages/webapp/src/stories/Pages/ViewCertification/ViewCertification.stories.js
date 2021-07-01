import React from 'react';
import decorators from '../config/decorators';
import { PureViewNotInterestedInCertification } from '../../../components/ViewCertification/PureViewNotInterestedInCertification';
import { chromaticSmallScreen } from '../config/chromatic';
import { PureViewSupportedCertification } from '../../../components/ViewCertification/PureViewSupportedCertification';
import { PureViewUnsupportedCertification } from '../../../components/ViewCertification/PureViewUnsupportedCertification';

export default {
  title: 'Page/ViewCertification',
  decorators: decorators,
  component: PureViewNotInterestedInCertification,
};

const NotInterested = (args) => <PureViewNotInterestedInCertification {...args} />;

export const NotInterestedInCertification = NotInterested.bind({});
NotInterestedInCertification.args = {};
NotInterestedInCertification.parameters = {
  ...chromaticSmallScreen,
};

const Supported = (args) => <PureViewSupportedCertification {...args} />;

export const SupportedCertification = Supported.bind({});
SupportedCertification.args = {};
SupportedCertification.parameters = {
  ...chromaticSmallScreen,
};

const Unsupported = (args) => <PureViewUnsupportedCertification {...args} />;

export const UnsupportedCertification = Unsupported.bind({});
UnsupportedCertification.args = {};
UnsupportedCertification.parameters = {
  ...chromaticSmallScreen,
};
