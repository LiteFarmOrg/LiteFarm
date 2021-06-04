import Input, { integerOnKeyDown } from '../Input';
import { Semibold } from '../../Typography';
import styles from './styles.module.scss';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { getLanguageFromLocalStorage } from '../../../util';
import PropTypes from 'prop-types';
import { getDateInputFormat } from '../../LocationDetailLayout/utils';

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
  const date = useMemo(() => {
    const maxDuration = max || 999;
    return moment(startDate)
      .add(duration > maxDuration ? maxDuration : duration, 'days')
      .locale(getLanguageFromLocalStorage())
      .format('MMMM DD, YYYY');
  }, [duration, startDate]);
  useEffect(() => {
    hookFormSetValue &&
      dateName &&
      date &&
      hookFormSetValue(dateName, duration ? getDateInputFormat(date) : null);
  }, [date, duration]);
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
