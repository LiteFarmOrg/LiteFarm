import React from 'react';
import decorators from '../../config/decorators';
import PureCertificationExportView from '../../../../components/CertificationExport';

export default {
  title: 'Form/Intro/PureCertificationExportScreen',
  decorators: decorators,
  component: PureCertificationExportView,
};

const Template = (args) => <PureCertificationExportView {...args} />;

export const Primary = Template.bind({});
