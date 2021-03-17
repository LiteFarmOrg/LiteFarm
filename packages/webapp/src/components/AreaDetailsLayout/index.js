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

export default function AreaDetailsLayout({
  name,
  title,
  submitForm,
  onError,
  isNameRequired,
  disabled,
  register,
  handleSubmit,
  showPerimeter,
  setValue,
  getValues,
  control,
  history,
  children,
  errors,
  areaType,
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
    data[areaType.total_area_unit] = data[areaType.total_area_unit].value;
    data[areaType.perimeter_unit] = data[areaType.perimeter_unit].value;
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
        optional={name === 'Farm site boundary' ? true : false}
        hookFormSetValue={name === 'Farm site boundary' ? setValue : null}
        style={{ marginBottom: '40px' }}
        name={areaType.name}
        inputRef={register({ required: isNameRequired })}
        errors={errors[areaType.name] && t('common:REQUIRED')}
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
          classes={{ container: { width: 'calc(50% - 8px)' } }}
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          name={areaType.total_area}
          displayUnitName={areaType.total_area_unit}
          defaultValue={defaultArea}
          errors={errors[areaType.total_area] && t('common:REQUIRED')}
          from={'m2'}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          control={control}
          required
        />
        {showPerimeter && (
          <Unit
            register={register}
            classes={{ container: { width: 'calc(50% - 8px)' } }}
            label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
            name={areaType.perimeter}
            displayUnitName={areaType.perimeter_unit}
            defaultValue={defaultPerimeter}
            errors={errors[areaType.perimeter] && t('common:REQUIRED')}
            from={'m'}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
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
