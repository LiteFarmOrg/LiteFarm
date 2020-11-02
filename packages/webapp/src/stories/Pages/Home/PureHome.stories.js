import React from 'react';
import {authenticatedDecorators} from '../config/decorators';
import {Rain} from '../../WeatherBoard/PureWeather.stories'
import PureHome from "../../../components/Home";

export default {
  title: 'Form/Home/PureHome',
  decorators: authenticatedDecorators,
  component: PureHome,
};

const Template = (args) => <PureHome {...args}/>;

export const HomeRain = Template.bind({});
HomeRain.args = {
  title: 'Good morning, User Name',
  children: <Rain {...Rain.args}/>,
  imgUrl: 'https://res.cloudinary.com/dfxanglyc/image/upload/v1552774058/portfolio/1024px-Nail___Gear.svg.png'
};
