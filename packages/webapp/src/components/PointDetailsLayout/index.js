import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
import { gateEnum as pointEnum } from '../../containers/gateSlice';
import { fieldEnum as areaEnum } from '../../containers/fieldSlice';
import PureWarningBox from '../WarningBox';
import { Label } from '../Typography';

export default function PointDetailsLayout({
  name,
  title,
  submitForm,
  children,
  setValue,
  handleSubmit,
  history,
  onError,
  register,
  disabled,
  errors,
}) {
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState();

  useEffect(() => {
    const handleOffline = () => setErrorMessage(t('FARM_MAP.AREA_DETAILS.NETWORK'));
    const handleOnline = () => setErrorMessage(null);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  useEffect(() => {
    if (history?.location?.state?.error) {
      setErrorMessage(history?.location?.state?.error);
    }
  }, [history?.location?.state?.error]);
  const onCancel = () => {
    history.push('/map');
  };

  const onBack = () => {
    history.push({
      pathname: '/map',
      isStepBack: true,
    });
  };

  const onSubmit = (data) => {
    submitForm(data);
  };

  return (
    <FormTitleLayout
      onGoBack={onBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={title}
      onCancel={onCancel}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button type={'submit'} disabled={disabled} fullLength>
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      {errorMessage && (
        <PureWarningBox style={{ border: '1px solid var(--red700)', marginBottom: '48px' }}>
          <Label style={{ marginBottom: '12px' }}>{errorMessage}</Label>
        </PureWarningBox>
      )}
      <Input
        label={name + ' name'}
        type="text"
        style={{ marginBottom: '40px' }}
        name={pointEnum.name}
        inputRef={register({ required: true })}
        errors={errors[pointEnum.name] && t('common:REQUIRED')}
      />

      {children}
      <Input
        label={t('common:NOTES')}
        type="text"
        optional
        style={{ marginBottom: '40px' }}
        hookFormSetValue={setValue}
        inputRef={register}
        name={areaEnum.notes}
      />
    </FormTitleLayout>
  );
}
