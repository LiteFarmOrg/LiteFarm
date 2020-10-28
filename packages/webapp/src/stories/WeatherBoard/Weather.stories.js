import React from 'react';
import Index from './';

export default {
  title: 'Components/WeatherBoard/WeatherBoardWrapper',
  component: Index,
};

const Template = (args) => <Index {...args} />;

export const English = Template.bind({});

English.args = {
  lon: -82.287712,
  lat: 35.451058,
  lang: 'en',
  measurement: 'imperial'
}

export const Espanol = Template.bind({});
Espanol.args = {
  lon: 41.135856,
  lat: 37.895650,
  lang: 'es',
  measurement: 'metric'
}







