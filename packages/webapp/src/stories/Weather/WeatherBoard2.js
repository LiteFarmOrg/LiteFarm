import React from 'react';
import styles from './assets/weatherBoard.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';


/**
 * Primary UI component for user interaction
 */
export const WeatherBoard = ({
  city,
  date,
  temperature,
  icon,
  wind,
  humidity,
  ...props
}) => {
  return <div className={styles.container}>
    <div className={styles.city}>{city}</div>
    <div className={styles.date}>{date}</div>
    <div className={styles.temperature}>{temperature}</div>
    <div className={styles.icon}>{icon}</div>
    <div className={styles.wind}>{wind}</div>
    <div className={styles.humidity}>{humidity}</div>
  </div>


};

WeatherBoard.propTypes = {
  city: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  temperature: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  wind: PropTypes.string.isRequired,
  humidity: PropTypes.string.isRequired,
}