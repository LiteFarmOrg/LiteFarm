import Form from '../Form';
import Button from '../Form/Button';
import React, { useEffect, useState } from 'react';
import { Semibold, Title } from '../Typography';
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
  certificationType,
  allSupportedCertifierTypes,
}) {
  const REQUESTED_CERTIFIER = 'requestedCertifier';
  const getDefaultValues = () => {
    const defaultValues = {};
    defaultValues[REQUESTED_CERTIFIER] =
      requestedCertifierData !== null ? requestedCertifierData : null;
    return defaultValues;
  };
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,

    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: getDefaultValues(),
  });

  const [requested, setRequested] = useState(null);

  useEffect(() => {
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
      <Semibold style={{ marginBottom: '28px' }}>
        {certificationType.requestedCertification
          ? t('CERTIFICATION.REQUEST_CERTIFIER.SORRY_ONE') +
            ' ' +
            certificationType.requestedCertification +
            ' ' +
            t('CERTIFICATION.REQUEST_CERTIFIER.SORRY_TWO')
          : allSupportedCertifierTypes.length > 0
          ? t('CERTIFICATION.REQUEST_CERTIFIER.REQUEST')
          : t('CERTIFICATION.REQUEST_CERTIFIER.SORRY_ONE') +
            ' ' +
            certificationType.certificationName +
            ' ' +
            t('CERTIFICATION.REQUEST_CERTIFIER.SORRY_THREE')}
      </Semibold>

      <Input
        label={t('CERTIFICATION.REQUEST_CERTIFIER.LABEL')}
        onChange={(e) => setRequested(e.target.value)}
        hookFormRegister={register(REQUESTED_CERTIFIER, { required: true })}
        errors={errors[REQUESTED_CERTIFIER] && t('common:REQUIRED')}
      />
    </Form>
  );
}
