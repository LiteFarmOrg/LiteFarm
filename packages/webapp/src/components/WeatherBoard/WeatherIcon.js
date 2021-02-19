import React from 'react';
import PropTypes from 'prop-types';
import styles from './assets/weatherIcon.module.scss';
import clsx from 'clsx';

const WeatherIcon = (props) => <i className={clsx(styles.icon, 'wi', props.name)} />;

WeatherIcon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default WeatherIcon;
