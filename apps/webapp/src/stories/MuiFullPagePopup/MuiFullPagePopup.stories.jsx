import React from 'react';
import MuiFullPagePopup from '../../components/MuiFullPagePopup/v2';
import decorator from '../Pages/config/Decorators';
import { Post } from '../Pages/LocationDetails/AreaDetails/Barn/Barn.stories';
import { chromaticSmallScreen } from '../Pages/config/chromatic';

export default {
  title: 'Components/MuiFullPagePopup',
  decorators: decorator,
  component: MuiFullPagePopup,
};

const Template = (args) => <MuiFullPagePopup {...args} />;

export const Barn = Template.bind({});
Barn.args = {
  open: true,
  children: <Post {...Post.args} />,
};
Barn.parameters = {
  ...chromaticSmallScreen,
};
