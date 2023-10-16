import React from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { Error } from '../../Typography';
import Input from '../Input';
import { useWatch } from 'react-hook-form';
import InfoBoxComponent from '../../InfoBoxComponent';

export const FROM_DATE = 'from_date';
export const TO_DATE = 'to_date';

const DateRangePicker = ({
  register,
  getValues,
  control,
  className,
  fromProps = {},
  toProps = {},
  ...props
}) => {
  const { t } = useTranslation();

  const fromDateRegister = register?.(FROM_DATE, {
    required: true,
    validate: {
      beforeToDate: (v) => v < getValues(TO_DATE),
    },
  });
  const toDateRegister = register?.(TO_DATE, {
    required: true,
    validate: {
      afterFromDate: (v) => v > getValues(FROM_DATE),
    },
  });

  const pickersWithToolTips = ['Estimated Revenue Date Range'];

  return (
    <div className={className} {...props}>
      {pickersWithToolTips.includes(className) && (
        <InfoBoxComponent
          customStyle={{ float: 'right' }}
          title={t('DATE_RANGE_PICKER.REVENUE_HELP_TITLE')}
          body={t('DATE_RANGE_PICKER.REVENUE_HELP_BODY')}
        />
      )}
      <div className={styles.dateContainer}>
        <Input
          label={t('DATE_RANGE_PICKER.FROM')}
          type="date"
          hookFormRegister={fromDateRegister}
          classes={{
            container: { flex: '1' },
          }}
          {...fromProps}
        />
        <div className={styles.dateDivider} />
        <Input
          label={t('DATE_RANGE_PICKER.TO')}
          type="date"
          hookFormRegister={toDateRegister}
          classes={{
            container: { flex: '1' },
          }}
          {...toProps}
        />
      </div>
      {control && (
        <DateError control={control} errorMessage={t('DATE_RANGE_PICKER.TO_MUST_BE_AFTER_FROM')} />
      )}
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
  register: PropTypes.func.isRequired,
  getValues: PropTypes.func.isRequired,
  control: PropTypes.object.isRequired,
  className: PropTypes.string,
};

export default DateRangePicker;
