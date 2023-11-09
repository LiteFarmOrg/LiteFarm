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

import clsx from 'clsx';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { BsX } from 'react-icons/bs';
import ModalComponent from '../Modals/ModalComponent/v2';
import styles from './style.module.scss';

const Drawer = ({ title, isOpen, onClose, children, buttonGroup, className }) => {
  const [isAboveBreakPoint, setIsAboveBreakPoint] = useState(null);

  useEffect(() => {
    const mqString = `(min-width: 768px)`;
    const media = matchMedia(mqString);

    setIsAboveBreakPoint(media.matches);

    media.addEventListener('change', (e) => setIsAboveBreakPoint(e.matches));

    return () => {
      media.removeEventListener('change', setIsAboveBreakPoint);
    };
  }, []);

  return isAboveBreakPoint ? (
    isOpen && (
      <ModalComponent
        className={className}
        title={title}
        titleClassName={styles.title}
        dismissModal={onClose}
        buttonGroup={buttonGroup}
      >
        <div className={styles.modalContent}>{children}</div>
      </ModalComponent>
    )
  ) : (
    <div className={className}>
      <div
        className={clsx(styles.drawerBackdrop, isOpen ? styles.openC : '')}
        onClick={onClose}
      ></div>
      <div className={clsx(styles.drawer, isOpen ? styles.openD : '')}>
        <div className={styles.header}>
          <div className={styles.title}>{title}</div>
          <div className={styles.close} onClick={onClose}>
            <BsX />
          </div>
        </div>
        <div className={styles.drawerContent}>
          {children} {buttonGroup}
        </div>
      </div>
    </div>
  );
};

Drawer.prototype = {
  title: PropTypes.string,
  isOpen: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  buttonGroup: PropTypes.node,
};

export default Drawer;
