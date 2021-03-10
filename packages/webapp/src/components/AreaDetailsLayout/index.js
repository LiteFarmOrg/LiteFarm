import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import { useForm } from 'react-hook-form';
import FormTitleLayout from '../Form/FormTitleLayout';
import Button from '../Form/Button';

export default function AreaDetailsLayout({
  name,
  title,
  additionalProperties,
  onBack,
  onSubmit,
  onError,
  namesArray,
}) {
  const { t } = useTranslation();

  const { register, handleSubmit, watch, errors } = useForm({
    mode: 'onTouched',
  });

  const AREAFIELD = 'areaField';
  const areaField = watch(AREAFIELD, false);
  const areaInputRegister = register();

  const PERIMETERFIELD = 'perimeterField';
  const perimeterField = watch(PERIMETERFIELD, false);
  const perimeterInputRegister = register();

  const NAMEFIELD = 'nameField';
  const nameField = watch(NAMEFIELD, false);
  const nameInputRegister = register();

  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    name === 'Farm site boundary'
      ? setDisabled(!areaField || !perimeterField)
      : setDisabled(!areaField || !perimeterField || !nameField);
    // // if (name !== 'Farm site boundary') setDisabled(!nameField)
    // let prev = name[0];
    // namesArray.map((name) => {
    //   setDisabled(name || prev);
    //   prev = name;
    // })
  });

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
        name={name !== 'Farm site boundary' ? NAMEFIELD : null}
        inputRef={name !== 'Farm site boundary' ? nameInputRegister : null}
      />
      <div>
        <Input
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          type="text"
          style={{ marginBottom: '40px', width: '50%', float: 'left' }}
          name={AREAFIELD}
          inputRef={areaInputRegister}
        />
        <Input
          label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
          type="text"
          style={{ marginBottom: '40px', width: '50%', paddingLeft: '10px' }}
          name={PERIMETERFIELD}
          inputRef={perimeterInputRegister}
        />
      </div>
      {additionalProperties}
      <Input label={t('common:NOTES')} type="text" optional style={{ marginBottom: '40px' }} />
    </FormTitleLayout>
  );
}
