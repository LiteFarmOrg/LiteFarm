import React from 'react';
import utils from './utils';
import WeatherIcon from './WeatherIcon';
import PropTypes from 'prop-types';
import styles from './assets/styles.scss';

const propTypes = {
  forecast: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  daysData: PropTypes.array.isRequired
};

const DaysForecast = (props) => {
  const { forecast, unit, daysData } = props;
  if (forecast === '5days') {
    const units = utils.getUnits(unit);
    return (
      <div className={styles.boxDays}>
        {
          daysData.map((day, i) => {
            if (i > 0) {
              const iconCls = utils.getIcon(day.icon);
              return (
                <div key={`day-${i}`} className={styles.day}>
                  <div className={styles.date}>{day.date}</div>
                  <WeatherIcon name={iconCls} />
                  <div className={styles.desc}>{day.description}</div>
                  <div className={styles.range}>{day.temperature.max} / {day.temperature.min} {units.temp}</div>
                </div>
              );
            }
            return '';
          })
        }
      </div>
    );
  }
  return null;
};

DaysForecast.propTypes = propTypes;

export default DaysForecast;
