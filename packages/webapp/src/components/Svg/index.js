import React from 'react';
import styles from './svg.module.scss';
import PropTypes from 'prop-types';

const WelcomeSVG = ({ svg, alt }) => {
  return <img src={svg} alt={alt} className={styles.svg} loading={'lazy'} />;
};
WelcomeSVG.propTypes = {
  svg: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};
export default WelcomeSVG;
