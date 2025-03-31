/*
 *  Copyright 2025 LiteFarm.org
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
import TextButton from '../Form/Button/TextButton';
import { IconLink, Main } from '../Typography';
import Icon from '../Icons';
import { ReactComponent as TrashIcon } from '../../assets/images/animals/trash_icon_new.svg';
import styles from './styles.module.scss';

export interface InlineWarningProps {
  onRemove?: (e: React.MouseEvent) => void;
  onCancel?: (e: React.MouseEvent) => void;
}

export const InlineWarning = ({ onRemove, onCancel }: InlineWarningProps) => {
  const { t } = useTranslation();

  return (
    <div className={clsx(styles.inlineRemoveWarning)}>
      <div className={styles.inlineIconText}>
        <Icon iconName={'TRASH'} className={styles.trashIcon} />
        <Main className={styles.inlineRemoveText}>{t('ADD_ANIMAL.REMOVE_CONFIRM')}</Main>
      </div>
      <div className={styles.inlineButtonContainer}>
        <TextButton className={clsx(styles.inlineButton, styles.yesButton)} onClick={onRemove}>
          {t('common:YES')}
        </TextButton>
        <TextButton className={clsx(styles.inlineButton, styles.noButton)} onClick={onCancel}>
          {t('common:NO')}
        </TextButton>
      </div>
    </div>
  );
};

interface RemoveLinkProps {
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const RemoveLink = ({ onClick, className }: RemoveLinkProps) => {
  const { t } = useTranslation();

  return (
    <IconLink
      className={clsx(styles.removeLink, className)}
      onClick={onClick}
      icon={<TrashIcon />}
      isIconClickable
      underlined={false}
    >
      {t('common:REMOVE')}
    </IconLink>
  );
};
