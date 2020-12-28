import React from 'react';
import utils from '../utils';
import WeatherIcon from './WeatherIcon';
import PropTypes from 'prop-types';
import '../../css/components/DaysForecast.scss';

const propTypes = {
  forecast: PropTypes.string.isRequired,
  unit: PropTypes.string.isRequired,
  daysData: PropTypes.array.isRequired,
};

const DaysForecast = (props) => {
  const { forecast, unit, daysData } = props;
  if (forecast === '5days') {
    const units = utils.getUnits(unit);
    return (
      <div className="rw-box-days">
        {daysData.map((day, i) => {
          if (i > 0) {
            const iconCls = utils.getIcon(day.icon);
            return (
              <div key={`day-${i}`} className="rw-day">
                <div className="rw-date">{day.date}</div>
                <WeatherIcon name={iconCls} />
                <div className="rw-desc">{day.description}</div>
                <div className="rw-range">
                  {day.temperature.max} / {day.temperature.min} {units.temp}
                </div>
              </div>
            );
          }
          return '';
        })}
      </div>
    );
  }
  return <div></div>;
};

DaysForecast.propTypes = propTypes;

export default DaysForecast;
