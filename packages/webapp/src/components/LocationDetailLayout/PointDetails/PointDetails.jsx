import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import { gateEnum as pointEnum } from '../../../containers/constants';
import PureWarningBox from '../../WarningBox';
import { Label } from '../../Typography';
import InputAutoSize from '../../Form/InputAutoSize';
import { useFormContext } from 'react-hook-form';
import { useLocation } from 'react-router-dom-v5-compat';

export default function PointDetails({ name, children, isViewLocationPage }) {
  let location = useLocation();
  const { t } = useTranslation();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext();
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
    if (location?.state?.error) {
      setErrorMessage(location?.state?.error);
    }
  }, [location?.state?.error]);

  return (
    <>
      {errorMessage && !isViewLocationPage && (
        <PureWarningBox style={{ border: '1px solid var(--red700)', marginBottom: '48px' }}>
          <Label style={{ marginBottom: '12px' }}>{errorMessage}</Label>
        </PureWarningBox>
      )}
      <Input
        data-cy="pointDetails-name"
        label={name}
        type="text"
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(pointEnum.name, { required: true })}
        errors={errors[pointEnum.name] && t('common:REQUIRED')}
        disabled={isViewLocationPage}
      />

      {children}
      <InputAutoSize
        label={t('common:NOTES')}
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(pointEnum.notes, {
          maxLength: { value: 10000, message: t('FARM_MAP.NOTES_CHAR_LIMIT') },
        })}
        disabled={isViewLocationPage}
        optional
        errors={errors[pointEnum.notes]?.message}
      />
    </>
  );
}
