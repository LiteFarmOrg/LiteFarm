import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
import PureWarningBox from '../WarningBox';
import { Label } from '../Typography';
import Unit from '../Form/Unit';
import { fieldEnum as areaEnum } from '../../containers/constants';
import { area_perimeter, area_total_area } from '../../util/unit';

export default function AreaDetailsLayout({
  name,
  title,
  submitForm,
  onError,
  disabled,
  register,
  handleSubmit,
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
    data[areaEnum.total_area_unit] = data[areaEnum.total_area_unit].value;
    showPerimeter && (data[areaEnum.perimeter_unit] = data[areaEnum.perimeter_unit].value);

    submitForm(data);
  };

  return (
    <FormTitleLayout
      onCancel={onCancel}
      onGoBack={onBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={title}
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
        name={areaEnum.name}
        inputRef={register({ required: true })}
        errors={errors[areaEnum.name] && t('common:REQUIRED')}
        showCross={false}
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
          />
        )}
      </div>
      {children}
      <Input
        label={t('common:NOTES')}
        type="text"
        optional
        inputRef={register}
        name={areaEnum.notes}
        style={{ marginBottom: '40px' }}
        hookFormSetValue={setValue}
      />
    </FormTitleLayout>
  );
}
