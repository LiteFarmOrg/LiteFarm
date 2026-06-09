import React from 'react';
import { authenticatedDecorators } from '../config/Decorators';
import PureHome from '../../../components/Home';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Home/PureHome',
  decorators: authenticatedDecorators,
  component: PureHome,
};

const Template = (args) => <PureHome {...args} />;

export const Default = Template.bind({});
Default.args = {
  greeting: 'Good morning,',
  first_name: ' User Name',
  imgUrl:
    'https://res.cloudinary.com/dfxanglyc/image/upload/v1552774058/portfolio/1024px-Nail___Gear.svg.png',
};
Default.parameters = {
  ...chromaticSmallScreen,
};
