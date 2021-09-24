import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Error } from '../../Typography';
import Input from '../Input';
import { useWatch } from 'react-hook-form';

const FROM_DATE = 'from_date';
const TO_DATE = 'to_date';

const DateRangePicker = ({ register, getValues, control, className, ...props }) => {
  const { t } = useTranslation();

  const fromDateRegister = register(FROM_DATE, {
    required: true,
    validate: {
      beforeToDate: (v) => v < getValues(TO_DATE),
    },
  });
  const toDateRegister = register(TO_DATE, {
    required: true,
    validate: {
      afterFromDate: (v) => v > getValues(FROM_DATE),
    },
  });

  return (
    <div className={className} {...props}>
      <div className={styles.dateContainer}>
        <Input
          label={t('CERTIFICATIONS.FROM')}
          type="date"
          hookFormRegister={fromDateRegister}
          classes={{
            container: { flex: '1' },
          }}
        />
        <div className={styles.dateDivider} />
        <Input
          label={t('CERTIFICATIONS.TO')}
          type="date"
          hookFormRegister={toDateRegister}
          classes={{
            container: { flex: '1' },
          }}
        />
      </div>
      <DateError control={control} errorMessage={t('CERTIFICATIONS.TO_MUST_BE_AFTER_FROM')} />
    </div>
  );
};

const DateError = ({ control, errorMessage }) => {
  const from_date = useWatch({ control, name: FROM_DATE });
  const to_date = useWatch({ control, name: TO_DATE });
  const areDatesProperlySet =
    (from_date && to_date && from_date < to_date) || !from_date || !to_date;

  return <>{!areDatesProperlySet && <Error>{errorMessage}</Error>}</>;
};

DateRangePicker.prototype = {
  isDropDown: PropTypes.bool,
};

export default DateRangePicker;
