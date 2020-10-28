import decorators from "../Pages/config/decorators";
import React from 'react';
import ConsentForm from "./index";

export default {
  title: 'Form/Consent',
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

