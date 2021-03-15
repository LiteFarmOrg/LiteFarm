import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
import { useSelector } from 'react-redux';
import { locationInfoSelector } from '../../containers/mapSlice';
import PureWarningBox from '../WarningBox';
import { Label } from '../Typography';

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
  history,
  children,
  errors,
  areaType,
}) {
  const { t } = useTranslation();
  const { area: defaultArea, perimeter: defaultPerimeter } = useSelector(locationInfoSelector);
  const [notes, setNotes] = useState('');
  const [isOnline, setNetwork] = useState(window.navigator.onLine);

  useEffect(() => {
    window.addEventListener('offline', () => setNetwork(window.navigator.onLine));
    window.addEventListener('online', () => setNetwork(window.navigator.onLine));
  });

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
      <div>
        <Input
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          type="number"
          style={{ marginBottom: '40px', width: '50%', float: 'left' }}
          name={areaType.total_area}
          inputRef={register({ required: true })}
          defaultValue={defaultArea}
        />
        {showPerimeter && (
          <Input
            label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
            type="number"
            style={{ marginBottom: '40px', width: '50%', paddingLeft: '10px' }}
            name={areaType.perimeter}
            inputRef={register({ required: true })}
            defaultValue={defaultPerimeter}
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
