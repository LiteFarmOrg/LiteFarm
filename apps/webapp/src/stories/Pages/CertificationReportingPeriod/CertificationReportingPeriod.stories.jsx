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

export const Primary = Template.bind({});
Primary.args = {
  onSubmit: () => console.log('onSubmit called'),
  onError: () => console.log('onError called'),
  handleGoBack: () => console.log('handleGoBack called'),
  handleCancel: () => console.log('handleCancel called'),
  useHookFormPersist: () => ({}),
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
