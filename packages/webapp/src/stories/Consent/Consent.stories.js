import decorators from "../Pages/Intro/components/decorators";
import React from 'react';
import ConsentForm from "./index";

export default {
  title: 'Form/Consent',
  decorators: decorators,
  component: ConsentForm,
};

const Template = (args) => <ConsentForm {...args} />;

export const Consent = Template.bind({});
// Consent.args = {
//   buttonGroup: (<><Button color={'secondary'} fullLength>Go Back</Button> <Button fullLength>Continue</Button></>),
//   children: <ConsentForm />
// }

