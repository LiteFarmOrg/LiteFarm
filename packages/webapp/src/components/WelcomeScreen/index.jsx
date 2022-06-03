import Layout from '../Layout';
import Button from '../Form/Button';
import { ReactComponent as SignupEnglish } from '../../assets/images/signUp/signup_english.svg';
import { ReactComponent as SignupSpanish } from '../../assets/images/signUp/signup_spanish.svg';
import { ReactComponent as SignupPortuguese } from '../../assets/images/signUp/signup_portuguese.svg';
import { ReactComponent as SignupFrench } from '../../assets/images/signUp/signup_french.svg';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';

export default function PureWelcomeScreen({ onClick }) {
  const { t } = useTranslation();
  const languageToSvg = {
    en: <SignupEnglish />,
    es: <SignupSpanish />,
    pt: <SignupPortuguese />,
    fr: <SignupFrench />,
  };
  const language = getLanguageFromLocalStorage();
  return (
    <Layout
      isSVG
      buttonGroup={
        <Button data-cy="getStarted" onClick={onClick} fullLength>
          {t('WELCOME_SCREEN.BUTTON')}
        </Button>
      }
    >
      {languageToSvg[language] ?? <SignupEnglish />}
    </Layout>
  );
}

PureWelcomeScreen.prototype = {
  onClick: PropTypes.func,
};
