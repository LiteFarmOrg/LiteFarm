import Text from '../../Inputs/Text';
import styles from './styles.module.scss';
import { Control, Errors, Form } from 'react-redux-form';
import DropDown from '../../Inputs/DropDown';
import CropVarietySale from '../../Inputs/CropVarietySale';
import React from 'react';
import footerStyles from '../../LogFooter/styles.module.scss';
import { useTranslation } from 'react-i18next';

const SaleForm = ({
  currencySymbol,
  cropVarietyOptions,
  chosenOptions,
  handleChooseCrop,
  model,
  onSubmit,
  quantityUnit,
  footerText,
  footerOnClick,
}) => {
  const { t } = useTranslation();
  return (
    <Form model={model} onSubmit={(val) => onSubmit(val)}>
      <Text
        title={t('SALE.ADD_SALE.CUSTOMER_NAME')}
        model=".name"
        validators={{ required: (val) => val }}
      />
      <Errors
        className="required"
        model=".name"
        show={{ touched: true, focus: false }}
        messages={{
          required: t('SALE.ADD_SALE.CUSTOMER_NAME_REQUIRED'),
        }}
      />
      <div className={styles.defaultFormDropDown}>
        <Control
          label={t('SALE.ADD_SALE.CROP_VARIETY')}
          component={DropDown}
          options={cropVarietyOptions}
          searchable
          isMulti
          placeholder={t('SALE.ADD_SALE.CROP_PLACEHOLDER')}
          model=".managementPlan"
          onChange={(option) => handleChooseCrop(option)}
          validators={{ required: (val) => val && val.length }}
        />
        <Errors
          className="required"
          model=".managementPlan"
          show={{ touched: true, focus: false }}
          messages={{
            required: t('SALE.ADD_SALE.CROP_REQUIRED'),
          }}
        />
      </div>
      <hr className={styles.thinHr} />
      <div className={styles.banner}>
        <p>{t('SALE.ADD_SALE.TABLE_HEADERS.CROP_VARIETIES')}</p>
        <p>{t('SALE.ADD_SALE.TABLE_HEADERS.QUANTITY')}</p>
        <p>{`${t('SALE.ADD_SALE.TABLE_HEADERS.TOTAL')} (${currencySymbol})`}</p>
      </div>
      <hr className={styles.thinHr2} />
      {chosenOptions?.map((c) => {
        return (
          <CropVarietySale
            key={c.label}
            label={c.label}
            model={c.label}
            quantityModel=".quantity"
            valueModel=".value"
            unit={quantityUnit}
          />
        );
      })}
      <div className={footerStyles.bottomContainer}>
        <div className={footerStyles.cancelButton} onClick={() => footerOnClick()}>
          {footerText}
        </div>
        <button className="btn btn-primary">{t('common:SAVE')}</button>
      </div>
    </Form>
  );
};

export default SaleForm;
