import { Title } from '../../Typography';
import React, { useState } from 'react';
import styles from './styles.module.scss';
import { BsChevronLeft } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { CancelButton } from '../CancelButton';

function PageTitle({ title, onGoBack, onCancel, style, cancelModalTitle, label }) {
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  return (
    <div className={styles.container} style={style}>
      <div className={styles.leftContainer} style={{ overflow: 'hidden', wordBreak: 'break-word' }}>
        {onGoBack && (
          <button type={'button'} className={styles.buttonContainer} onClick={onGoBack}>
            <BsChevronLeft style={{ fontSize: '20px' }} />
          </button>
        )}
        <Title style={{ marginBottom: 0 }}>
          {title.length > 77 ? `${title.substring(0, 77).trim()}...` : title}
        </Title>
      </div>
      {!!onCancel && (
        <CancelButton
          onCancel={onCancel}
          cancelModalTitle={cancelModalTitle}
          showConfirmCancelModal={showConfirmCancelModal}
          setShowConfirmCancelModal={setShowConfirmCancelModal}
        />
      )}
      {label}
    </div>
  );
}

export default PageTitle;
PageTitle.prototype = {
  title: PropTypes.string,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  style: PropTypes.object,
};
