/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Button from '../../Form/Button';
import styles from './styles.module.scss';

export default function DeleteBox({
  color,
  header,
  headerIcon,
  message,
  onOk,
  onCancel,
  primaryButtonLabel,
}) {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.deleteBox, styles[`${color}Box`])}>
      <h3 className={clsx(styles.deleteBoxTitle, styles[`${color}Title`])}>
        {headerIcon}
        {header}
      </h3>
      <p>{message}</p>
      <div className={styles.deleteBoxButtons}>
        <Button
          type="button"
          data-cy="taskReadOnly-complete"
          color={'secondary'}
          onClick={onCancel}
        >
          {t('common:CANCEL')}
        </Button>
        <Button type="button" data-cy="taskReadOnly-complete" color={color} onClick={onOk}>
          {primaryButtonLabel}
        </Button>
      </div>
    </div>
  );
}
