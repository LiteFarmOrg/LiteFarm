import Layout from '../Layout';
import Button from '../Form/Button';
import { ReactComponent as SignupEnglish } from '../../assets/images/signUp/signup_english.svg';
import { ReactComponent as SignupSpanish } from '../../assets/images/signUp/signup_spanish.svg';
import { ReactComponent as SignupPortuguese } from '../../assets/images/signUp/signup_portuguese.svg';
import { ReactComponent as SignupFrench } from '../../assets/images/signUp/signup_french.svg';
import { ReactComponent as SignupGerman } from '../../assets/images/signUp/signup_german.svg';
import { ReactComponent as SignupHindi } from '../../assets/images/signUp/signup_hindi.svg';
import { ReactComponent as SignupPunjabi } from '../../assets/images/signUp/signup_punjabi.svg';
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
    de: <SignupGerman />,
    hi: <SignupHindi />,
    pa: <SignupPunjabi />,
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
