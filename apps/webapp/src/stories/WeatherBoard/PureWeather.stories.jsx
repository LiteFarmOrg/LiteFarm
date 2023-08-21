import React from 'react';
import PureWeatherBoard from '../../components/WeatherBoard';
import { componentDecoratorsWithoutPadding } from '../Pages/config/Decorators';

export default {
  title: 'Components/WeatherBoard/PureWeatherBoard',
  component: PureWeatherBoard,
  decorators: componentDecoratorsWithoutPadding,
};

const Template = (args) => <PureWeatherBoard {...args} />;

export const Rain = Template.bind({});

Rain.args = {
  city: 'Vancouver',
  date: 'Wed 16 September',
  temperature: '15ºC',
  iconName: 'wi-day-rain',
  wind: 'Wind: 2 km/h',
  humidity: 'Humidity: 31%',
};

export const Sunny = Template.bind({});

Sunny.args = {
  city: 'Vancouver',
  date: 'Wed 16 September',
  temperature: '15ºC',
  iconName: 'wi-day-sunny',
  wind: 'Wind: 2 km/h',
  humidity: 'Humidity: 31%',
};
