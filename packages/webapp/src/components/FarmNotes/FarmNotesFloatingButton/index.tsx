/*
 *  Copyright 2026 LiteFarm.org
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

import { useTranslation } from 'react-i18next';
import { ReactComponent as MessageTextSquareIcon } from '../../../assets/images/message-text-square-02.svg';
import styles from './styles.module.scss';

interface FarmNotesFloatingButtonProps {
  onClick: () => void;
  hasUnread: boolean;
}

export default function FarmNotesFloatingButton({
  onClick,
  hasUnread,
}: FarmNotesFloatingButtonProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <button className={styles.button} onClick={onClick} type="button">
        <MessageTextSquareIcon className={styles.icon} />
        <span className={styles.label}>{t('FARM_NOTE.FARM_NOTES')}</span>
      </button>
      {hasUnread && (
        <span className={styles.unreadDot} aria-label={t('FARM_NOTE.HAS_UNREAD_NOTES')} />
      )}
    </div>
  );
}
