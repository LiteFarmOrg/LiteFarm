import Input, { integerOnKeyDown } from '../Input';
import { Semibold } from '../../Typography';
import styles from './styles.module.scss';
import moment from 'moment';
import { useMemo } from 'react';
import { getLanguageFromLocalStorage } from '../../../util';

export default function InputDuration({
  label,
  hookFormRegister,
  style,
  startDate,
  hookformWatch,
}) {
  const duration = hookformWatch(hookFormRegister?.name);
  const date = useMemo(() => {
    return moment(startDate)
      .add(duration, 'days')
      .locale(getLanguageFromLocalStorage())
      .format('MMMM DD, YYYY');
  }, [duration, startDate]);
  return (
    <div style={style} className={styles.container}>
      <Input
        size={1}
        type={'number'}
        onKeyDown={integerOnKeyDown}
        label={label}
        hookFormRegister={hookFormRegister}
      />
      <div className={styles.dateContainer}>
        <Semibold>{isNaN(duration) || duration === '' ? '' : date}</Semibold>
      </div>
    </div>
  );
}
