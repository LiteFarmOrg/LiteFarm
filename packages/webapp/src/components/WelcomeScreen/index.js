import Layout from '../Layout';
import Button from '../Form/Button';
import Svg from '../Svg';
import signup2 from '../../assets/images/signUp/signUp2.svg';
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
      <Svg svg={signup2} alt={t('WELCOME_SCREEN.SVG_ALT')} />
    </Layout>
  );
}

PureWelcomeScreen.prototype = {
  onClick: PropTypes.func,
};
