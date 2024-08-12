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

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTheme } from '@mui/styles';
import { useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { IconLink, Main } from '../../../Typography';
import Icon from '../../../Icons';
import TextButton from '../../../Form/Button/TextButton';
import { ReactComponent as TrashIcon } from '../../../../assets/images/animals/trash_icon_new.svg';

type BaseFormHeader = {
  type: string;
  breed?: string;
  iconKey: string;
  number: number;
  totalCount: number;
  showRemove?: boolean;
  onRemove: () => void;
  isExpanded: boolean;
  count?: number;
};

type AnimalFormHeader = BaseFormHeader & {
  sex: string;
  isBatch: false;
};

type BatchFormHeader = BaseFormHeader & {
  sex?: never;
  isBatch: true;
};

type AnimalFormHeaderItemProps = AnimalFormHeader | BatchFormHeader;

export const AnimalFormHeaderItem = ({
  type,
  breed = '',
  sex = '',
  count,
  iconKey,
  number,
  totalCount,
  isBatch,
  showRemove = true,
  onRemove,
  isExpanded,
}: AnimalFormHeaderItemProps) => {
  const { t } = useTranslation();
  const [isRemoving, setIsRemoving] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    if (!isExpanded) {
      setIsRemoving(false);
    }
  }, [isExpanded]);

  return (
    <div className={styles.mainContent}>
      <div
        className={clsx(styles.iconWrapper, isMobile && isRemoving && isExpanded && styles.hidden)}
      >
        <Icon iconName={iconKey} className={styles.icon} />
      </div>
      <Main
        className={clsx(styles.infoText, isMobile && isRemoving && isExpanded && styles.hidden)}
      >
        {type}
        {(breed || sex) && ' - '}
        {breed} {sex}
        {!isMobile && isBatch && <span className={styles.countBadge}>{count}</span>}
      </Main>
      <RemoveComponent
        showRemove={showRemove}
        isExpanded={isExpanded}
        isRemoving={isRemoving}
        setIsRemoving={setIsRemoving}
        onRemove={onRemove}
      />
      <Main className={clsx(styles.count, isRemoving && isExpanded && styles.hidden)}>
        {isBatch ? `${t('ANIMAL.BATCH')}: ` : ''}
        {t('ADD_ANIMAL.OUT_OF_COUNT', { animalNumber: number, count: totalCount })}
        {isMobile && isBatch && <span className={styles.countBadge}>{count}</span>}
      </Main>
    </div>
  );
};

interface RemoveComponentProps {
  showRemove: boolean;
  isExpanded: boolean;
  isRemoving: boolean;
  setIsRemoving: React.Dispatch<React.SetStateAction<boolean>>;
  onRemove: () => void;
}

const RemoveComponent = ({
  showRemove,
  isExpanded,
  isRemoving,
  setIsRemoving,
  onRemove,
}: RemoveComponentProps) => {
  const { t } = useTranslation();

  const initiateRemoval = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering expand/collapse
    setIsRemoving(true);
  };

  const cancelRemoval = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRemoving(false);
  };

  return (
    <div className={clsx(styles.remove, isExpanded && showRemove && isRemoving && styles.spanAll)}>
      {showRemove && isExpanded && !isRemoving && (
        <IconLink
          className={styles.removeLink}
          onClick={initiateRemoval}
          icon={<TrashIcon />}
          isIconClickable
          underlined={false}
        >
          {t('common:REMOVE')}
        </IconLink>
      )}
      {isExpanded && showRemove && isRemoving && (
        <div className={clsx(styles.inlineRemoveWarning)}>
          <div className={styles.inlineIconText}>
            <Icon iconName={'TRASH'} className={styles.trashIcon} />
            <Main className={styles.inlineRemoveText}>{t('ADD_ANIMAL.REMOVE_CONFIRM')}</Main>
          </div>
          <div className={styles.inlineButtonContainer}>
            <TextButton className={clsx(styles.inlineButton, styles.yesButton)} onClick={onRemove}>
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
      )}
    </div>
  );
};
