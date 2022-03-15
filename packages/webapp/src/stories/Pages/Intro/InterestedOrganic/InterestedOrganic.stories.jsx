import React from 'react';
import decorators from '../../config/Decorators';
import { chromaticSmallScreen } from '../../config/chromatic';
import { PureInterestedOrganic } from '../../../../components/OrganicCertifierSurvey/InterestedOrganic/PureInterestedOrganic';

export default {
  title: 'Form/Intro/4-InterestedOrganic',
  decorators: decorators,
  component: PureInterestedOrganic,
};

const Template = (args) => <PureInterestedOrganic {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  onGoBack: () => {},
  onSubmit: () => {},
};
Primary.parameters = {
  ...chromaticSmallScreen,
};
