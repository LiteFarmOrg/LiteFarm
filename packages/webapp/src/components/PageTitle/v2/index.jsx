import { Title } from '../../Typography';
import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';
import { CancelButton } from '../CancelButton';
import { ReactComponent as GreyHeaderChevron } from '../../../assets/images/header-chevron-left.svg';

function PageTitle({ title, onGoBack, onCancel, style, label, classNames = {} }) {
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  return (
    <div className={clsx(styles.container, classNames.wrapper)} style={style}>
      <div className={styles.leftContainer} style={{ overflow: 'hidden', wordBreak: 'break-word' }}>
        {onGoBack && (
          <button type={'button'} className={styles.buttonContainer} onClick={onGoBack}>
            <GreyHeaderChevron />
          </button>
        )}
        <Title className={styles.title}>
          {title.length > 77 ? `${title.substring(0, 77).trim()}...` : title}
        </Title>
      </div>
      {!!onCancel && (
        <CancelButton
          onCancel={onCancel}
          showConfirmCancelModal={showConfirmCancelModal}
          setShowConfirmCancelModal={setShowConfirmCancelModal}
        />
      )}
      {label}
    </div>
  );
}

export default PageTitle;

PageTitle.propTypes = {
  title: PropTypes.string,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  style: PropTypes.object,
  label: PropTypes.node,
  classNames: PropTypes.shape({
    wrapper: PropTypes.string,
  }),
};
