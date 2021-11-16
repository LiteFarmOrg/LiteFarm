import { Semibold } from '../../Typography';
import React from 'react';
import styles from './styles.module.scss';
import { BsChevronLeft } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { colors } from '../../../assets/theme';
import ProgressBar from '../../ProgressBar';
import { CancelButton } from '../CancelButton';

function MultiStepPageTitle({
  title,
  onGoBack,
  onCancel,
  style,
  value,
  cancelModalTitle,
  showProgressBar,
}) {
  return (
    <div style={style}>
      <div className={styles.titleContainer}>
        <div className={styles.leftContainer}>
          {onGoBack && (
            <button type={'button'} className={styles.buttonContainer} onClick={onGoBack}>
              <BsChevronLeft style={{ fontSize: '20px' }} />
            </button>
          )}
          <Semibold style={{ marginBottom: 0, color: colors.grey600 }}>{title}</Semibold>
        </div>
        {onCancel && <CancelButton onCancel={onCancel} cancelModalTitle={cancelModalTitle} />}
      </div>
      <ProgressBar value={value} />
    </div>
  );
}

export default MultiStepPageTitle;
MultiStepPageTitle.prototype = {
  title: PropTypes.string,
  onGoBack: PropTypes.func,
  onCancel: PropTypes.func,
  style: PropTypes.object,
  value: PropTypes.number,
};
