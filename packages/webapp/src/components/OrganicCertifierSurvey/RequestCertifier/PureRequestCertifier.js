import Form from '../../Form';
import Button from '../../Form/Button';
import React from 'react';
import { Semibold } from '../../Typography';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import { useForm } from 'react-hook-form';
import PageTitle from '../../PageTitle/v2';

export function PureRequestCertifier({
  onSubmit,
  onGoBack,
  certificationName,
  isRequestedCertification,
  hasSupportedCertifiers,
  persistedFormData,
  useHookFormPersist,
  persistedPathNames,
  survey = {},
}) {
  const REQUESTED_CERTIFIER = 'requested_certifier';

  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { isValid, errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...survey, ...persistedFormData },
  });
  useHookFormPersist?.(getValues, persistedPathNames);

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button type={'submit'} fullLength disabled={!isValid}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <PageTitle
        style={{ marginBottom: '28px' }}
        title={t('CERTIFICATION.REQUEST_CERTIFIER.TITLE')}
        onGoBack={onGoBack}
      />
      <Semibold style={{ marginBottom: '28px' }}>
        {isRequestedCertification
          ? `${t('CERTIFICATION.REQUEST_CERTIFIER.SORRY_ONE')} ${certificationName} ${t(
              'CERTIFICATION.REQUEST_CERTIFIER.SORRY_TWO',
            )}`
          : hasSupportedCertifiers > 0
          ? t('CERTIFICATION.REQUEST_CERTIFIER.REQUEST')
          : `${t('CERTIFICATION.REQUEST_CERTIFIER.SORRY_ONE')} ${certificationName} ${t(
              'CERTIFICATION.REQUEST_CERTIFIER.SORRY_THREE',
            )}`}
      </Semibold>

      <Input
        label={t('CERTIFICATION.REQUEST_CERTIFIER.LABEL')}
        hookFormRegister={register(REQUESTED_CERTIFIER, { required: true })}
        errors={errors[REQUESTED_CERTIFIER] && t('common:REQUIRED')}
      />
    </Form>
  );
}
