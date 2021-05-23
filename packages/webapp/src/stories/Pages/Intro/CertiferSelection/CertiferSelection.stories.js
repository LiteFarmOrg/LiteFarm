import React from 'react';
import decorators from '../../config/decorators';
import PureCertifierSelectionScreen from '../../../../components/CertifierSelection';

export default {
  title: 'Form/Intro/PureCertifierSelectionScreen',
  decorators: decorators,
  component: PureCertifierSelectionScreen,
};

const certifiers = [
  {
    certifier_id: 'Islands Organic Producers Association (IOPA)',
    certifierTranslation: 'Islands Organic Producers Association (IOPA)',
  },
  {
    certifier_id: 'Similkameen Okanagan Organic Producers Association (SOOPA)',
    certifierTranslation: 'Similkameen Okanagan Organic Producers Association (SOOPA)',
  },
  {
    certifier_id: 'Fraser Valley Organic Producers Association (FVOPA)',
    certifierTranslation: 'Fraser Valley Organic Producers Association (FVOPA)',
  },
  {
    certifier_id: 'North Okanagan Organic Association (NOOA)',
    certifierTranslation: 'North Okanagan Organic Association (NOOA)',
  },
  {
    certifier_id: 'Kootenay Organic Growers Society (KOGS)',
    certifierTranslation: 'Kootenay Organic Growers Society (KOGS)',
  },
  { certifier_id: 'Certifier', certifierTranslation: 'Certifier' },
];

const Template = (args) => <PureCertifierSelectionScreen {...args} />;

export const NotSearchable = Template.bind({});
NotSearchable.args = {};
NotSearchable.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};

export const Searchable = Template.bind({});
Searchable.args = {
  certifiers,
};
Searchable.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
