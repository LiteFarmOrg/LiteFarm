import Layout from '../Layout';
import Button from '../Form/Button';
import { ReactComponent as Signup2 }  from '../../assets/images/signUp/signUp2.svg';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

export default function PureWelcomeScreen({ onClick }) {
  const { t } = useTranslation();

  return (
    <Layout
      isSVG
      buttonGroup={
        <Button onClick={onClick} fullLength>
          {t('WELCOME_SCREEN.BUTTON')}
        </Button>
      }
    >
      <Signup2 id={"tt2"}>
      </Signup2>

    </Layout>
  );
}

PureWelcomeScreen.prototype = {
  onClick: PropTypes.func,
};
