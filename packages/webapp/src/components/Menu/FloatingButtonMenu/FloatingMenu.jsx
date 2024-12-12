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
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import styles from './styles.module.scss';

const FloatingMenu = forwardRef(({ options, classes = {}, onCloseMenu, ...props }, ref) => {
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
});

FloatingMenu.displayName = 'FloatingMenu';
FloatingMenu.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      onClick: PropTypes.func,
    }),
  ),
  classes: PropTypes.shape({
    menuList: PropTypes.string,
    menuItem: PropTypes.string,
  }),
  onCloseMenu: PropTypes.func,
};

export default FloatingMenu;
