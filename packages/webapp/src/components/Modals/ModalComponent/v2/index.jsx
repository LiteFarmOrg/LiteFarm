import PropTypes from 'prop-types';
import React from 'react';
import { VscWarning } from 'react-icons/vsc';
import { Info, Semibold } from '../../../Typography';
import { Modal } from '../../index';
import styles from './styles.module.scss';

import clsx from 'clsx';
import { FiSlash } from 'react-icons/fi';
import Infoi from '../../../Tooltip/Infoi';
import { IconButton } from '@mui/material';
import { BsX } from 'react-icons/bs';
import { Close } from '@mui/icons-material';

export default function ModalComponent({
  title,
  titleClassName,
  icon,
  contents,
  dismissModal,
  buttonGroup,
  children,
  warning,
  error,
  tooltipContent,
}) {
  if (warning && error) {
    console.error('warning and error cannot be true at the same time');
  }
  let titleColorClass = '';
  if (error) {
    titleColorClass = styles.error;
  }
  if (warning) {
    titleColorClass = styles.warning;
  }
  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <div className={styles.header}>
          {!!title && (
            <Semibold className={clsx([styles.title, titleColorClass, titleClassName])}>
              {warning && <VscWarning style={{ marginTop: '1px' }} />}
              {error && <FiSlash style={{ marginTop: '1px' }} />}
              {icon && icon}
              {title}
              {tooltipContent && (
                <>
                  {' '}
                  <Infoi
                    style={{ fontSize: '18px', transform: 'translateY(3px)' }}
                    content={tooltipContent}
                  />
                </>
              )}
            </Semibold>
          )}
          <IconButton onClick={dismissModal} className={styles.dismissButton}>
            <Close />
          </IconButton>
        </div>
        {contents?.map((line, index) => (
          <Info key={index}>{line}</Info>
        ))}

        {children}
        {!!buttonGroup && <div className={styles.buttonGroup}>{buttonGroup}</div>}
      </div>
    </Modal>
  );
}

ModalComponent.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.node,
  contents: PropTypes.arrayOf(PropTypes.string),
  dismissModal: PropTypes.func,
  buttonGroup: PropTypes.node,
  children: PropTypes.node,
  warning: PropTypes.bool,
  tooltipContent: PropTypes.string,
  titleClassName: PropTypes.string,
  className: PropTypes.string,
  error: PropTypes.bool,
};
