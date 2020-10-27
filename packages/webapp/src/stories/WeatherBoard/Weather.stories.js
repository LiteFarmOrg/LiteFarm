import React from 'react';
import { WeatherBoard } from './WeatherBoard';

export default {
  title: 'Components/WeatherBoard',
  component: WeatherBoard,
};

const Template = (args) => <WeatherBoard {...args} />;

export const Rain = Template.bind({});

Rain.args = {
  city: 'Vancouver',
  date: 'Wed 16 September',
  temperature: '15ºC',
  iconName: 'wi-day-rain',
  wind: '2 km/h',
  humidity: '31%'
}

export const Sunny = Template.bind({});

Sunny.args = {
  city: 'Vancouver',
  date: 'Wed 16 September',
  temperature: '15ºC',
  iconName: 'wi-day-sunny',
  wind: '2 km/h',
  humidity: '31%'
}







