import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import styles from './consent.scss';
import Checkbox from '../Form/checkbox'
import Button from "../Button";
import Form from "../Pages/Intro/components/Form";

import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { farmSelector, userInfoSelector } from "../../containers/selector";
import { updateAgreement } from "../../containers/actions";
import { consentText, worker_consentText } from "../../consentText";

const PureConsent = ({
                       onSubmit,
                       checkboxArgs,
                       onGoBack,
                       text,
                       disabled
                     }) => (
  <Form onSubmit={onSubmit} buttonGroup={
    <><Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button><Button type={'submit'}
                                                                                        fullLength disabled={disabled}>Continue</Button></>
  }>
    <h3 className={clsx(styles.consentText, styles.consentHeader)}>Our Data Policy</h3>
    <div style={{ width: '90%', overflowY: "scroll" }} className={clsx(styles.consentText, 'paraText')}>
      <p>{text}</p>
    </div>
    <div style={{
      width: '100%',
      height: '38px',
      background: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255,255 , 255, 1) 55.21%)",
      marginTop: "-28px",
      zIndex: '2000',
    }}>
    </div>
    <div>
      <Checkbox {...checkboxArgs}  />
    </div>
  </Form>
)


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
    let consentForm = role.role_id === 3 ? worker_consentText : consentText;
    let text = consentForm.reduce((text, { header, body }) => {
      return text  + `\n${header ? header: ''}\n${body ? body: ''}\n`;
    }, '')
    setConsentText(text);
  }, [])

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
