import Form from '../../Form';
import Button from '../../Form/Button';
import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import { useForm } from 'react-hook-form';
import PageTitle from '../../PageTitle/v2';
import RadioGroup from '../../Form/RadioGroup';

export function PureCertificationSelection({
  onSubmit,
  certifications,
  onGoBack,
  persistedFormData,
  useHookFormPersist,
  persistedPathNames,
  survey = {},
}) {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const defaultValues = { ...survey, ...persistedFormData };
  const getDefaultCertificationId = useCallback(() => {
    if (defaultValues.certification_id === 0 || defaultValues.certification_id) {
      return defaultValues.certification_id;
    } else if (defaultValues.requested_certification) {
      return 0;
    } else {
      return undefined;
    }
  }, [defaultValues.certification_id, defaultValues.requested_certification]);
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      ...survey,
      ...persistedFormData,
      certification_id: getDefaultCertificationId(),
    },
  });
  useHookFormPersist?.(getValues, persistedPathNames);
  const CERTIFICATION_ID = 'certification_id';
  const certification_id = watch(CERTIFICATION_ID);
  const REQUESTED_CERTIFICATION = 'requested_certification';
  const radioOptions = useMemo(() => {
    const certificationRadioOptions = certifications.map((certification) => ({
      label: t(`certifications:${certification.certification_translation_key}`),
      value: certification.certification_id,
      'data-cy': `${CERTIFICATION_ID}-${certification.certification_id}`,
    }));
    return [
      ...certificationRadioOptions,
      {
        label: t('common:OTHER'),
        value: 0,
        toolTipContent:
          certification_id === 0 ? t('CERTIFICATION.CERTIFICATION_SELECTION.TOOLTIP') : undefined,
      },
    ];
  }, [certifications, certification_id]);
  const disabled = !isValid;

  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button
            data-cy="certificationSelection-continue"
            type={'submit'}
            fullLength
            disabled={disabled}
          >
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <PageTitle
        title={t('CERTIFICATION.CERTIFICATION_SELECTION.TITLE')}
        onGoBack={onGoBack}
        style={{ marginBottom: '20px' }}
      />
      <RadioGroup
        name={CERTIFICATION_ID}
        hookFormControl={control}
        radios={radioOptions}
        required
      />

      {certification_id === 0 && (
        <Input
          label={t('CERTIFICATION.CERTIFICATION_SELECTION.REQUEST_CERTIFICATION')}
          hookFormRegister={register(REQUESTED_CERTIFICATION, { required: true })}
          errors={errors[REQUESTED_CERTIFICATION] && t('common:REQUIRED')}
        />
      )}
    </Form>
  );
}
