import useOpenWeather from './utils/useOpenWeather';
import React from 'react';
import PureWeatherBoard from '../../components/WeatherBoard';
import PropTypes from 'prop-types';

export default function WeatherBoard({ lat, lon, lang, measurement }) {
  const { forecast, error, loaded } = useOpenWeather({
    lang: lang,
    measurement: measurement,
    lat: lat,
    lon: lon,
  });
  return loaded && !error ? <PureWeatherBoard {...forecast} /> : null;
}

WeatherBoard.propTypes = {
  lat: PropTypes.number,
  lon: PropTypes.number,
  lang: PropTypes.string,
  measurement: PropTypes.oneOf(['imperial', 'metric']),
};
