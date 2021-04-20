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
  selectedCertificationType,
  certificationTypes,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,
    watch,
    errors,
    setValue,
    getValues,
    setError,
    control,
    formState: { isValid, isDirty },
  } = useForm({
    mode: 'onChange',
  });
  const SELECTION = 'selection';
  const [selectionType, setSelectionType] = useState(null);
  const [disabled, setDisabled] = useState(selectedCertificationType === null);

  useEffect(() => {
    if (selectionType !== null) dispatch(setCertificationSelection(selectionType));
    setValue(SELECTION, selectedCertificationType);
    setDisabled(selectedCertificationType === null);
  }, [selectionType, selectedCertificationType]);

  return (
    <Form
      onSubmit={onSubmit}
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
        {selectedCertificationType === 'other' && (
          <Infoi
            placement={'bottom'}
            content={t('CERTIFICATION.CERTIFICATION_SELECTION.TOOLTIP')}
            style={{ transform: 'translateY(-2px)' }}
          />
        )}
      </div>
      {selectedCertificationType === 'other' && (
        <Input label={t('CERTIFICATION.CERTIFICATION_SELECTION.REQUEST_CERTIFICATION')} />
      )}
    </Form>
  );
}
