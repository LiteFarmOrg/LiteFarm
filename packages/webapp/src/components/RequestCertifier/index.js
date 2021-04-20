import Form from '../Form';
import Button from '../Form/Button';
import React from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';

export default function PureRequestCertifier({
  onSubmit,

  redirectConsent,
  onGoBack,
}) {
  const { t } = useTranslation(['translation', 'common']);
  return (
    <Form
      onSubmit={onSubmit}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength onClick={redirectConsent}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '28px' }}>{t('CERTIFICATION.REQUEST_CERTIFIER.TITLE')}</Title>

      <Input label={t('CERTIFICATION.REQUEST_CERTIFIER.LABEL')} />
    </Form>
  );
}
