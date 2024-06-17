/*
 *  Copyright 2024 LiteFarm.org
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

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Button from '../Button';
import { Info } from '../../Typography';
import styles from './styles.module.scss';

export interface InFormButtonsProps {
  isDisabled?: boolean;
  statusText?: string;
  confirmText: string;
  informationalText?: string;
  onCancel: () => void;
  onConfirm?: () => void;
  confirmButtonType?: 'button' | 'submit';
}

const InFormButtons = ({
  isDisabled,
  statusText,
  confirmText,
  informationalText,
  onCancel,
  onConfirm,
  confirmButtonType = 'button',
}: InFormButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <div className={styles.buttons}>
        {statusText && <span className={styles.statusText}>{statusText}</span>}
        <Button type="button" color="secondary-cta" className={styles.button} onClick={onCancel}>
          {t('common:CANCEL')}
        </Button>
        <Button
          type={confirmButtonType}
          color="secondary"
          className={clsx(styles.button, styles.confirmButton)}
          onClick={onConfirm}
          disabled={isDisabled}
        >
          {confirmText}
        </Button>
      </div>
      {informationalText && <Info className={styles.informationalText}>{informationalText}</Info>}
    </div>
  );
};

export default InFormButtons;
