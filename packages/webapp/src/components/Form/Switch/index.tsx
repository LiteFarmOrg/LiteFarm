import { ChangeEvent } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { Main } from '../../Typography';

interface SwitchProps {
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  leftLabel?: string;
  isToggleVariant?: boolean;
  disabled?: boolean;
}

const Switch = ({
  checked,
  onChange,
  label,
  leftLabel,
  isToggleVariant,
  disabled,
  ...props
}: SwitchProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container} {...props}>
      {leftLabel && <Main>{leftLabel}</Main>}
      <label className={styles.switch}>
        <input onChange={onChange} checked={checked} type="checkbox" disabled={disabled} />
        <span
          className={clsx(
            styles.track,
            styles.round,
            isToggleVariant && styles.toggle,
            disabled && styles.disabled,
          )}
        >
          <span className={clsx(styles.innerText, styles.yes)}>{t('common:YES')}</span>
          <span className={clsx(styles.innerText, styles.no)}>{t('common:NO')}</span>
        </span>
      </label>
      {label && <Main>{label}</Main>}
    </div>
  );
};

export default Switch;
