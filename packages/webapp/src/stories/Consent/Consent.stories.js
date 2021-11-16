import decorators from '../Pages/config/decorators';
import React from 'react';
import PureConsent from '../../components/Consent';
import text from '../../containers/Consent/locales/en/Owner.Consent.md';
export default {
  title: 'Form/Intro/3-Consent',
  decorators: decorators,
  component: PureConsent,
};

const Template = (args) => <PureConsent {...args} />;

export const Consent = Template.bind({});
Consent.args = {
  onSubmit: () => {},
  onGoBack: () => {},
  checkboxArgs: { label: 'I Agree' },
  text: text,
};
