import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import Input from '../../Form/Input';
import PureWarningBox from '../../WarningBox';
import { Label } from '../../Typography';
import Unit from '../../Form/Unit';
import { fieldEnum as areaEnum } from '../../../containers/constants';
import { area_perimeter, area_total_area } from '../../../util/convert-units/unit';
import InputAutoSize from '../../Form/InputAutoSize';

export default function AreaDetails({
  name,
  showPerimeter,
  history,
  children,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  total_area,
  perimeter,
}) {
  const { t } = useTranslation();
  const {
    register,
    getValues,
    setValue,
    watch,
    control,
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
      {errorMessage && (
        <PureWarningBox style={{ border: '1px solid var(--red700)', marginBottom: '48px' }}>
          <Label style={{ marginBottom: '12px' }}>{errorMessage}</Label>
        </PureWarningBox>
      )}
      <Input
        data-cy="areaDetails-name"
        label={`${name}`}
        type="text"
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(areaEnum.name, { required: true })}
        errors={errors[areaEnum.name] && t('common:REQUIRED')}
        showCross={false}
        disabled={isViewLocationPage}
      />
      <div
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '40px',
          width: '100%',
          gap: '16px',
        }}
      >
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          name={areaEnum.total_area}
          displayUnitName={areaEnum.total_area_unit}
          errors={errors[areaEnum.total_area]}
          unitType={area_total_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          defaultValue={total_area}
          disabled={isViewLocationPage}
        />
        {showPerimeter && (
          <Unit
            register={register}
            classes={{ container: { flexGrow: 1 } }}
            label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
            name={areaEnum.perimeter}
            displayUnitName={areaEnum.perimeter_unit}
            errors={errors[areaEnum.perimeter]}
            unitType={area_perimeter}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            required
            defaultValue={perimeter}
            disabled={isViewLocationPage}
          />
        )}
      </div>
      {children}
      <InputAutoSize
        label={t('common:NOTES')}
        style={{ marginBottom: '40px' }}
        hookFormRegister={register(areaEnum.notes, {
          maxLength: { value: 10000, message: t('FARM_MAP.NOTES_CHAR_LIMIT') },
        })}
        disabled={isViewLocationPage}
        optional
        errors={errors[areaEnum.notes]?.message}
      />
    </>
  );
}
