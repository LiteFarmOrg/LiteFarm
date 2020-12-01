import React from 'react';
import styles from './password.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { MdDone, MdClose } from 'react-icons/all';
import { Text } from '../../../Typography';

const PasswordError = ({
  isTooShort = true,
  hasNoUpperCase = true,
  hasNoDigit = true,
  hasNoSymbol = true,
  ...props
}) => {
  const messages = {
    'at least 8 characters': isTooShort,
    'at least one upper case character': hasNoUpperCase,
    'at least one number': hasNoDigit,
    'at least one special character': hasNoSymbol,
  }
  return (
    <div
      {...props}
    >
      {Object.entries(messages).map(([message, hasError]) =>
        <div key={message} className={styles.error}>
          <span className={clsx(styles.icon, hasError ? styles.errorIcon : styles.validIcon)}>
            {hasError ? <MdClose/> : <MdDone/>}
          </span>
          <Text style={{display: 'inline', color: hasError? 'var(--grey500)': 'var(--fontColor)'}}>
            {message}
          </Text>
        </div>,
      )}
    </div>
  );
};

PasswordError.propTypes = {
  isTooShort: PropTypes.bool,
  hasNoUpperCase: PropTypes.bool,
  hasNoDigit: PropTypes.bool,
  hasNoSymbol: PropTypes.bool,
}
export default PasswordError;