import Form from '../Form';
import Button from '../Form/Button';
import clsx from 'clsx';
import styles from './consent.module.scss';
import ReactMarkdown from 'react-markdown';
import Checkbox from '../Form/Checkbox';
import React from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';

export default function PureConsent({ onSubmit, checkboxArgs, onGoBack, text, disabled }) {
  const { t } = useTranslation();
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <>
          {onGoBack && (
            <Button onClick={onGoBack} color={'secondary'} fullLength>
              {t('common:BACK')}
            </Button>
          )}
          {onSubmit && (
            <Button type={'submit'} fullLength disabled={disabled}>
              {t('common:CONTINUE')}
            </Button>
          )}
        </>
      }
    >
      <Title style={{ marginBottom: '16px' }}>{t('CONSENT.DATA_POLICY')}</Title>
      <div
        style={{ width: '90%', overflowY: 'scroll' }}
        className={clsx(styles.consentText, 'paraText')}
      >
        <ReactMarkdown children={text}></ReactMarkdown>
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
      ></div>
      <div>
        <Checkbox style={{ marginBottom: 0 }} {...checkboxArgs} />
      </div>
    </Form>
  );
}
