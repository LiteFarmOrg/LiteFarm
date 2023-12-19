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
import { BsX } from 'react-icons/bs';
import useIsAboveBreakpoint from '../../hooks/useIsAboveBreakpoint';
import ModalComponent from '../Modals/ModalComponent/v2';
import styles from './style.module.scss';

const Drawer = ({
  title,
  isOpen,
  onClose,
  children,
  buttonGroup,
  classes = {
    modal: '',
    drawer: '',
    backdrop: '',
    header: '',
    content: '',
  },
  fullHeight,
  responsiveModal = true,
}) => {
  const isAboveBreakPoint = useIsAboveBreakpoint(`(min-width: 768px)`);

  return isAboveBreakPoint && responsiveModal ? (
    isOpen && (
      <ModalComponent
        className={classes.modal}
        title={title}
        titleClassName={styles.title}
        dismissModal={onClose}
        buttonGroup={buttonGroup}
      >
        <div className={styles.modalContent}>{children}</div>
      </ModalComponent>
    )
  ) : (
    <>
      <div
        className={clsx(styles.backdrop, isOpen ? styles.openC : '', classes.drawerBackdrop)}
        onClick={onClose}
      ></div>
      <div
        className={clsx(
          styles.drawer,
          fullHeight && styles.fullHeight,
          isOpen ? styles.openD : '',
          classes.drawer,
        )}
      >
        <div className={clsx(styles.header, classes.header)}>
          <div className={styles.title}>{title}</div>
          <div className={styles.close} onClick={onClose}>
            <BsX />
          </div>
        </div>
        <div className={clsx(styles.drawerContent, classes.content)}>
          {children} {buttonGroup}
        </div>
      </div>
    </>
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
