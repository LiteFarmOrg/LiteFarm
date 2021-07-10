import Form from '../../Form';
import Button from '../../Form/Button';
import React, { useMemo } from 'react';
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
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: { ...survey, ...persistedFormData },
  });
  useHookFormPersist?.(persistedPathNames, getValues);
  const CERTIFICATION_ID = 'certification_id';
  const certification_id = watch(CERTIFICATION_ID);
  const REQUESTED_CERTIFICATION = 'requested_certification';
  const radioOptions = useMemo(() => {
    const certificationRadioOptions = certifications.map((certification) => ({
      label: t(`certifications:${certification.certification_translation_key}`),
      value: certification.certification_id,
    }));
    return [
      ...certificationRadioOptions,
      {
        label: t('common:OTHER'),
        value: 0,
        toolTipContent: t('CERTIFICATION.CERTIFICATION_SELECTION.TOOLTIP'),
      },
    ];
  }, [certifications]);

  const disabled = !isValid;

  const submit = () => {
    onSubmit();
  };

  return (
    <Form
      onSubmit={handleSubmit(submit)}
      buttonGroup={
        <>
          <Button type={'submit'} fullLength disabled={disabled}>
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
      <RadioGroup name={CERTIFICATION_ID} hookFormControl={control} radios={radioOptions} />

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
