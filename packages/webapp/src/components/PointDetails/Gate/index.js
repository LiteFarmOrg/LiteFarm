import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '..';
import FormTitleLayout from '../../Form/FormTitleLayout';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';

export default function PureGate({ onGoBack }) {
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
      title={t('FARM_MAP.GATE.TITLE')}
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
      <PointDetails
        name={t('FARM_MAP.GATE.NAME')}
        onBack={onGoBack}
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
      />
    </FormTitleLayout>
  );
}
