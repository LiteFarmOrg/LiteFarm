import React from 'react';
import decorators from '../../config/decorators';
import OnboardingInterestedOrganic from '../../../../containers/OrganicCertifierSurvey/InterestedOrganic/OnboardingInterestedOrganic';
import { chromaticSmallScreen } from '../../config/chromatic';

export default {
  title: 'Form/Intro/4-InterestedOrganic',
  decorators: decorators,
  component: OnboardingInterestedOrganic,
};

const Template = (args) => <OnboardingInterestedOrganic {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  onGoBack: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
