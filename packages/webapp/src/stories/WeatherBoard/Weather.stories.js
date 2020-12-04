import React from 'react';
import WeatherBoard from '../../containers/WeatherBoard';
import { Default } from '../Pages/Home/Home.stories';

export default {
  title: 'Components/WeatherBoard/WeatherBoardWrapper',
  component: WeatherBoard,
};

const Template = (args) => <WeatherBoard {...args} />;

export const English = Template.bind({});

English.args = {
  lon: -82.287712,
  lat: 35.451058,
  lang: 'en',
  measurement: 'imperial',
};

export const Espanol = Template.bind({});
Espanol.args = {
  lon: 41.135856,
  lat: 37.89565,
  lang: 'es',
  measurement: 'metric',
};

English.parameters = {
  chromatic: { disable: true },
};
Espanol.parameters = {
  chromatic: { disable: true },
};
