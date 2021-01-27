import React from 'react';
import WeatherBoard from '../../containers/WeatherBoard';
import decorators from '../Pages/config/decorators';

export default {
  title: 'Components/WeatherBoard/WeatherBoardWrapper',
  component: WeatherBoard,
  decorators,
};

const Template = (args) => <WeatherBoard {...args} />;

export const English = Template.bind({});

English.args = {};

export const Espanol = Template.bind({});
Espanol.args = {};

English.parameters = {
  chromatic: { disable: true },
};
Espanol.parameters = {
  chromatic: { disable: true },
};
