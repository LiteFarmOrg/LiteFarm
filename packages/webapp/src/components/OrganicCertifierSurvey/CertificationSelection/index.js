import Form from '../../Form';
import Button from '../../Form/Button';
import Radio from '../../Form/Radio';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Infoi from '../../Tooltip/Infoi';
import Input from '../../Form/Input';
import { useForm } from 'react-hook-form';
import PageTitle from '../../PageTitle/v2';

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
  const {
    register,
    handleSubmit,
    setValue,

    formState: { errors },
  } = useForm({
    mode: 'onChange',
  });
  const SELECTION = 'selection';
  const [selectionName, setSelectionName] = useState(certification.certificationName || null);
  const [selectionID, setSelectionID] = useState(certification.certification_id || null);
  const REQUESTED = 'requested';
  const [requested, setRequested] = useState(certification.requestedCertification || null);

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    if (selectionName) {
      dispatch(
        selectedCertification({
          certificationName: selectionName,
          certification_id: selectionID,
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
          <Button type={'submit'} fullLength onClick={redirectConsent} disabled={disabled}>
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

      {allSupportedCertificationTypes.map((item, idx) => {
        return (
          <div key={idx}>
            <Radio
              classes={inputClasses}
              label={t(`certifications:${item.certification_translation_key}`)}
              value={item.certification_type}
              hookFormRegister={register(SELECTION, { required: true })}
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
          value={'Other'}
          hookFormRegister={register(SELECTION, { required: true })}
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
