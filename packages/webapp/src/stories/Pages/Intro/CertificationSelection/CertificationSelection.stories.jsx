import React from 'react';
import { PureCertificationSelection } from '../../../../components/OrganicCertifierSurvey/CertificationSelection/PureCertificationSelection';
import decorators from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/PureCertificationSelection',
  decorators: decorators,
  component: PureCertificationSelection,
};

const Template = (args) => <PureCertificationSelection {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  persistedFormData: {
    certification_id: 2,
  },
  certifications: [
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
  ],
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
