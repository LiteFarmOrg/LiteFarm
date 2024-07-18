import React from 'react';
import decorators from '../../config/Decorators';
import { PureCertifierSelectionScreen } from '../../../../components/OrganicCertifierSurvey/CertifierSelection/PureCertifierSelectionScreen';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/PureCertifierSelectionScreen',
  decorators: decorators,
  component: PureCertifierSelectionScreen,
};

const certifiers = [
  {
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
  },
  {
    certifier_id: 4,
    certification_type: 1,
    certifier_name: 'British Columbia Association for Regenerative Agriculture',
    certifier_acronym: 'BCARA',
    certifier_country_id: 4,
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
  },
];
const certifications = [
  {
    certification_id: 1,
    certification_type: 'Third-party Organic',
    certification_translation_key: 'THIRD_PARTY_ORGANIC',
  },
  {
    certification_id: 2,
    certification_type: 'Participatory Guarantee System',
    certification_translation_key: 'PGS',
  },
];

const Template = (args) => <PureCertifierSelectionScreen {...args} />;

export const NotSearchable = Template.bind({});
NotSearchable.args = {
  persistedFormData: {},
  certifications: certifications,
  certifiers: certifiers.slice(0, 1),
};
NotSearchable.parameters = {
  ...chromaticSmallScreen,
};

export const Searchable = Template.bind({});
Searchable.args = {
  persistedFormData: {},
  certifications: certifications,
  certifiers,
};
Searchable.parameters = {
  ...chromaticSmallScreen,
};
