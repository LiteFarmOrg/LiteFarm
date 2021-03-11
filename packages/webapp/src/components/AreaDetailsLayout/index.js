import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import { useForm } from 'react-hook-form';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';
import fieldEnum from '../../containers/fieldSlice';

export default function AreaDetailsLayout({
  name,
  title,
  additionalProperties,
  onBack,
  onSubmit,
  onError,
  isNameRequired,
  disabled,
  register,
  handleSubmit,
}) {
  const { t } = useTranslation();

  return (
    <FormTitleLayout
      onGoBack={onBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={title}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button onClick={onBack} color={'secondary'} fullLength>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} disabled={disabled} fullLength>
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      <Input
        label={name + ' name'}
        type="text"
        optional={name === 'Farm site boundary' ? true : false}
        style={{ marginBottom: '40px' }}
        name={fieldEnum.name}
        inputRef={register({ nameRequired: isNameRequired })}
      />
      <div>
        <Input
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          type="text"
          style={{ marginBottom: '40px', width: '50%', float: 'left' }}
          name={fieldEnum.total_area}
          inputRef={register({ required: true })}
        />
        <Input
          label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
          type="text"
          style={{ marginBottom: '40px', width: '50%', paddingLeft: '10px' }}
          name={fieldEnum.perimeter}
          inputRef={register({ required: true })}
        />
      </div>
      {additionalProperties}
      <Input label={t('common:NOTES')} type="text" optional style={{ marginBottom: '40px' }} />
    </FormTitleLayout>
  );
}
