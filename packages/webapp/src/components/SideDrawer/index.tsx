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

import clsx from 'clsx';
import { IconButton } from '@mui/material';
import styles from './style.module.scss';
import { Close } from '@mui/icons-material';

interface SideDrawerProps {
  title: string | React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonGroup?: React.ReactNode;
  fullHeight?: boolean;
  classes?: {
    drawer?: string;
    drawerBackdrop?: string;
    drawerHeader?: string;
    drawerContent?: string;
    drawerContainer?: string;
  };
}

const SideDrawer = ({
  title,
  isOpen,
  onClose,
  children,
  buttonGroup,
  classes = {
    drawer: '',
    drawerBackdrop: '',
    drawerHeader: '',
    drawerContent: '',
    drawerContainer: '',
  },
  fullHeight,
}: SideDrawerProps) => {
  return (
    <div
      className={clsx(
        styles.drawer,
        fullHeight && styles.fullHeight,
        isOpen ? styles.openD : '',
        classes.drawerContainer,
      )}
    >
      <div className={clsx(styles.header, classes.drawerHeader)}>
        <div className={styles.title}>{title}</div>
        <IconButton className={styles.close} onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <div className={clsx(styles.drawerContent, classes.drawerContent)}>
        {children} {buttonGroup}
      </div>
    </div>
  );
};

export default SideDrawer;
