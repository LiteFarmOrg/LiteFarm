/*
 *  Copyright 2023 LiteFarm.org
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
import React, { forwardRef } from 'react';
import clsx from 'clsx';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import styles from './styles.module.scss';

export type FloatingMenuProps = {
  options: { label: React.ReactNode; onClick: () => void }[];
  classes?: { menuList?: string; menuItem?: string };
  onCloseMenu?: () => void;
};

const FloatingMenu = forwardRef<HTMLUListElement, FloatingMenuProps>(
  ({ options, classes = {}, onCloseMenu, ...props }, ref) => {
    return (
      <MenuList ref={ref} className={clsx(styles.menuList, classes.menuList)} {...props}>
        {options.map(({ label, onClick }, index) => {
          return (
            <MenuItem
              key={index}
              onClick={() => {
                onClick();
                onCloseMenu?.();
              }}
              className={clsx(styles.menuItem, classes.menuItem)}
            >
              {label}
            </MenuItem>
          );
        })}
      </MenuList>
    );
  },
);

FloatingMenu.displayName = 'FloatingMenu';

export default FloatingMenu;
