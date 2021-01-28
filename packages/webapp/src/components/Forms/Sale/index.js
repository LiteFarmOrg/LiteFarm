import Text from '../../Inputs/Text';
import styles from './styles.scss';
import { Control, Errors, Form } from 'react-redux-form';
import DropDown from '../../Inputs/DropDown';
import CropSale from '../../Inputs/CropSale';
import React from 'react';
import footerStyles from '../../../components/LogFooter/styles.scss';

const SaleForm = ({
  currencySymbol,
  cropOptions,
  chosenOptions,
  handleChooseCrop,
  model,
  onSubmit,
  quantityUnit,
  footerText,
  footerOnClick,
}) => {
  return (
    <Form model={model} onSubmit={(val) => onSubmit(val)}>
      <Text title="Customer Name" model=".name" validators={{ required: (val) => val }} />
      <Errors
        className="required"
        model=".name"
        show={{ touched: true, focus: false }}
        messages={{
          required: 'Required',
        }}
      />
      <div className={styles.defaultFormDropDown}>
        <label>Crop</label>
        <Control
          component={DropDown}
          options={cropOptions}
          searchable={true}
          isMulti={true}
          placeholder="select crop"
          model=".fieldCrop"
          onChange={(option) => handleChooseCrop(option)}
          validators={{ required: (val) => val && val.length }}
        />
        <Errors
          className="required"
          model=".fieldCrop"
          show={{ touched: true, focus: false }}
          messages={{
            required: 'Required',
          }}
        />
      </div>
      <hr className={styles.thinHr} />
      <div className={styles.banner}>
        <p>Crops</p>
        <p>Quantity</p>
        <p>Total ({currencySymbol})</p>
      </div>
      <hr className={styles.thinHr2} />
      {chosenOptions?.map((c) => {
        return (
          <CropSale
            key={c.label}
            label={c.label}
            model={c.label}
            quantityModel=".quantity_kg"
            valueModel=".value"
            unit={quantityUnit}
          />
        );
      })}
      <div className={footerStyles.bottomContainer}>
        <div className={footerStyles.cancelButton} onClick={() => footerOnClick()}>
          {footerText}
        </div>
        <button className="btn btn-primary">Save</button>
      </div>
    </Form>
  );
};

export default SaleForm;
