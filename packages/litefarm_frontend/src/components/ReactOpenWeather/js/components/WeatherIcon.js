import React from 'react';
import PropTypes from 'prop-types';

const WeatherIcon = (props) => <i className={`wicon wi ${props.name}`}></i>;

WeatherIcon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default WeatherIcon;
