import styles from './styles.module.scss';
import { ReactComponent as Logo } from '../../assets/images/signUp/logo.svg';
import { ReactComponent as LineBreak } from '../../assets/images/signUp/lineBreak.svg';
import Button from '../Form/Button';
import Input from '../Form/Input';
import React from 'react';
import Footer from '../Footer';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Error } from '../Typography';

const inputClasses = {
  container: {
    width: 312,
  },
};

export default function PureCustomSignUp({
  inputs,
  onSubmit,
  disabled,
  GoogleLoginButton,
  classes,
  isChrome,
  errorMessage,
}) {
  const { t } = useTranslation();
  const wrongBrowserTop = t('SIGNUP.WRONG_BROWSER');
  const wrongBrowserBottom = t('SIGNUP.WRONG_BROWSER_BOTTOM');
  return (
    <form onSubmit={onSubmit} className={styles.home} style={classes.form}>
      <div className={styles.lander}>
        <div className={styles.greetContainer}>
          <Logo />
          {(!isChrome || !!errorMessage) && (
            <div className={styles.otherBrowserMessageTop}>
              {!!errorMessage ? (
                <Error style={{ maxWidth: '300px' }}>{errorMessage}</Error>
              ) : (
                <>
                  {wrongBrowserTop}
                  <div className={styles.otherBrowserMessageBottom}>{wrongBrowserBottom}</div>
                </>
              )}
            </div>
          )}

          <div className={styles.ssoButton}>{GoogleLoginButton}</div>
          <div className={styles.lineBreak}>
            <LineBreak />
          </div>

          <div className={styles.continueButton}>
            <Input classes={inputClasses} {...inputs[0]} />
          </div>
        </div>
      </div>
      <Footer style={{ position: 'relative', bottom: 0, marginTop: '12px' }}>
        <div className={styles.bottomButton}>
          <Button
            disabled={disabled}
            style={{
              border: '4px',
              shadow: '0px 2px 8px rgba(102, 115, 138, 0.3)',
              width: 312,
              height: 48,
            }}
            type="submit"
            fullLength
            children="Continue"
          />
        </div>
      </Footer>
    </form>
  );
}

PureCustomSignUp.prototype = {
  inputs: PropTypes.arrayOf(PropTypes.object),
  onSubmit: PropTypes.func,
  disabled: PropTypes.bool,
  GoogleLoginButton: PropTypes.node,
  classes: PropTypes.objectOf(PropTypes.object),
  errorMessage: PropTypes.string,
};

PureCustomSignUp.defaultProps = {
  inputs: [{}],
  onSubmit: () => {},
  disabled: undefined,
  GoogleLoginButton: undefined,
  classes: {},
  isChrome: true,
  errorMessage: undefined,
};
