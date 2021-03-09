import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '..';
import FormTitleLayout from '../../Form/FormTitleLayout';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';

export default function PureFarmSiteBoundary({ onGoBack }) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, errors } = useForm({
    mode: 'onTouched',
  });
  const onError = (data) => {};
  const onSubmit = (data) => {};

  return (
    <FormTitleLayout
      onGoBack={onGoBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={t('FARM_MAP.FARM_SITE_BOUNDARY.TITLE')}
      style={{ flexGrow: 9, order: 2 }}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:CANCEL')}
          </Button>
          <Button type={'submit'} fullLength>
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      <AreaDetails name={t('FARM_MAP.FARM_SITE_BOUNDARY.NAME')} onBack={onGoBack} />
    </FormTitleLayout>
  );
}
