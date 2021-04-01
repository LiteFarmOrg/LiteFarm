import styles from './styles.module.scss';
import React from 'react';
import { Info, Semibold } from '../../../Typography';
import PropTypes from 'prop-types';
import { Modal } from '../../index';
import { VscWarning } from 'react-icons/all';
import { colors } from '../../../../assets/theme';

export default function ModalComponent({
  title,
  icon,
  contents,
  dismissModal,
  buttonGroup,
  children,
  warning,
}) {
  return (
    <Modal dismissModal={dismissModal}>
      <div className={styles.container}>
        <Semibold
          style={{
            color: warning ? colors.red700 : 'var(--teal700)',
            marginBottom: '16px',
            display: 'inline-flex',
            gap: '8px',
          }}
        >
          {icon || (warning && <VscWarning />)} {title}
        </Semibold>
        {contents?.map((line) => (
          <Info>{line}</Info>
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
