import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
import { gateEnum } from '../../containers/gateSlice';
import { locationProperties } from '../../containers/locationSlice';

export default function PointDetailsLayout({
  name,
  pointName,
  title,
  submitForm,
  children,
  setValue,
  handleSubmit,
  history,
  onError,
  register,
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
      onGoBack={onBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={title}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button onClick={onCancel} color={'secondary'} fullLength>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} fullLength>
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      <Input
        label={name + ' name'}
        type="text"
        optional
        style={{ marginBottom: '40px' }}
        hookFormSetValue={setValue}
        name={pointName}
        inputRef={register({ required: false })}
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
