import styles from './styles.module.scss';
import React from 'react';
import { Info, Semibold } from '../../../Typography';
import PropTypes from 'prop-types';
import { Modal } from '../../index';
import { VscWarning } from 'react-icons/vsc';

import { colors } from '../../../../assets/theme';
import { FiSlash } from 'react-icons/all';

export default function ModalComponent({
  title,
  icon,
  contents,
  dismissModal,
  buttonGroup,
  children,
  warning,
  error,
}) {
  if (warning && error) {
    console.error('warning and error cannot be true at the same time');
  }
  const color = error ? colors.red700 : warning ? colors.brown700 : colors.teal700;
  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        {!!title && (
          <Semibold
            style={{
              color,
              marginBottom: '16px',
              display: 'inline-flex',
              gap: '8px',
            }}
          >
            {warning && <VscWarning style={{ marginTop: '1px' }} />}
            {error && <FiSlash style={{ marginTop: '1px' }} />}
            {icon && icon}
            {title}
          </Semibold>
        )}
        {contents?.map((line, index) => (
          <Info key={index}>{line}</Info>
        ))}

        {children}
        {!!buttonGroup && <div className={styles.buttonGroup}>{buttonGroup}</div>}
      </div>
    </Modal>
  );
}

ModalComponent.prototype = {
  title: PropTypes.string,
  icon: PropTypes.node,
  contents: PropTypes.arrayOf(PropTypes.string),
  dismissModal: PropTypes.func,
  buttonGroup: PropTypes.node,
  children: PropTypes.node,
  warning: PropTypes.bool,
};
