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
    <div className={styles.wind}>Wind: {wind}</div>
    <div className={styles.humidity}>Humidity: {humidity}</div>
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

export default function WeatherBoard(){
  const {forecast, error, loading, loaded, getForecast} = useOpenWeather();
  useEffect(()=>{
    const lat = "34.0699649"
    const lon = "-118.4037817"
    console.log('effect');
    if(!loading && !loaded){
      getForecast({ lang:'en', unit:'metric', lat: lat, lon: lon});
    }
  });
  console.log(forecast);
  console.log(error);
  return <p>something</p>

}
