import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import { updateAgreement } from "../actions";
import { farmSelector, userInfoSelector } from "../selector";
import { connect } from "react-redux";
import PureConsent from "../../components/Consent";

function ConsentForm({ role, dispatch }) {
  const { register, handleSubmit, errors } = useForm();
  const [ consentVersion ] = useState('3.0');
  const [consent, setConsentText ] = useState('');
  const [ disabled, setDisabled ] = useState(true);
  const onChange = (e) => {
    setDisabled(!e.target.checked);
  }
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
    let consentForm = role.role_id === 3 ? require('./Worker.Consent.md') : require('./Owner.Consent.md');
    setConsentText(consentForm.default);
  }, []);

  return (
    <PureConsent checkboxArgs={{
      inputRef: checkBoxRef,
      label: 'I Agree',
      name: checkboxName,
      errors: errors[checkboxName] && errors[checkboxName].message,
      onChange: onChange
    }}
                 onSubmit={handleSubmit(updateConsent)}
                 onGoBack={goBack}
                 text={consent}
                 disabled={disabled}
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
