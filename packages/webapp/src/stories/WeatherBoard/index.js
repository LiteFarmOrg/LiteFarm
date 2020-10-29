import React, { useEffect } from 'react';
import styles from './assets/weatherBoard.scss';
import PropTypes from 'prop-types';
import WeatherIcon from './WeatherIcon';

import useOpenWeather from './utils/useOpenWeather';
/**
 * Primary UI component for user interaction
 */
export const PureWeatherBoard = ({
  city,
  date,
  temperature,
  iconName,
  wind,
  humidity,
}) => {
  return <div className={styles.container}>
    <div className={styles.city}>{city}</div>
    <div className={styles.date}>{date}</div>
    <div className={styles.temperature}>{temperature}</div>
    <div className={styles.icon}><WeatherIcon name={iconName}/></div>
    <div className={styles.wind}>{wind}</div>
    <div className={styles.humidity}>{humidity}</div>
  </div>


};

PureWeatherBoard.propTypes = {
  city: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  temperature: PropTypes.string.isRequired,
  iconName: PropTypes.string.isRequired,
  wind: PropTypes.string.isRequired,
  humidity: PropTypes.string.isRequired,
}

export default function Index({lat, lon, lang, measurement}){
  const {forecast, error, loading, loaded, getForecast} = useOpenWeather({ lang: lang, measurement: measurement, lat: lat, lon: lon});
  useEffect(()=>{
    //TODO fix double qpi call
    if(!loading && !loaded){
      getForecast();
    }
  }, [loading]);

  return loaded && !error? <PureWeatherBoard {...forecast}/>: null;
}
