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
import { ReactNode, CSSProperties } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';

export enum Variant {
  PILL = 'pill',
  UNDERLINE = 'underline',
}

export type BaseTab = {
  label: string;
  format?: (tab: BaseTab, isSelected: boolean) => ReactNode;
};

export type TabProps<T extends BaseTab> = {
  tabs: T[];
  onClick: (tab: T) => void;
  isSelected: (tab: T) => boolean;
  variant?: Variant;
  classes?: { container?: CSSProperties };
  className?: string;
};

export default function Tab<T extends BaseTab>({
  tabs,
  onClick,
  isSelected,
  variant = Variant.PILL,
  classes,
  className = '',
}: TabProps<T>) {
  const variantClassName = styles[variant];

  return (
    <div className={clsx(styles.container, className, variantClassName)} style={classes?.container}>
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={clsx(styles.tab, variantClassName, isSelected(tab) && styles.selected)}
          onClick={() => onClick(tab)}
          id={tab.label + index}
        >
          <span className={styles.tabText}>
            {tab.format ? tab.format(tab, isSelected(tab)) : tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}
