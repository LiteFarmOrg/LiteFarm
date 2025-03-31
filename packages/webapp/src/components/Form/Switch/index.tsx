/*
 *  Copyright 2022-2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { ChangeEvent, ReactNode } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { Main } from '../../Typography';

interface SwitchProps {
  checked?: boolean;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  label?: ReactNode | string;
  leftLabel?: ReactNode | string;
  isToggleVariant?: boolean;
  hideInnerText?: boolean;
  disabled?: boolean;
  classes?: {
    container?: string;
  };
}

const Switch = ({
  checked,
  onChange,
  label,
  leftLabel,
  isToggleVariant,
  hideInnerText,
  disabled,
  classes,
  ...props
}: SwitchProps) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.container, classes?.container)} {...props}>
      {leftLabel && <Main>{leftLabel}</Main>}
      <label className={styles.switch}>
        <input onChange={onChange} checked={checked} type="checkbox" disabled={disabled} />
        <span
          className={clsx(
            styles.track,
            isToggleVariant && styles.toggle,
            disabled && styles.disabled,
            (hideInnerText || isToggleVariant) && styles.hideInnerText,
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
