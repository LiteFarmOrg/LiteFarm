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

import { ReactNode, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import TextButton from '../Form/Button/TextButton';
import { IconLink, Main } from '../Typography';
import Icon from '../Icons';
import { ReactComponent as TrashIcon } from '../../assets/images/animals/trash_icon_new.svg';
import { ReactComponent as CheckIcon } from '../../assets/images/check-circle.svg';
import { ReactComponent as WarningIcon } from '../../assets/images/warning.svg';
import styles from './styles.module.scss';

interface MainContentProps {
  isExpanded: boolean;
  isRemovable: boolean;
  onRemove: () => void;
  errorCount: number;
  children: ReactNode;
}

const MainContent = ({
  isExpanded,
  isRemovable,
  onRemove,
  errorCount,
  children,
}: MainContentProps) => {
  const { t } = useTranslation();
  const [isRemoving, setIsRemoving] = useState(false);

  const initiateRemoval = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering expand/collapse
    setIsRemoving(true);
  };

  const cancelRemoval = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(false);
  };

  const renderStatusOrAction = () => {
    if (isExpanded) {
      if (isRemoving) {
        return (
          <div className={clsx(styles.inlineRemoveWarning)}>
            <div className={styles.inlineIconText}>
              <Icon iconName={'TRASH'} className={styles.trashIcon} />
              <Main className={styles.inlineRemoveText}>{t('ADD_ANIMAL.REMOVE_CONFIRM')}</Main>
            </div>
            <div className={styles.inlineButtonContainer}>
              <TextButton
                className={clsx(styles.inlineButton, styles.yesButton)}
                onClick={onRemove}
              >
                {t('common:YES')}
              </TextButton>
              <TextButton
                className={clsx(styles.inlineButton, styles.noButton)}
                onClick={cancelRemoval}
              >
                {t('common:NO')}
              </TextButton>
            </div>
          </div>
        );
      }

      return isRemovable ? (
        <IconLink
          className={styles.removeLink}
          onClick={initiateRemoval}
          icon={<TrashIcon />}
          isIconClickable
          underlined={false}
        >
          {t('common:REMOVE')}
        </IconLink>
      ) : null;
    }

    return errorCount ? (
      <div className={styles.errorCount}>
        <WarningIcon />
        {errorCount}
      </div>
    ) : (
      <CheckIcon className={styles.check} />
    );
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.children}>{children}</div>
      {renderStatusOrAction()}
    </div>
  );
};

export default MainContent;
