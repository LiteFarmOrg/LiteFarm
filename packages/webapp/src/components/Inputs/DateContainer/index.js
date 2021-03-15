import React from 'react';
import Input from '../../Form/Input';
import moment from 'moment';
import { Text } from '../../Typography';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
function DateContainer({
  date,
  onDateChange,
  placeholder,
  custom,
  classes = {},
  defaultDate,
  label,
}) {
  const onChange = (e) => {
    onDateChange(moment(e.target.value));
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'flex-row',
        width: '100%',
        minWidth: '150px',
        marginBottom: '16px',
        ...classes.container,
      }}
    >
      {placeholder && (
        <>
          <Text style={{ display: 'flex', alignItems: 'center', flexBasis: '35%', flexShrink: 0 }}>
            {placeholder}
          </Text>
          <div style={{ flexGrow: 1 }} />
        </>
      )}
      <Input
        label={label}
        value={defaultDate ? defaultDate : date.format('YYYY-MM-DD')}
        type={'date'}
        onChange={onChange}
        style={{ flexGrow: 1 }}
        classes={{
          container: { flexGrow: 1, minWidth: '150px' },
          input: { minWidth: '150px', backgroundColor: 'transparent', flexGrow: 1, width: '100%' },
        }}
      />
    </div>
  );
}

export default DateContainer;

export function FromToDateContainer({ onStartDateChange, onEndDateChange, startDate, endDate }) {
  const { t } = useTranslation();
  return (
    <div className={styles.fromToContainer}>
      <DateContainer
        label={t('LOG_COMMON.FROM')}
        custom={true}
        date={startDate}
        onDateChange={onStartDateChange}
      />
      <DateContainer
        label={t('LOG_COMMON.TO')}
        custom={true}
        date={endDate}
        onDateChange={onEndDateChange}
      />
    </div>
  );
}
