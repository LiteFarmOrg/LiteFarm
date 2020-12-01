import React from 'react';
import styles from './assets/styles.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import TodayForecast from './TodayForecast';
import WeatherIcon from './WeatherIcon';
import DaysForecast from './DaysForecast';
import utils from '../../../components/ReactOpenWeather/js/utils';


/**
 * TooShort UI component for user interaction
 */
export const WeatherBoard = ({
  unit = 'metric',
  forecast = 'today',
  lang = 'en',
  location = 'Vancouver',
  days = [],
  ...props
}) => {
  const today = days[0];
  const todayIcon = utils.getIcon(today.icon);
  return <div className={styles.box} {...props}>
    <div className={ clsx(styles.main, styles[`type-${forecast}`])}>
      <div className={styles.boxLeft}>
        <h2>{location}</h2>
        <TodayForecast todayData={today} unit={unit} lang={lang}/>
      </div>
      <div className={styles.boxRight}>
        <WeatherIcon name={todayIcon}/>
      </div>
    </div>
    <DaysForecast
      unit={unit}
      forecast={forecast}
      daysData={days}
      lang={lang}
    />
  </div>


};

WeatherBoard.propTypes = {
  unit: PropTypes.oneOf(['imperial', 'metric']).isRequired,
  forecast: PropTypes.oneOf(['today', '5days']).isRequired,
  lang: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  days: PropTypes.array.isRequired,
}