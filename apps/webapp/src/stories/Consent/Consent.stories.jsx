import decorators from '../Pages/config/Decorators';
import React from 'react';
import PureConsent from '../../components/Consent';
// import ConsentEnglish from '../../containers/Consent/locales/en/Owner.Consent.md';
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
  // TODO: import consent when https://github.com/storybookjs/storybook/issues/11981#issuecomment-673562202 is fixed
  // consent: <ConsentEnglish />,
};
