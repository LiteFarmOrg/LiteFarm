import Form from '../Form';
import Button from '../Form/Button';
import React, { useState, useEffect } from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import { useForm } from 'react-hook-form';

export default function PureRequestCertifier({
  onSubmit,
  redirectConsent,
  onGoBack,
  requestedCertifier,
  requestedCertifierData,
  dispatch,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,
    watch,
    errors,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const REQUESTED_CERTIFIER = 'requestedCertifier';
  const [requested, setRequested] = useState(null);
  const [disabled, setDisabled] = useState(requested === null);

  useEffect(() => {
    setDisabled(requested === null);
    if (requested !== null) dispatch(requestedCertifier(requested));
  }, [requested]);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength onClick={redirectConsent} disabled={!isValid}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <Title style={{ marginBottom: '28px' }}>{t('CERTIFICATION.REQUEST_CERTIFIER.TITLE')}</Title>

      <Input
        label={t('CERTIFICATION.REQUEST_CERTIFIER.LABEL')}
        name={REQUESTED_CERTIFIER}
        onChange={(e) => setRequested(e.target.value)}
        defaultValue={requestedCertifierData !== null ? requestedCertifierData : null}
        inputRef={register({ required: true })}
        errors={errors[REQUESTED_CERTIFIER] && t('common:REQUIRED')}
      />
    </Form>
  );
}
