import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import { fenceEnum as lineEnum } from '../../containers/constants';
import PureWarningBox from '../WarningBox';
import { Label } from '../Typography';

export default function LineDetailsLayout({
  name,
  title,
  submitForm,
  onError,
  disabled,
  register,
  handleSubmit,
  setValue,
  history,
  children,
  errors,
  buttonGroup,
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
  const isCreateLocationPage = history.location.pathname.includes('/create_location/');
  return (
    <FormTitleLayout
      onCancel={isCreateLocationPage && onCancel}
      onGoBack={onBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={title}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={buttonGroup}
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
        name={lineEnum.name}
        inputRef={register({ required: true })}
        errors={errors[lineEnum.name] && t('common:REQUIRED')}
        showCross={false}
      />
      {children}
      <Input
        label={t('common:NOTES')}
        type="text"
        optional
        inputRef={register}
        name={lineEnum.notes}
        style={{ marginBottom: '40px' }}
        hookFormSetValue={setValue}
      />
    </FormTitleLayout>
  );
}
