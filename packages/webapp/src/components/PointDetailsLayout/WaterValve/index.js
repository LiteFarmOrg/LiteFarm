import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '..';
import FormTitleLayout from '../../Form/FormTitleLayout';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import Input from '../../Form/Input';
import Radio from '../../Form/Radio';

export default function PureWaterValve({ history }) {
  const { t } = useTranslation();
  const { register, handleSubmit, watch, errors, setValue } = useForm({
    mode: 'onTouched',
  });
  const onError = (data) => {};
  const onSubmit = (data) => {};

  const WATER_TYPE = 'water_type';

  const onCancel = () => {
    history.push('/map');
  };

  const onBack = () => {
    history.push({
      pathname: '/map',
      isStepBack: true,
    });
  };

  return (
    <FormTitleLayout
      onGoBack={onBack}
      onSubmit={handleSubmit(onSubmit, onError)}
      title={t('FARM_MAP.WATER_VALVE.TITLE')}
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
      <PointDetails name={t('FARM_MAP.WATER_VALVE.NAME')} setValue={setValue}>
        <div>
          <p style={{ marginBottom: '25px' }}>{t('FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE')}</p>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('FARM_MAP.WATER_VALVE.MUNICIPAL_WATER')}
              defaultChecked={true}
              name={WATER_TYPE}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('FARM_MAP.WATER_VALVE.SURFACE_WATER')}
              name={WATER_TYPE}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('FARM_MAP.WATER_VALVE.GROUNDWATER')}
              name={WATER_TYPE}
            />
          </div>
          <div>
            <Radio
              style={{ marginBottom: '25px' }}
              label={t('FARM_MAP.WATER_VALVE.RAIN_WATER')}
              name={WATER_TYPE}
            />
          </div>
          <Input
            label={t('FARM_MAP.WATER_VALVE.MAX_FLOW_RATE')}
            type="number"
            optional
            style={{ marginBottom: '40px' }}
            hookFormSetValue={setValue}
          />
        </div>
      </PointDetails>
    </FormTitleLayout>
  );
}
