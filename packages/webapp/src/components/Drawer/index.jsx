/*
 *  Copyright (c) 2023 LiteFarm.org
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

import React from 'react';
import PropTypes from 'prop-types';
import styles from './style.module.scss';
import clsx from 'clsx';
import { BsX } from 'react-icons/bs';

const Drawer = ({ title, isOpen, onClose, children }) => {
  return (
    <div className={clsx(styles.drawerContainer, isOpen ? styles.openC : '')}>
      <div className={styles.drawerBackdrop} onClick={onClose}></div>
      <div className={clsx(styles.drawer, isOpen ? styles.openD : '')}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <div className={styles.close} onClick={onClose}>
            <BsX />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

Drawer.prototype = {
  title: PropTypes.string,
  isOpen: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node,
};

export default Drawer;
