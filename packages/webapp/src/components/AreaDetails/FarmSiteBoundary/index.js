import React, { useEffect } from 'react';
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

  const AREAFIELD = 'areaField';
  const areaField = watch(AREAFIELD, false);
  const areaInputRegister = register();

  const PERIMETERFIELD = 'perimeterField';
  const perimeterField = watch(PERIMETERFIELD, false);
  const perimeterInputRegister = register();

  const disabled = !areaField || !perimeterField;

  const onError = (data) => {};
  const onSubmit = (data) => {};

  useEffect(() => {
    console.log(area);
  }, []);

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
          <Button type={'submit'} disabled={disabled} fullLength>
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      <AreaDetails
        name={t('FARM_MAP.FARM_SITE_BOUNDARY.NAME')}
        onBack={onGoBack}
        AREAFIELD={AREAFIELD}
        areaInputRegister={areaInputRegister}
        PERIMETERFIELD={PERIMETERFIELD}
        perimeterInputRegister={perimeterInputRegister}
      />
    </FormTitleLayout>
  );
}
