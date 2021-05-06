import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import { fenceEnum as lineEnum } from '../../../containers/constants';
import PureWarningBox from '../../WarningBox';
import { Label } from '../../Typography';

export default function LineDetails({
  name,
  register,
  setValue,
  history,
  children,
  errors,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
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
    if (history?.location?.state?.error && !history?.location?.state?.error?.retire) {
      setErrorMessage(history?.location?.state?.error);
    }
  }, [history?.location?.state?.error]);

  return (
    <>
      {errorMessage && !isViewLocationPage && (
        <PureWarningBox style={{ border: '1px solid var(--red700)', marginBottom: '48px' }}>
          <Label style={{ marginBottom: '12px' }}>{errorMessage}</Label>
        </PureWarningBox>
      )}
      <Input
        label={name}
        type="text"
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(lineEnum.name, { required: true })}
        errors={errors[lineEnum.name] && t('common:REQUIRED')}
        showCross={false}
        disabled={isViewLocationPage}
      />
      {children}
      <Input
        label={t('common:NOTES')}
        type="text"
        optional
        hookFormRegister={register(lineEnum.notes)}
        style={{ marginBottom: '40px' }}
        disabled={isViewLocationPage}
      />
    </>
  );
}
