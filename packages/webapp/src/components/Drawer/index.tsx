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
import ModalComponent from '../Modals/ModalComponent/v2';
import styles from './style.module.scss';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';

interface DrawerProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonGroup?: React.ReactNode;
  fullHeight?: boolean;
  responsiveModal?: boolean;
  addBackdrop?: boolean;
  classes?: {
    modal?: string;
    drawer?: string;
    drawerBackdrop?: string;
    drawerHeader?: string;
    drawerContent?: string;
    drawerContainer?: string;
  };
}

const Drawer = ({
  title,
  isOpen,
  onClose,
  children,
  buttonGroup,
  classes = {
    modal: '',
    drawer: '',
    drawerBackdrop: '',
    drawerHeader: '',
    drawerContent: '',
    drawerContainer: '',
  },
  fullHeight,
  responsiveModal = true,
  addBackdrop = true,
}: DrawerProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  if (!isOpen) {
    return null;
  }

  return isDesktop && responsiveModal ? (
    <ModalComponent
      className={classes.modal}
      title={title}
      titleClassName={styles.title}
      dismissModal={onClose}
      buttonGroup={buttonGroup}
    >
      <div className={styles.modalContent}>{children}</div>
    </ModalComponent>
  ) : (
    <>
      {addBackdrop && (
        <div
          className={clsx(
            styles.drawerBackdrop,
            isOpen ? styles.openC : '',
            classes.drawerBackdrop,
          )}
          onClick={onClose}
        ></div>
      )}
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
    </>
  );
};

Drawer.propTypes = {
  title: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
  buttonGroup: PropTypes.node,
  fullHeight: PropTypes.bool,
  classes: PropTypes.object,
  responsiveModal: PropTypes.bool,
};

export default Drawer;
