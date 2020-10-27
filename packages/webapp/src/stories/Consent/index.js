import React , {useEffect} from 'react';
import clsx from 'clsx';
import styles from './consent.scss';
import  './consent.scss';
import Checkbox from '../Form/checkbox'
import Button from "../Button";
import Form from "../Pages/Intro/components/Form";
import { useForm } from "react-hook-form";

const PureConsent = ({
  onSubmit,
  checkboxArgs,
  onGoBack
}) => {
  return (
    <Form onSubmit={onSubmit} buttonGroup={
      <><Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button><Button type={'submit'} fullLength>Continue</Button></>
    } >
      <h3 className={clsx(styles.consentText, styles.consentHeader)}>Our Data Policy</h3>
      <div style={{ width: '90%', overflowY: "scroll" }} className={clsx(styles.consentText, 'paraText')} >
        <p>We understand that your privacy and the protection of your data are important to you. We created this Informed Consent Form and Privacy Policy to help you understand how and when we collect, use and share your information, and to ensure we have your consent for doing so. Please keep in mind that you will need to consent to our collection and use of your data as described in this Informed Consent Form and Privacy Policy to create an account with LiteFarm and use the LiteFarm platform. If you do not agree with our practices as outlined in this Informed Consent Form and Privacy Policy, please do not use the LiteFarm platform.</p>
      </div>
      <div style={{
        width:'100%',
        height:'38px',
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
}

export default function ConsentForm () {
  const { register, handleSubmit, getValues, setValue, errors } = useForm();
  const checkBoxRef = register({required: {value: true, message: 'You must accept terms and conditions to use the app'}});
  const checkboxName = 'consentCheckbox';
  const goBack = () => {

  }

  useEffect(() => {

  })

  return (
    <PureConsent checkboxArgs={{
      inputRef: checkBoxRef,
      label: 'I Agree',
      name: checkboxName
    }} onSubmit={handleSubmit} onGoBack={goBack}>
    </PureConsent>
  )
}

