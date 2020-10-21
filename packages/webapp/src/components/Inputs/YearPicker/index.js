import React from 'react';
import styles from './styles.scss';
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const YearPicker = ({year, clickLeft, clickRight}) => {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.button}>
        <p onClick={() => clickLeft()}>
          <BsChevronLeft style={{color: '#00756A'}} />
        </p>
        <p>{year}</p>
        <p onClick={() => clickRight()}>
          <BsChevronRight style={{color: '#00756A'}} />
        </p>
      </div>
    </div>
  )
};

export default YearPicker;
