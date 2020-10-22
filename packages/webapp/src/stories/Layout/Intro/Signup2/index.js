import React from 'react';
import svg from '../../../assets/signUp/signUp2.svg';
import styles from './signup2.scss'

const WelcomeSVG = ({
}) => {
  return (
      <img src={svg} alt={"Welcome to LiteFarm"} className={styles.svg} loading={'lazy'}/>
  );
};

export default WelcomeSVG;