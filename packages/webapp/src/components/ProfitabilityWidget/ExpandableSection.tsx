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

import clsx from 'clsx';
import { ReactNode } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import styles from './styles.module.scss';

export interface ExpandableSectionProps {
  isExpanded: boolean;
  onToggle: () => void;
  expandedLabel: string;
  collapsedLabel: string;
  children: ReactNode;
}

const ExpandableSection = ({
  isExpanded,
  onToggle,
  expandedLabel,
  collapsedLabel,
  children,
}: ExpandableSectionProps) => {
  const Chevron = isExpanded ? KeyboardArrowUpIcon : KeyboardArrowDownIcon;
  return (
    <div className={clsx(styles.expandableSection, isExpanded && styles.expanded)}>
      <button type="button" className={styles.expandableHeader} onClick={onToggle}>
        <span>{isExpanded ? expandedLabel : collapsedLabel}</span>
        <span className={styles.expandableChevron}>
          <Chevron fontSize="small" htmlColor="#0669e1" />
        </span>
      </button>
      {isExpanded && <div className={styles.expandableBody}>{children}</div>}
    </div>
  );
};

export default ExpandableSection;
