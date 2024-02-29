import { Title } from '../../Typography';
import React from 'react';
import styles from './styles.module.scss';
import { BsChevronLeft } from 'react-icons/bs';
import PropTypes from 'prop-types';
import { CancelButton } from '../CancelButton';

function PageTitle({
  title,
  onGoBack,
  onCancel = () => {},
  style,
  cancelModalTitle = '',
  label = '',
}) {
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
      {!!onCancel && <CancelButton onCancel={onCancel} cancelModalTitle={cancelModalTitle} />}
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
};
