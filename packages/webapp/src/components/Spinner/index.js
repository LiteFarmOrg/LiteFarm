import React from 'react';
import Loader from '../../assets/images/miscs/loader.svg';
import styles from './styles.scss';

function Spinner() {
  return (
    <img className={styles.loading} src={Loader} alt="loading"/>
  );
}

export default Spinner;