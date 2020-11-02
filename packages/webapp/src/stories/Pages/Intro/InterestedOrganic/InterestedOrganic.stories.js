import React from 'react';
import decorators from '../../config/decorators';
import InterestedOrganic from "../../../../containers/OrganicCertifierSurvey/InterestedOrganic";

export default {
  title: 'Form/Intro/4-InterestedOrganic',
  decorators: decorators,
  component: InterestedOrganic,
};

const Template = (args) => <InterestedOrganic {...args} />;

export const Primary = Template.bind({});
Primary.args = {
};
