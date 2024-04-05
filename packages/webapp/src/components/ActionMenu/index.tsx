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
import Icon from '../Icons';
import styles from './styles.module.scss';

interface action {
  label: string;
  onClick: () => void;
}

interface iconAction extends action {
  iconName: string;
}

export interface ActionMenuProps {
  headerLeftText?: string;
  textActions?: action[];
  iconActions: iconAction[];
}

const ActionMenu = ({ headerLeftText, textActions = [], iconActions }: ActionMenuProps) => {
  // If the className is not yet supported, ensure to add corresponding styles for the widths
  // of the component and each iconGroup to the SCSS file.
  const iconCountClassName = styles[`iconCount_${iconActions.length}`];

  return (
    <div className={clsx(styles.actionMenu, iconCountClassName)}>
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
        {iconActions.map(({ iconName, label, onClick }) => {
          return (
            <div key={label} className={clsx(styles.iconGroup, iconCountClassName)}>
              <TextButton onClick={onClick}>
                <Icon iconName={iconName} className={styles.icon} />
              </TextButton>
              <div className={styles.iconLabel}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionMenu;
