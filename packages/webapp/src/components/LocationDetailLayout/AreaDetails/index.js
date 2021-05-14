import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import PureWarningBox from '../../WarningBox';
import { Label } from '../../Typography';
import Unit from '../../Form/Unit';
import { fieldEnum as areaEnum } from '../../../containers/constants';
import { area_perimeter, area_total_area } from '../../../util/unit';
import InputAutoSize from "../../Form/InputAutoSize";

export default function AreaDetails({
  name,
  register,
  showPerimeter,
  setValue,
  getValues,
  setError,
  control,
  watch,
  history,
  children,
  errors,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  total_area,
  perimeter,
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
      {errorMessage && (
        <PureWarningBox style={{ border: '1px solid var(--red700)', marginBottom: '48px' }}>
          <Label style={{ marginBottom: '12px' }}>{errorMessage}</Label>
        </PureWarningBox>
      )}
      <Input
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
          hookFormSetError={setError}
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
            hookFormSetError={setError}
            hookFromWatch={watch}
            control={control}
            required
            defaultValue={perimeter}
            disabled={isViewLocationPage}
          />
        )}
      </div>
      {children}
      <InputAutoSize optional={true}
                     label={t('common:NOTES')}
                     tyle={{ marginBottom: '40px'}}
                     hookFormRegister={register(areaEnum.notes)}
                     disabled={isViewLocationPage}/>
    </>
  );
}
