import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { updateAgreement } from "../actions";
import { farmSelector, userInfoSelector } from "../selector";
import ownerConsent from './Owner.Consent.md';
import workerConsent from './Worker.Consent.md';
import { connect } from "react-redux";
import PureConsent from "../../components/Consent";

function ConsentForm({ role, dispatch }) {
  const { register, handleSubmit, errors, watch } = useForm();
  const [ consentVersion ] = useState('3.0');
  const [consent, setConsentText ] = useState('');
  const hasConsent = watch('consentCheckbox', false);
  const checkBoxRef = register({
    required: {
      value: true,
      message: 'You must accept terms and conditions to use the app'
    }
  });
  const checkboxName = 'consentCheckbox';
  const goBack = () => {

  }

  const updateConsent = (data) => {
    dispatch(updateAgreement({ consent: true }, consentVersion));
  }

  useEffect(() => {
    let consentForm = role.role_id === 3 ? workerConsent : ownerConsent;
    fetch(consentForm)
      .then((r) => r.text())
      .then((text) => {
        setConsentText(text);
      })
  }, []);

  return (
    <PureConsent checkboxArgs={{
      inputRef: checkBoxRef,
      label: 'I Agree',
      name: checkboxName,
      errors: errors[checkboxName] && errors[checkboxName].message,
    }}
                 onSubmit={handleSubmit(updateConsent)}
                 onGoBack={goBack}
                 text={consent}
                 disabled={!hasConsent}
    >
    </PureConsent>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  }
};

const mapStateToProps = (state) => {
  return {
    users: userInfoSelector(state),
    role: farmSelector(state),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ConsentForm);
