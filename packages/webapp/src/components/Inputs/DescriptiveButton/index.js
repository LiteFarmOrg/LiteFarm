import React from "react";
import { Glyphicon } from 'react-bootstrap';
import styles from './styles.scss';

const DescriptiveButton = ({label, number, onClick}) => {
  return (
    <div className={styles.buttonContainer}>
      <div className={styles.button} onClick={onClick}>
        <p>{label}</p>
        <p>{number}</p>
        <Glyphicon glyph='chevron-right'/>
      </div>
    </div>
  )
};

export default DescriptiveButton;
