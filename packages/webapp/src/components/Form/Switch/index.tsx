import { ChangeEvent } from 'react';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { Main } from '../../Typography';

interface SwitchProps {
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  leftLabel?: string;
}

const Switch = ({ checked, onChange, label, leftLabel, ...props }: SwitchProps) => {
  return (
    <div className={styles.container} {...props}>
      {leftLabel && <Main>{leftLabel}</Main>}
      <label className={styles.switch}>
        <input onChange={onChange} checked={checked} type="checkbox" />
        <span className={clsx(styles.slider, styles.round)} />
      </label>
      {label && <Main>{label}</Main>}
    </div>
  );
};

export default Switch;
