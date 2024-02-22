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

import { ReactNode } from 'react';
import clsx from 'clsx';
import TextButton from '../Form/Button/TextButton';
import styles from './styles.module.scss';

type action = {
  label: string;
  onClick: () => void;
};

type iconAction = action & {
  icon: ReactNode;
};

export interface ActionMenuProps {
  textActions?: action[];
  iconActions: iconAction[];
  headerLeftText?: string;
}

/**
 * Floating action menu.
 * To center the component within its parent element, rather than centering it relative to the browser window,
 * apply "position: relative" to the parent element.
 */
const ActionMenu = ({ textActions = [], iconActions, headerLeftText }: ActionMenuProps) => {
  // SCSS file should be checked if the className is supported
  const widthClassName = styles[`iconCount_${iconActions.length}`];

  return (
    <div className={clsx(styles.actionMenu, widthClassName)}>
      <div className={styles.header}>
        <div className={styles.headerLeftText}>{headerLeftText}</div>
        <div className={styles.textButtons}>
          {textActions.map(({ label, onClick }) => {
            return (
              <TextButton key={label} onClick={onClick}>
                {label}
              </TextButton>
            );
          })}
        </div>
      </div>
      <div className={styles.iconButtons}>
        {iconActions.map(({ icon, label, onClick }) => {
          return (
            <div key={label} className={clsx(styles.iconGroup, widthClassName)}>
              <TextButton onClick={onClick}>{icon}</TextButton>
              <div className={styles.iconLabel}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionMenu;
