import { Semibold } from '../../Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { BsChevronLeft } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { colors } from '../../../assets/theme';
import ProgressBar from '../../ProgressBar';

function MultiStepPageTitle({ title, onGoBack, onCancel, style, value }) {
  const { t } = useTranslation();
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
        {onCancel && (
          <Semibold sm style={{ color: colors.teal700 }} onClick={onCancel}>
            {t('common:CANCEL')}
          </Semibold>
        )}
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
