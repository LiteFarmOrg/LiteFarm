import Form from '../Form';
import Button from '../Form/Button';
import Radio from '../Form/Radio';
import React, { useEffect, useState } from 'react';
import { Title } from '../Typography';
import { useTranslation } from 'react-i18next';
import Infoi from '../Tooltip/Infoi';
import Input from '../Form/Input';
import { useForm } from 'react-hook-form';

export default function PureCertificationSelection({
  onSubmit,
  inputClasses = {},
  redirectConsent,
  onGoBack,
  dispatch,
  setCertificationSelection,
  certificationType,
  certificationTypes,
  setRequestedCertification,
  requestedCertification,
  role_id,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,
    errors,
    setValue,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const SELECTION = 'selection';
  const [selectionType, setSelectionType] = useState(null);
  const [requested, setRequested] = useState(requestedCertification);
  const [disabled, setDisabled] = useState(certificationType === null);

  useEffect(() => {
    if (selectionType !== null) dispatch(setCertificationSelection(selectionType));
    if (requested !== null || requested !== '') dispatch(setRequestedCertification(requested));
    setValue(SELECTION, certificationType);
    setDisabled(
      certificationType === null ||
        (certificationType === 'other' &&
          (requestedCertification === null || requestedCertification === '')),
    );
  }, [selectionType, certificationType, requested, requestedCertification]);

  const submit = (data) => {
    if (requestedCertification !== null) data.requested = requestedCertification;
    onSubmit(data);
  };

  return (
    <Form
      onSubmit={handleSubmit(submit)}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength onClick={redirectConsent} disabled={disabled}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <Title>{t('CERTIFICATION.CERTIFICATION_SELECTION.TITLE')}</Title>

      {certificationTypes.map((item, idx) => {
        return (
          <div key={idx}>
            <Radio
              classes={inputClasses}
              label={t(
                `CERTIFICATION.CERTIFICATION_SELECTION.${item.certification_translation_key}`,
              )}
              name={SELECTION}
              value={item.certification_type}
              inputRef={register({ required: true })}
              onChange={() => setSelectionType(item.certification_type)}
            />
          </div>
        );
      })}

      <div style={{ marginBottom: '8px' }}>
        <Radio
          classes={inputClasses}
          label={t('common:OTHER')}
          name={SELECTION}
          value={'other'}
          inputRef={register({ required: true })}
          onChange={() => setSelectionType('other')}
        />{' '}
        {certificationType === 'other' && (
          <Infoi
            placement={'bottom'}
            content={t('CERTIFICATION.CERTIFICATION_SELECTION.TOOLTIP')}
            style={{ transform: 'translateY(-2px)' }}
          />
        )}
      </div>
      {certificationType === 'other' && role_id !== 3 && (
        <Input
          label={t('CERTIFICATION.CERTIFICATION_SELECTION.REQUEST_CERTIFICATION')}
          onChange={(e) => setRequested(e.target.value)}
          errors={
            requestedCertification === null ||
            (requestedCertification === '' && t('common:REQUIRED'))
          }
          defaultValue={
            requestedCertification !== null || requestedCertification !== ''
              ? requestedCertification
              : null
          }
        />
      )}
    </Form>
  );
}
