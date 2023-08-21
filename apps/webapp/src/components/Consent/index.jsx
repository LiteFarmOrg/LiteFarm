import Form from '../Form';
import Button from '../Form/Button';
import clsx from 'clsx';
import styles from './consent.module.scss';
import Checkbox from '../Form/Checkbox';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';

export default function PureConsent({ onSubmit, checkboxArgs, onGoBack, consent, disabled }) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <>
          {onSubmit && (
            <Button data-cy="consent-continue" type={'submit'} fullLength disabled={disabled}>
              {t('common:CONTINUE')}
            </Button>
          )}
        </>
      }
    >
      <PageTitle
        title={t('CONSENT.DATA_POLICY')}
        onGoBack={onGoBack}
        style={{ marginBottom: '16px' }}
      />
      <div data-cy="consentPage-content" className={clsx(styles.consentTextContainer)}>
        {consent}
      </div>
      <div
        style={{
          width: '100%',
          height: '38px',
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255,255 , 255, 1) 55.21%)',
          marginTop: '-28px',
          zIndex: '2000',
        }}
      />
      <div>
        <Checkbox data-cy="consent-agree" style={{ marginBottom: 0 }} {...checkboxArgs} />
      </div>
    </Form>
  );
}
