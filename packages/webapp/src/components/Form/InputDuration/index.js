import Input, { integerOnKeyDown } from '../Input';
import { Semibold } from '../../Typography';
import styles from './styles.module.scss';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { addDaysToDate, getDateInputFormat, getLocalizedDateString } from '../../../util/moment';

export default function InputDuration({
  label,
  hookFormRegister,
  style,
  startDate,
  hookFormWatch,
  hookFormSetValue,
  dateName,
  errors,
  max,
  min,
  ...props
}) {
  const duration = hookFormWatch(hookFormRegister?.name);
  const date = hookFormWatch(dateName);
  useEffect(() => {
    const maxDuration = max || 999;
    const newDate = getLocalizedDateString(
      addDaysToDate(startDate, duration > maxDuration ? maxDuration : duration),
    );
    setTimeout(() => hookFormSetValue(dateName, duration ? getDateInputFormat(newDate) : null), 0);
  }, [duration, startDate]);

  return (
    <div style={style} className={styles.container}>
      <Input
        size={1}
        type={'number'}
        onKeyDown={integerOnKeyDown}
        label={label}
        hookFormRegister={hookFormRegister}
        errors={errors}
        max={max}
        min={min}
        {...props}
      />
      <div className={styles.dateContainer}>
        {!errors && !!startDate && !isNaN(duration) && duration !== '' && (
          <Semibold>{date}</Semibold>
        )}
      </div>
    </div>
  );
}

InputDuration.prototype = {
  label: PropTypes.string,
  hookFormRegister: PropTypes.string,
  style: PropTypes.object,
  startDate: PropTypes.any.isRequired,
  hookFormWatch: PropTypes.func,
  dateName: PropTypes.string,
  max: PropTypes.number,
  min: PropTypes.number,
  errors: PropTypes.string,
};
