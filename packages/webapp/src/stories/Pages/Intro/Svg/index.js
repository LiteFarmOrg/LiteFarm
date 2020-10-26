import React from 'react';
import styles from './svg.scss'
import PropTypes from 'prop-types';
import TwoInputWithTitle from '../TwoInputWithTitle';

const WelcomeSVG = ({
  svg,
  alt,
}) => {
  return (
      <img src={svg} alt={alt} className={styles.svg} loading={'lazy'}/>
  );
};
TwoInputWithTitle.propTypes = {
  svg: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
}
export default WelcomeSVG;