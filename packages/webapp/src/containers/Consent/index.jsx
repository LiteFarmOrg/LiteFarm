import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import PureConsent from '../../components/Consent';
import { userFarmSelector } from '../userFarmSlice';
import { patchConsent } from './saga';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import EnglishOwnerConsent from './locales/en/Owner.Consent.md';
import EnglishWorkerConsent from './locales/en/Worker.Consent.md';
import FrenchOwnerConsent from './locales/fr/Owner.Consent.md';
import FrenchWorkerConsent from './locales/fr/Worker.Consent.md';
import PortugueseOwnerConsent from './locales/pt/Owner.Consent.md';
import PortugueseWorkerConsent from './locales/pt/Worker.Consent.md';
import SpanishOwnerConsent from './locales/es/Owner.Consent.md';
import SpanishWorkerConsent from './locales/es/Worker.Consent.md';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { CONSENT_VERSION } from '../../util/constants';

const languageConsent = {
  en: { worker: <EnglishWorkerConsent />, owner: <EnglishOwnerConsent /> },
  fr: { worker: <FrenchWorkerConsent />, owner: <FrenchOwnerConsent /> },
  es: { worker: <SpanishWorkerConsent />, owner: <SpanishOwnerConsent /> },
  pt: { worker: <PortugueseWorkerConsent />, owner: <PortugueseOwnerConsent /> },
};

const getLanguageConsent = (language) => languageConsent[language] || languageConsent.en;

function ConsentForm({
  goBackTo = '/role_selection',
  goForwardTo = '/certification/interested_in_organic',
  history,
}) {
  const { t, i18n } = useTranslation();
  const language = getLanguageFromLocalStorage();
  const role = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    watch,
    setValue,

    formState: { errors },
  } = useForm();
  const consent =
    role.role_id === 3 ? getLanguageConsent(language).worker : getLanguageConsent(language).owner;
  const checkboxName = 'consentCheckbox';
  const hasConsent = watch(checkboxName, false);
  const checkBoxRegister = register(checkboxName, {
    required: {
      value: true,
      message: 'You must accept terms and conditions to use the app',
    },
  });
  const goBack = () => {
    history.push(goBackTo);
  };

  const updateConsent = (data) => {
    dispatch(patchConsent({ has_consent: true, consent_version: CONSENT_VERSION, goForwardTo }));
  };

  return (
    <PureConsent
      checkboxArgs={{
        hookFormRegister: checkBoxRegister,
        label: t('CONSENT.LABEL'),
        errors: errors[checkboxName] && errors[checkboxName].message,
      }}
      onSubmit={handleSubmit(updateConsent)}
      onGoBack={goBackTo ? goBack : null}
      consent={consent}
      disabled={!hasConsent}
    />
  );
}

export default ConsentForm;

ConsentForm.prototype = {
  goBackTo: PropTypes.string,
  goForwardTo: PropTypes.string,
  history: PropTypes.object,
};
