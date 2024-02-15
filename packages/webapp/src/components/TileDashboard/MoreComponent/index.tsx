import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ClickAwayListener } from '@mui/material';
import styles from './styles.module.scss';
import { DashboardTile } from '../DashboardTile';
import { ReactComponent as ChevronDown } from '../../../assets/images/animals/chevron-down.svg';
import TextButton from '../../Form/Button/TextButton';
import { IconCountTile, FilterId } from '..';

interface MoreComponentProps {
  moreIconTiles: IconCountTile[];
  selectedFilterIds?: FilterId[];
  className?: string;
}

export const MoreComponent = ({
  moreIconTiles,
  selectedFilterIds,
  className = '',
}: MoreComponentProps) => {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  // Selected state for the more button
  const atLeastOneSelected = moreIconTiles.some((tile) => selectedFilterIds?.includes(tile.id));

  return (
    <div className={clsx(styles.moreContainer, className)}>
      <TextButton
        className={clsx(
          styles.moreButton,
          atLeastOneSelected && styles.selected,
          isOpen && styles.open,
        )}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{t('TABLE.NUMBER_MORE', { number: moreIconTiles.length })} </span>
        <ChevronDown />
      </TextButton>
      {isOpen && (
        <ClickAwayListener onClickAway={() => setIsOpen(false)}>
          <div className={styles.moreContent}>
            {moreIconTiles.map((item, index) => (
              <div key={index} className={clsx(styles.contentItem)}>
                <DashboardTile
                  key={index}
                  {...item}
                  isSelected={selectedFilterIds?.includes(item.id)}
                />
              </div>
            ))}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};
