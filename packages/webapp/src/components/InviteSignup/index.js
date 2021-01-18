import Layout from '../Layout';
import React from 'react';
import PropTypes from 'prop-types';
import { Text, Title, Error, Main, Semibold } from '../Typography';
import { useTranslation } from 'react-i18next';
import Card from '../Card';
import { ReactComponent as GoogleLogo } from '../../assets/images/inviteSignUp/google-logo.svg';
import styles from './styles.scss';

export default function PureInviteSignup({
  googleButton,
  showError,
  selectedKey = 0,
  onClick,
  email,
  isChrome = true,
}) {
  const { t } = useTranslation();
  const wrongBrowserTop = t('SIGNUP.WRONG_BROWSER');
  const wrongBrowserBottom = t('SIGNUP.WRONG_BROWSER_BOTTOM');
  return (
    <Layout hasWhiteBackground buttonGroup={googleButton}>
      <Title style={{ marginBottom: '24px' }}>{t(`INVITE_SIGN_UP.TITLE`)}</Title>
      {!isChrome && !showError && (
        <div className={styles.otherBrowserMessageTop}>
          {wrongBrowserTop}
          <div className={styles.otherBrowserMessageBottom}>{wrongBrowserBottom}</div>
        </div>
      )}

      {showError ? (
        <Error style={{ marginBottom: '24px', marginTop: 0 }}>
          {t(`INVITE_SIGN_UP.ERROR0`)} <strong>{email}</strong> {t(`INVITE_SIGN_UP.ERROR1`)}
        </Error>
      ) : (
        <Main style={{ marginBottom: '24px' }}>{t(`INVITE_SIGN_UP.HOW_TO_CREATE`)}</Main>
      )}
      <Card
        style={{ marginBottom: '24px' }}
        key={1}
        onClick={() => onClick(1)}
        color={selectedKey === 1 ? 'active' : 'secondary'}
        isButton
      >
        <Semibold style={{ margin: 0 }}>
          {t(`INVITE_SIGN_UP.SIGN_IN_WITH`)}{' '}
          <GoogleLogo style={{ marginLeft: '8px', transform: 'translateY(2px)' }} />
        </Semibold>
      </Card>
      <Card
        key={2}
        onClick={() => onClick(2)}
        color={selectedKey === 2 ? 'active' : 'secondary'}
        isButton
      >
        <Semibold style={{ margin: 0 }}> {t(`INVITE_SIGN_UP.LITEFARM_ACCOUNT`)}</Semibold>
      </Card>
    </Layout>
  );
}

PureInviteSignup.prototype = {
  googleButton: PropTypes.node,
  showError: PropTypes.bool,
  email: PropTypes.string,
  selectedKey: PropTypes.oneOf([0, 1, 2]),
  onClick: PropTypes.func,
  isChrome: PropTypes.bool,
};
