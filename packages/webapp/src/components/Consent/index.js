import Form from '../Form';
import Button from '../Form/Button';
import clsx from 'clsx';
import styles from './consent.module.scss';
import ReactMarkdown from 'react-markdown';
import Checkbox from '../Form/Checkbox';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../PageTitle/v2';

export default function PureConsent({ onSubmit, checkboxArgs, onGoBack, text, disabled }) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <>
          {onSubmit && (
            <Button type={'submit'} fullLength disabled={disabled}>
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
      <div className={clsx(styles.consentTextContainer)}>
        <ReactMarkdown children={text} />
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
        <Checkbox style={{ marginBottom: 0 }} {...checkboxArgs} />
      </div>
    </Form>
  );
}
