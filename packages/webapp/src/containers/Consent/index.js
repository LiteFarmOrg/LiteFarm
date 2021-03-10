import { useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureConsent from '../../components/Consent';
import { userFarmSelector } from '../userFarmSlice';
import { patchConsent } from './saga';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import englishOwnerConsent from './locales/en/Owner.Consent.md';
import englishWorkerConsent from './locales/en/Worker.Consent.md';
import spanishOwnerConsent from './locales/es/Owner.Consent.md';
import spanishWorkerConsent from './locales/es/Worker.Consent.md';
const languageConsent = {
  en: {worker: englishWorkerConsent, owner: englishOwnerConsent },
  es: {worker: spanishWorkerConsent, owner: spanishOwnerConsent },
}

function ConsentForm({
  goBackTo = '/role_selection',
  goForwardTo = '/interested_in_organic',
  history,
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const role = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const { register, handleSubmit, errors, watch, setValue} = useForm();
  const [consentVersion] = useState('3.0');
  const [consent, setConsentText] = useState('');
  const checkboxName = 'consentCheckbox';
  const hasConsent = watch(checkboxName, false);
  const checkBoxRef = register({
    required: {
      value: true,
      message: 'You must accept terms and conditions to use the app',
    },
  });
  const goBack = () => {
    history.push(goBackTo);
  };

  const updateConsent = (data) => {
    dispatch(patchConsent({ has_consent: true, consent_version: consentVersion, goForwardTo }));
  };

  useEffect( () => {
    setValue(checkboxName, role.has_consent ?? false);
    const consent  = role.role_id === 3 ? languageConsent[language].worker: languageConsent[language].owner;
    fetch(consent)
      .then((r) => r.text())
      .then((text) => {
        setConsentText(text);
      });
    // const consentFormText = role.role_id === 3?
    // let consentForm = role.role_id === 3 ? workerConsent : ownerConsent;
  }, []);

  return (
    <PureConsent
      checkboxArgs={{
        inputRef: checkBoxRef,
        label: t('CONSENT.LABEL'),
        name: checkboxName,
        errors: errors[checkboxName] && errors[checkboxName].message,
      }}
      onSubmit={handleSubmit(updateConsent)}
      onGoBack={goBackTo ? goBack : null}
      text={consent}
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
