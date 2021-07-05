import React from 'react';
import CertificationSelection from '../../../../components/CertificationSelection';
import decorators from '../../config/decorators';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/CertificationSelection',
  decorators: decorators,
  component: CertificationSelection,
};

const Template = (args) => <CertificationSelection {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  certification: {
    certificationName: 'Participatory Guarantee System',
    certification_id: 2,
    requestedCertification: null,
  },
  allSupportedCertificationTypes: [
    {
      certification_id: 1,
      certification_type: 'Organic',
      certification_translation_key: 'ORGANIC',
    },
    {
      certification_id: 2,
      certification_type: 'Participatory Guarantee System',
      certification_translation_key: 'PGS',
    },
  ],
  selectedCertification: () => {},
  dispatch: () => {},
  onGoBack: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
