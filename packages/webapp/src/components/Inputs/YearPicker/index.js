import React from 'react';
import styles from './styles.scss';
import {Glyphicon} from "react-bootstrap";

const YearPicker = ({year, clickLeft, clickRight}) => {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.button}>
        <p onClick={() => clickLeft()}><Glyphicon style={{color: '#00756A'}} glyph='chevron-left'/></p>
        <p>{year}</p>
        <p onClick={() => clickRight()}><Glyphicon style={{color: '#00756A'}} glyph='chevron-right'/></p>
      </div>
    </div>
  )
};

export default YearPicker;
