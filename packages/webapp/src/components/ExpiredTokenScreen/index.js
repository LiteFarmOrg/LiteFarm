import Layout from '../Layout';
import { ReactComponent } from '../../assets/images/expiredToken/expiredToken.svg';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Semibold, Underlined } from '../Typography';

export default function PureExpiredTokenScreen({ onClick, text, linkText, forgotPassword }) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Layout
      // buttonGroup={
      //   <Button onClick={onClick} fullLength>
      //     {t('WELCOME_SCREEN.BUTTON')}
      //   </Button>
      // }
      classes={{
        container: {
          alignItems: 'center',
          textAlign: 'center',
        },
      }}
    >
      <div
        style={{
          height: '27.3vh',
          margin: '10vh 0 0 0',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <ReactComponent style={{ height: '100%' }} />
      </div>

      <Semibold style={{ margin: 0 }}> {t('common:SORRY')}!</Semibold>
      <Semibold style={{ marginBottom: '24px' }}>{text}</Semibold>
      {linkText && <Underlined onClick={forgotPassword}>{linkText}</Underlined>}
    </Layout>
  );
}

PureExpiredTokenScreen.prototype = {
  onClick: PropTypes.func,
  text: PropTypes.string,
  linkText: PropTypes.string,
  forgotPassword: PropTypes.func,
};
