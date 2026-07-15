import React from 'react';
import PureCertificationReportingPeriod from '../../../components/CertificationReportingPeriod';
import decorators from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Page/Certifications/ReportingPeriod',
  decorators: decorators,
  component: PureCertificationReportingPeriod,
};

const Template = (args) => <PureCertificationReportingPeriod {...args} />;

const certifierOptions = [
  { value: '1', label: 'Islands Organic Producers Association' },
  { value: '2', label: 'Kootenay Organic Growers Society' },
  { value: '3', label: 'Living Earth Organic Growers' },
];

export const Primary = Template.bind({});
Primary.args = {
  onSubmit: () => console.log('onSubmit called'),
  onError: () => console.log('onError called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  useHookFormPersist: () => ({}),
  certifierOptions,
};
Primary.parameters = {
  ...chromaticSmallScreen,
};

export const NoCertifiers = Template.bind({});
NoCertifiers.args = {
  ...Primary.args,
  certifierOptions: [],
};
NoCertifiers.parameters = {
  ...chromaticSmallScreen,
};
