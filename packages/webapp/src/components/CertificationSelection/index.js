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
  allSupportedCertificationTypes,
  certification,
  selectedCertification,
  redirectConsent,
  onGoBack,
  dispatch,
  role_id,
}) {
  const { t } = useTranslation(['translation', 'common', 'certifications']);
  const { register, handleSubmit, errors, setValue } = useForm({
    mode: 'onChange',
  });
  const SELECTION = 'selection';
  const [selectionName, setSelectionName] = useState(certification.certificationName || null);
  const [selectionID, setSelectionID] = useState(certification.certificationID || null);
  const REQUESTED = 'requested';
  const [requested, setRequested] = useState(certification.requestedCertification || null);

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (selectionName) {
      dispatch(
        selectedCertification({
          certificationName: selectionName,
          certificationID: selectionID,
          requestedCertification: requested,
        }),
      );
    }

    setValue(SELECTION, selectionName);
    setDisabled(!selectionName || (selectionName === 'Other' && !requested));
  }, [selectionName, selectionID, requested]);

  const submit = () => {
    onSubmit();
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

      {allSupportedCertificationTypes.map((item, idx) => {
        return (
          <div key={idx}>
            <Radio
              classes={inputClasses}
              label={t(`certifications:${item.certification_translation_key}`)}
              name={SELECTION}
              value={item.certification_type}
              inputRef={register({ required: true })}
              onChange={() => {
                setSelectionName(item.certification_type);
                setSelectionID(item.certification_id);
                setRequested(null);
              }}
            />
          </div>
        );
      })}

      <div style={{ marginBottom: '8px' }}>
        <Radio
          classes={inputClasses}
          label={t('common:OTHER')}
          name={SELECTION}
          value={'Other'}
          inputRef={register({ required: true })}
          onChange={() => {
            setSelectionName('Other');
            setSelectionID(null);
          }}
        />{' '}
        {selectionName === 'Other' && (
          <Infoi
            placement={'bottom'}
            content={t('CERTIFICATION.CERTIFICATION_SELECTION.TOOLTIP')}
            style={{ transform: 'translateY(-2px)' }}
          />
        )}
      </div>
      {selectionName === 'Other' && role_id !== 3 && (
        <Input
          label={t('CERTIFICATION.CERTIFICATION_SELECTION.REQUEST_CERTIFICATION')}
          onChange={(e) => {
            setRequested(e.target.value);
          }}
          name={REQUESTED}
          defaultValue={requested}
          errors={errors[REQUESTED] && t('common:REQUIRED')}
        />
      )}
    </Form>
  );
}
