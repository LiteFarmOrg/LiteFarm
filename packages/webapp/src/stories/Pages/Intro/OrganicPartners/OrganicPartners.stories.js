import React from 'react';
import decorators from '../../config/decorators';
import OrganicPartners from "../../../../containers/OrganicCertifierSurvey/OrganicPartners";

export default {
  title: 'Form/Intro/5-OrganicPartners',
  decorators: decorators,
  component: OrganicPartners,
};

const Template = (args) => <OrganicPartners {...args} />;

export const Primary = Template.bind({});
Primary.args = {
};
