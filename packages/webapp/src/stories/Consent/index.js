import React from 'react';
import clsx from 'clsx';
import styles from './consent.scss';
import  './consent.scss';
import Checkbox from '../Form/checkbox'

const ConsentForm = ({
}) => {
  return (
    <>
      <h3 className={clsx(styles.consentText, styles.consentHeader)}>Our Data Policy</h3>
      <div style={{ width: '90%', overflowY: "scroll" }} className={clsx(styles.consentText, 'paraText')} >
        <p>We understand that your privacy and the protection of your data are important to you. We created this Informed Consent Form and Privacy Policy to help you understand how and when we collect, use and share your information, and to ensure we have your consent for doing so. Please keep in mind that you will need to consent to our collection and use of your data as described in this Informed Consent Form and Privacy Policy to create an account with LiteFarm and use the LiteFarm platform. If you do not agree with our practices as outlined in this Informed Consent Form and Privacy Policy, please do not use the LiteFarm platform.</p>
      </div>
      <div style={{
        width:'302px',
        height:'38px',
        background: "linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255,255 , 255, 1) 55.21%)",
        marginTop: "-48px",
        zIndex: '2000',
      }}>
      </div>
      <div>
        <Checkbox label={'I Agree'}  />
      </div>
    </>
  )
}

export default ConsentForm;
