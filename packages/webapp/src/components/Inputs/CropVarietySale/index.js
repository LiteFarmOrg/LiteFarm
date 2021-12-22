import React from 'react';
import styles from './styles.module.scss';
import Unit from '../Unit';
import { Fieldset } from 'react-redux-form';

const CropVarietySale = ({ label, model, quantityModel, valueModel, unit }) => {
  return (
    <Fieldset model={`.${model}`} className={styles.buttonContainer}>
      <div className={styles.button}>
        <label className={styles.leftColumn}>{label}</label>
        <div className={styles.middleColumn}>
          <Unit hideLabel model={quantityModel} type={unit} validate={true} />
        </div>
        <div className={styles.rightcolumn}>
          <Unit hideLabel model={valueModel} validate={true} />
        </div>
      </div>
    </Fieldset>
  );
};

export default CropVarietySale;
