import React from 'react';
import RenderSurvey from '../../containers/RenderSurvey/RenderSurvey';
import decorators from '../Pages/config/decorators';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/Modals/RenderSurvey',
  decorators,
  component: RenderSurvey,
};

const Template = (args) => <RenderSurvey {...args} />;

export const Primary = Template.bind({});
Primary.args = {};

Primary.parameters = {
  ...chromaticSmallScreen,
};
