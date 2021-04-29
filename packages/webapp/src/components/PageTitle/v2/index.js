import { Semibold, Title } from '../../Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { BsChevronLeft } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { colors } from '../../../assets/theme';

function PageTitle({ title, onGoBack, onCancel, style }) {
  const { t } = useTranslation();
  return (
    <div className={styles.container} style={style}>
      <div className={styles.leftContainer}>
        {onGoBack && (
          <button type={'button'} className={styles.buttonContainer} onClick={onGoBack}>
            <BsChevronLeft style={{ fontSize: '20px' }} />
          </button>
        )}
        <Title style={{ marginBottom: 0 }}>{title}</Title>
      </div>
      {onCancel && (
        <Semibold sm style={{ color: colors.teal700 }} onClick={onCancel}>
          {t('common:CANCEL')}
        </Semibold>
      )}
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
