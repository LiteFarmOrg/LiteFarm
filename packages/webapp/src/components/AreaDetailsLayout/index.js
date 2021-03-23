import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
import { useSelector } from 'react-redux';
import { locationInfoSelector } from '../../containers/mapSlice';
import PureWarningBox from '../WarningBox';
import { Label } from '../Typography';
import Unit from '../Form/Unit';
import { fieldEnum as areaEnum } from '../../containers/fieldSlice';

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
  history,
  children,
  errors,
  system,
}) {
  const { t } = useTranslation();
  const { area: defaultArea, perimeter: defaultPerimeter } = useSelector(locationInfoSelector);
  const [notes, setNotes] = useState('');
  const [isOnline, setNetwork] = useState(window.navigator.onLine);

  useEffect(() => {
    window.addEventListener('offline', () => setNetwork(window.navigator.onLine));
    window.addEventListener('online', () => setNetwork(window.navigator.onLine));
  }, []);

  const onCancel = () => {
    history.push('/map');
  };

  const onBack = () => {
    history.push({
      pathname: '/map',
      isStepBack: true,
    });
  };

  const setNotesValue = (value) => {
    setNotes(value);
  };

  const onSubmit = (data) => {
    data[areaEnum.total_area_unit] = data[areaEnum.total_area_unit].value;
    showPerimeter
      ? (data[areaEnum.perimeter_unit] = data[areaEnum.perimeter_unit].value)
      : (data.perimeter = defaultPerimeter);
    if (data.name === '') {
      data.name = 'Farm site boundary';
    }
    data.notes = notes;
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
      {!isOnline && (
        <PureWarningBox style={{ border: '1px solid var(--red700)', marginBottom: '48px' }}>
          <Label style={{ marginBottom: '12px' }}>{t('FARM_MAP.AREA_DETAILS.NETWORK')}</Label>
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
          defaultValue={defaultArea}
          errors={errors[areaEnum.total_area]}
          from={'m2'}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFormSetError={setError}
          control={control}
          required
        />
        {showPerimeter && (
          <Unit
            register={register}
            classes={{ container: { flexGrow: 1 } }}
            label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
            name={areaEnum.perimeter}
            displayUnitName={areaEnum.perimeter_unit}
            defaultValue={defaultPerimeter}
            errors={errors[areaEnum.perimeter]}
            from={'m'}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFormSetError={setError}
            control={control}
            required
          />
        )}
      </div>
      {children}
      <Input
        label={t('common:NOTES')}
        type="text"
        optional
        style={{ marginBottom: '40px' }}
        hookFormSetValue={setValue}
        onChange={(e) => setNotesValue(e.target.value)}
      />
    </FormTitleLayout>
  );
}
