import React from 'react';
import decorators from '../config/decorators';
import PureViewNotInterestedInCertification from '../../../components/ViewCertification/PureViewNotInterestedInCertification';
import { chromaticSmallScreen } from '../config/chromatic';
import PureViewSupportedCertification from '../../../components/ViewCertification/PureViewSupportedCertification';
import PureViewUnsupportedCertification from '../../../components/ViewCertification/PureViewUnsupportedCertification';

export default {
  title: 'Page/ViewCertification',
  decorators: decorators,
  component: PureViewSupportedCertification,
};

const supportedCertifier = {
  certifier_id: 5,
  certification_type: 1,
  certifier_name: 'Bio-Dynamic Agricultural Society of British Columbia',
  certifier_acronym: 'BDASBC',
  certifier_country_id: 5,
  country_id: 37,
  farm_id: 'ea8eda4e-bdad-11eb-9e63-318a4efb8273',
  farm_name: 'new organic',
  address: '49.267847499999995, -123.1745952',
  units: {
    currency: 'CAD',
    measurement: 'metric',
  },
  grid_points: {
    lat: 49.267847499999995,
    lng: -123.1745952,
  },
  deleted: false,
  farm_phone_number: null,
  created_by_user_id: '104942873090979111002',
  updated_by_user_id: '104942873090979111002',
  created_at: '2021-05-25T23:07:02.713Z',
  updated_at: '2021-05-25T23:07:06.436Z',
  sandbox_farm: false,
  owner_operated: true,
};
const supportedCertification = {
  certification_id: 1,
  certification_type: 'Organic',
  certification_translation_key: 'ORGANIC',
};

const Supported = (args) => <PureViewSupportedCertification {...args} />;

export const SupportedCertification = Supported.bind({});
SupportedCertification.args = {
  supportedCertification: supportedCertification,
  supportedCertifier: supportedCertifier,
  onBack: () => {},
};
SupportedCertification.parameters = {
  ...chromaticSmallScreen,
};

const Unsupported = (args) => <PureViewUnsupportedCertification {...args} />;

export const UnsupportedCertification = Unsupported.bind({});
UnsupportedCertification.args = {};
UnsupportedCertification.parameters = {
  ...chromaticSmallScreen,
};

const NotInterested = (args) => <PureViewNotInterestedInCertification {...args} />;

export const NotInterestedInCertification = NotInterested.bind({});
NotInterestedInCertification.args = {};
NotInterestedInCertification.parameters = {
  ...chromaticSmallScreen,
};
