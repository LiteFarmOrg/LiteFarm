import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import {fieldEnum as areaEnum, gateEnum as pointEnum} from '../../../containers/constants';
import PureWarningBox from '../../WarningBox';
import { Label } from '../../Typography';
import InputAutoSize from "../../Form/InputAutoSize";

export default function PointDetailsLayout({
  name,

  children,
  setValue,

  history,

  register,
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
    if (history?.location?.state?.error) {
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
        hookFormRegister={register(pointEnum.name, { required: true })}
        errors={errors[pointEnum.name] && t('common:REQUIRED')}
        disabled={isViewLocationPage}
      />

      {children}
      <InputAutoSize optional={true} label={t('common:NOTES')}
                     style={{ marginBottom: '40px'}}
                     hookFormRegister={register(pointEnum.notes)}
                     disabled={isViewLocationPage}/>
    </>
  );
}
