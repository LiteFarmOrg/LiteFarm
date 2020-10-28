import React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1

import { WeatherBoard } from './WeatherBoard';

export default {
  title: 'Components/WeatherBoard/old',
  component: WeatherBoard,
};

const data = {
  'location': {
    'id': 7300025,
    'name': 'Newquay',
    'coord': {
      'lat': 50.44,
      'lon': -5.04,
    },
    'country': 'GB',
    'population': 0,
    'timezone': 3600,
    'sunrise': 1603263171,
    'sunset': 1603300577,
  },
  'days': [
    {
      'date': 'Wed 21 October',
      'description': 'Rain',
      'icon': '10d',
      'temperature': {
        'min': '14',
        'max': '14',
        'current': '13',
      },
      'wind': '4',
      'humidity': 95,
    },
    {
      'date': 'Wed 21 October',
      'description': 'Rain',
      'icon': '10d',
      'temperature': {
        'min': '13',
        'max': '14',
      },
      'wind': '7',
      'humidity': 92,
    },
    {
      'date': 'Wed 21 October',
      'description': 'Rain',
      'icon': '10d',
      'temperature': {
        'min': '14',
        'max': '14',
      },
      'wind': '8',
      'humidity': 91,
    },
    {
      'date': 'Wed 21 October',
      'description': 'Clouds',
      'icon': '04n',
      'temperature': {
        'min': '12',
        'max': '12',
      },
      'wind': '9',
      'humidity': 90,
    },
    {
      'date': 'Wed 21 October',
      'description': 'Rain',
      'icon': '10n',
      'temperature': {
        'min': '12',
        'max': '12',
      },
      'wind': '6',
      'humidity': 89,
    },
  ],
}

const openWeatherRes = {
  'coord': { 'lon': -118.4, 'lat': 34.07 },
  'weather': [{ 'id': 800, 'main': 'Clear', 'description': 'clear sky', 'icon': '01n' }],
  'base': 'stations',
  'main': { 'temp': 63.14, 'feels_like': 62.94, 'temp_min': 60.8, 'temp_max': 64.99, 'pressure': 1017, 'humidity': 63 },
  'visibility': 10000,
  'wind': { 'speed': 0.65, 'deg': 248 },
  'clouds': { 'all': 1 },
  'dt': 1603862818,
  'sys': { 'type': 1, 'id': 5872, 'country': 'US', 'sunrise': 1603807752, 'sunset': 1603847124 },
  'timezone': -25200,
  'id': 5328041,
  'name': 'Beverly Hills',
  'cod': 200,
}

const Template = (args) => <WeatherBoard {...args} />;

export const Metric = Template.bind({});

Metric.args = {
  unit: 'metric',
  forecast: 'today',
  lang: 'en',
  location: data.location.name,
  days: data.days,
}

export const Imperial = Template.bind({});
Imperial.args = {
  unit: 'imperial',
  forecast: 'today',
  lang: 'en',
  location: data.location.name,
  days: data.days,
}

export const FiveDays = Template.bind({});
FiveDays.args = {
  unit: 'metric',
  forecast: '5days',
  lang: 'en',
  location: data.location.name,
  days: data.days,
}






