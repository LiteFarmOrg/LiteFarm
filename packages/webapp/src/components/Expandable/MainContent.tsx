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
import { useTranslation } from 'react-i18next';
import { FaCheck } from 'react-icons/fa';
import { InlineWarning as InlineRemoveWarning, RemoveLink } from './InlineRemove';
import { ReactComponent as CircledCheckIcon } from '../../assets/images/check-circle.svg';
import { ReactComponent as WarningIcon } from '../../assets/images/warning.svg';
import styles from './styles.module.scss';

export enum IconType {
  SIMPLE = 'simple',
  DECORATED = 'decorated',
}

const CHECK_ICONS = {
  [IconType.SIMPLE]: <FaCheck className={styles.simpleCheck} />,
  [IconType.DECORATED]: <CircledCheckIcon className={styles.circledCheck} />,
};

export interface MainContentProps {
  isExpanded: boolean;
  iconType?: IconType;
  onRemove?: () => void;
  errorCount?: number;
  children: ReactNode;
}

const MainContent = ({
  isExpanded,
  iconType,
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
    const checkIcon = iconType ? CHECK_ICONS[iconType] : null;

    if (isExpanded && onRemove) {
      if (isRemoving) {
        return <InlineRemoveWarning onRemove={onRemove} onCancel={cancelRemoval} />;
      }

      return <RemoveLink onClick={initiateRemoval} />;
    }

    if (errorCount) {
      return (
        <div className={styles.errorCount}>
          <WarningIcon />
          {errorCount}
        </div>
      );
    }

    return checkIcon;
  };

  return (
    <div className={styles.mainContent}>
      <div className={styles.children}>{children}</div>
      {renderStatusOrAction()}
    </div>
  );
};

export default MainContent;
