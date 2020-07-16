import React from 'react';
import { render } from 'react-dom';
import ReactWeather from './components/ReactWeather';

render(
  <ReactWeather
    forecast="5days"
    apikey="YOUR_API_KEY"
    type="city"
    city="Munich"
    lang="en"
  />,
  document.getElementById('root')
);
