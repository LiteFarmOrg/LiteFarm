import React from 'react';
import CertificationSelection from '../../../../components/CertificationSelection';
import decorators from '../../config/decorators';

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
    certificationID: 2,
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
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
