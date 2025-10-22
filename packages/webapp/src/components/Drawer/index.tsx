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
import ModalComponent from '../Modals/ModalComponent/v2';
import styles from './style.module.scss';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import TextButton from '../Form/Button/TextButton';

export enum DesktopDrawerVariants {
  DRAWER = 'drawer',
  SIDE_DRAWER = 'sideDrawer',
  MODAL = 'modal',
}

type CommonDrawerProps = {
  title: NonNullable<string | React.ReactNode>;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  buttonGroup?: React.ReactNode;
  fullHeight?: boolean;
  addBackdrop?: boolean;
  classes?: {
    modal?: string;
    drawerBackdrop?: string;
    drawerHeader?: string;
    drawerContent?: string;
    drawerContainer?: string; // applied to all drawers
    desktopSideDrawerContainer?: string;
  };
  closeButtonLabel?: string;
};

type DrawerProps = CommonDrawerProps &
  (
    | {
        desktopVariant?: DesktopDrawerVariants.DRAWER | DesktopDrawerVariants.MODAL;
        desktopSideDrawerDirection?: never;
        isCompactSideMenu?: never;
      }
    | {
        desktopVariant: DesktopDrawerVariants.SIDE_DRAWER;
        desktopSideDrawerDirection?: 'right';
        isCompactSideMenu?: never;
      }
    | {
        desktopVariant: DesktopDrawerVariants.SIDE_DRAWER;
        desktopSideDrawerDirection: 'left';
        isCompactSideMenu: boolean;
      }
  );

const Drawer = ({
  title,
  isOpen,
  onClose,
  children,
  buttonGroup,
  classes = {
    modal: '',
    drawerBackdrop: '',
    drawerHeader: '',
    drawerContent: '',
    drawerContainer: '',
    desktopSideDrawerContainer: '',
  },
  fullHeight,
  desktopVariant = DesktopDrawerVariants.MODAL,
  desktopSideDrawerDirection = 'right',
  isCompactSideMenu,
  addBackdrop = true,
  closeButtonLabel,
}: DrawerProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const isDesktopSideDrawer = isDesktop && desktopVariant === DesktopDrawerVariants.SIDE_DRAWER;

  const CloseButton = closeButtonLabel ? TextButton : IconButton;

  return isDesktop && desktopVariant === DesktopDrawerVariants.MODAL && isOpen ? (
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
          isDesktopSideDrawer ? styles.sideDrawer : styles.bottomDrawer,
          isDesktopSideDrawer && styles[desktopSideDrawerDirection],
          desktopSideDrawerDirection === 'left' && isCompactSideMenu
            ? styles.withCompactSideMenu
            : styles.withExpandedSideMenu,
          fullHeight && styles.fullHeight,
          isOpen ? styles.openD : '',
          classes.drawerContainer,
          isDesktopSideDrawer && classes.desktopSideDrawerContainer,
        )}
        inert={!isOpen ? '' : null}
      >
        <div className={clsx(styles.header, classes.drawerHeader)}>
          <div className={styles.title}>{title}</div>
          <CloseButton
            className={clsx(
              styles.closeButton,
              closeButtonLabel ? styles.textButton : styles.iconButton,
            )}
            onClick={onClose}
          >
            {closeButtonLabel && <span>{closeButtonLabel}</span>}
            <Close />
          </CloseButton>
        </div>
        <div className={clsx(styles.drawerContent, classes.drawerContent)}>
          {children} {buttonGroup}
        </div>
      </div>
    </>
  );
};

export default Drawer;
