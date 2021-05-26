import Input, { integerOnKeyDown } from '../Input';
import { Semibold } from '../../Typography';
import styles from './styles.module.scss';

export default function InputDuration({ label, hookformRegister, style, date }) {
  return (
    <div style={style} className={styles.container}>
      <Input onKeyDown={integerOnKeyDown} label={label} hookformRegister={hookformRegister} />
      <div className={styles.dateContainer}>
        <Semibold>{date}</Semibold>
      </div>
    </div>
  );
}
