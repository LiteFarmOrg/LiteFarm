import React from 'react';
import TitleLayout from '../Layout/TitleLayout';
import Button from '../Form/Button';
import { useTranslation } from 'react-i18next';
import Input from '../Form/Input';
import { useForm } from 'react-hook-form';

export default function AreaDetails({ title, name, onBack }) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, errors } = useForm({
    mode: 'onTouched',
  });
  const onError = (data) => {};
  const onSubmit = (data) => {};

  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <TitleLayout
        onGoBack={onBack}
        title={title}
        style={{ flexGrow: 9, order: 2 }}
        buttonGroup={
          <>
            <Button onClick={onBack} color={'secondary'} fullLength>
              {t('common:CANCEL')}
            </Button>
            <Button type={'submit'} fullLength>
              {t('common:SAVE')}
            </Button>
          </>
        }
      >
        <Input label={name} type="text" optional style={{ marginBottom: '30px' }} />
        <div>
          <Input
            label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
            type="text"
            style={{ marginBottom: '30px', width: '50%', float: 'left' }}
          />
          <Input
            label={t('FARM_MAP.AREA_DETAILS.PERIMETER')}
            type="text"
            style={{ marginBottom: '30px', width: '50%', paddingLeft: '10px' }}
          />
        </div>
        <Input
          label={t('FARM_MAP.AREA_DETAILS.NOTES')}
          type="text"
          optional
          style={{ marginBottom: '30px' }}
        />
      </TitleLayout>
    </form>
  );
}
