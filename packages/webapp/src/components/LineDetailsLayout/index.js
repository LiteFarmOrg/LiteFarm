import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
// import { useSelector } from 'react-redux';
// import { locationInfoSelector } from '../../containers/mapSlice';
// import PureWarningBox from '../WarningBox';
// import { Label } from '../Typography';
// import Unit from '../Form/Unit';
import { fenceEnum as lineEnum } from '../../containers/fenceSlice';

export default function LineDetailsLayout({
  name,
  title,
  submitForm,
  onError,
  disabled,
  register,
  handleSubmit,
  setValue,
  history,
  children,
  errors,
}) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState('');

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
      <Input
        label={name + ' name'}
        type="text"
        style={{ marginBottom: '40px' }}
        name={lineEnum.name}
        inputRef={register({ required: true })}
        errors={errors[lineEnum.name] && t('common:REQUIRED')}
        showCross={false}
      />
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
