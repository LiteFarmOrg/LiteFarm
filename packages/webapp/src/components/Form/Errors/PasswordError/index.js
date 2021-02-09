import React from 'react';
import styles from './password.module.scss';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { MdDone, MdClose } from 'react-icons/all';
import { Text } from '../../../Typography';
import { useTranslation } from 'react-i18next';

const PasswordError = ({
  isTooShort = true,
  hasNoUpperCase = true,
  hasNoDigit = true,
  hasNoSymbol = true,
  ...props
}) => {
  const { t } = useTranslation();
  const messages = {
    TOO_SHORT: isTooShort,
    ONE_UPPER_CASE: hasNoUpperCase,
    ONE_NUMBER: hasNoDigit,
    ONE_SPECIAL_CHARACTER: hasNoSymbol,
  };
  const messageString = {
    TOO_SHORT: t('ENTER_PASSWORD.TOO_SHORT'),
    ONE_UPPER_CASE: t('ENTER_PASSWORD.ONE_UPPER_CASE'),
    ONE_NUMBER: t('ENTER_PASSWORD.ONE_NUMBER'),
    ONE_SPECIAL_CHARACTER: t('ENTER_PASSWORD.ONE_SPECIAL_CHARACTER'),
  };
  console.log(messageString);
  return (
    <div {...props}>
      {Object.entries(messages).map(([message, hasError]) => (
        <div key={message} className={styles.error}>
          <span className={clsx(styles.icon, hasError ? styles.errorIcon : styles.validIcon)}>
            {hasError ? <MdClose /> : <MdDone />}
          </span>
          <Text
            style={{
              display: 'inline',
              color: hasError ? 'var(--grey500)' : 'var(--fontColor)',
            }}
          >
            {messageString[message]}
          </Text>
        </div>
      ))}
    </div>
  );
};

PasswordError.propTypes = {
  isTooShort: PropTypes.bool,
  hasNoUpperCase: PropTypes.bool,
  hasNoDigit: PropTypes.bool,
  hasNoSymbol: PropTypes.bool,
};
export default PasswordError;
