import React from 'react';
import { authenticatedDecorators } from '../config/Decorators';
import { Rain } from '../../WeatherBoard/PureWeather.stories';
import PureHome from '../../../components/Home';
import { chromaticSmallScreen } from '../config/chromatic';

export default {
  title: 'Form/Home/PureHome',
  decorators: authenticatedDecorators,
  component: PureHome,
};

const Template = (args) => <PureHome {...args} />;

export const HomeRain = Template.bind({});
HomeRain.args = {
  greeting: 'Good morning,',
  first_name: ' User Name',
  children: <Rain {...Rain.args} />,
  imgUrl:
    'https://res.cloudinary.com/dfxanglyc/image/upload/v1552774058/portfolio/1024px-Nail___Gear.svg.png',
};
HomeRain.parameters = {
  ...chromaticSmallScreen,
};
