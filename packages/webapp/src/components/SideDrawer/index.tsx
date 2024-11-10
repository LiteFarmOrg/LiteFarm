import clsx from 'clsx';
import PropTypes from 'prop-types';
import ModalComponent from '../Modals/ModalComponent/v2';
import styles from './style.module.scss';
import { IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';

interface SideDrawerProps {
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

const SideDrawer = ({
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
}: SideDrawerProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <div
      className={clsx(
        !isDesktop ? styles.mobile : '',
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

SideDrawer.propTypes = {
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

export default SideDrawer;
