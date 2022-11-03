import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import { fenceEnum as lineEnum } from '../../../containers/constants';
import PureWarningBox from '../../WarningBox';
import { Label } from '../../Typography';
import InputAutoSize from '../../Form/InputAutoSize';
import { useFormContext } from 'react-hook-form';

export default function LineDetails({
  name,
  history,
  children,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
}) {
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
        data-cy="lineDetails-name"
        label={name}
        type="text"
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(lineEnum.name, { required: true })}
        errors={errors[lineEnum.name] && t('common:REQUIRED')}
        showCross={false}
        disabled={isViewLocationPage}
      />
      {children}
      <InputAutoSize
        label={t('common:NOTES')}
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(lineEnum.notes, {
          maxLength: { value: 10000, message: t('FARM_MAP.NOTES_CHAR_LIMIT') },
        })}
        disabled={isViewLocationPage}
        optional
        errors={errors[lineEnum.notes]?.message}
      />
    </>
  );
}
