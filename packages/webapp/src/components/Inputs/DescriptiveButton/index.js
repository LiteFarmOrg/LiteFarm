import React from "react";
import { BsChevronRight } from 'react-icons/bs'
import styles from './styles.scss';

const DescriptiveButton = ({ label, number, onClick }) => {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.button} onClick={onClick}>
        <p>{label}</p>
        <p>{number}</p>
        <BsChevronRight/>
      </div>
    </div>
  )
};

export default DescriptiveButton;
