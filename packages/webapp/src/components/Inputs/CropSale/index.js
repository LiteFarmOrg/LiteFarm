import React from 'react';
import styles from './styles.module.scss';
import Unit from '../Unit';
import { Fieldset } from 'react-redux-form';

const CropSale = ({
  label,
  model,
  quantityModel,
  valueModel,
  unit,
  quantityAmount,
  saleAmount,
}) => {
  return (
    <Fieldset model={`.${model}`} className={styles.buttonContainer}>
      <div className={styles.button}>
        <label style={{ flexBasis: '30%' }}>{label}</label>
        <div className={styles.middleColumn}>
          <Unit
            hideLabel
            model={quantityModel}
            type={unit}
            validate={true}
            defaultValue={quantityAmount}
          />
        </div>
        <div className={styles.rightcolumn}>
          <Unit hideLabel model={valueModel} validate={true} defaultValue={saleAmount} />
        </div>
      </div>
    </Fieldset>
  );
};

export default CropSale;
