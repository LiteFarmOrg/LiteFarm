import decorators from "../Pages/config/decorators";
import React from 'react';
import ConsentForm from "../../containers/Consent";

export default {
  title: 'Form/Intro/3-Consent',
  decorators: decorators,
  component: ConsentForm,
};

const Template = (args) => <ConsentForm {...args} />;

export const Consent = Template.bind({});
Consent.args = {
  onSubmit: () => {},
  onGoBack: () => {},
  text: '',
  checkBoxArgs: {label: 'I Agree'}
}

