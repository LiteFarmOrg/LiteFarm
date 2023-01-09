import React from 'react';
import { useTranslation } from 'react-i18next';
import PointDetails from '../PointDetails';
import { useForm, useFormContext } from 'react-hook-form';
import Unit from '../../../Form/Unit';
import { waterValveEnum } from '../../../../containers/constants';
import { water_valve_flow_rate } from '../../../../util/convert-units/unit';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';

import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import RadioGroup from '../../../Form/RadioGroup';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureWaterValveWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureWaterValve {...props} />
    </PersistedFormWrapper>
  );
}

export function PureWaterValve({
  history,
  match,
  submitForm,
  system,
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  persistedFormData,
  useHookFormPersist,
  handleRetire,
  isAdmin,
}) {
  const onSubmit = (data) => {
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
    });
    formData[waterValveEnum.flow_rate_unit] = formData[waterValveEnum.flow_rate_unit]?.value;
    submitForm({ formData });
  };
  return (
    <PureLocationDetailLayout
      history={history}
      match={match}
      locationType={'water_valve'}
      locationCategory={'point'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'WATER_VALVE'}
      detailsChildren={
        <WaterValveDetailsChildren isViewLocationPage={isViewLocationPage} system={system} />
      }
      tabs={['tasks', 'details']}
    />
  );
}

export function WaterValveDetailsChildren({ isViewLocationPage, system }) {
  const { t } = useTranslation();
  const {
    control,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <Label style={{ marginBottom: '25px' }}>
        {t('FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE')}
        <Label sm style={{ marginLeft: '4px' }}>
          {t('common:OPTIONAL')}
        </Label>
      </Label>
      <RadioGroup
        disabled={isViewLocationPage}
        hookFormControl={control}
        style={{ marginBottom: '14px' }}
        name={waterValveEnum.source}
        radios={[
          {
            label: t('FARM_MAP.WATER_VALVE.MUNICIPAL_WATER'),
            value: 'Municipal water',
          },
          {
            label: t('FARM_MAP.WATER_VALVE.SURFACE_WATER'),
            value: 'Surface water',
          },
          {
            label: t('FARM_MAP.WATER_VALVE.GROUNDWATER'),
            value: 'Groundwater',
          },
          {
            label: t('FARM_MAP.WATER_VALVE.RAIN_WATER'),
            value: 'Rain water',
          },
        ]}
      />

      <Unit
        register={register}
        classes={{ container: { flexGrow: 1, paddingBottom: '40px' } }}
        label={t('FARM_MAP.WATER_VALVE.MAX_FLOW_RATE')}
        name={waterValveEnum.flow_rate}
        displayUnitName={waterValveEnum.flow_rate_unit}
        errors={errors[waterValveEnum.flow_rate]}
        unitType={water_valve_flow_rate}
        system={system}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        optional
        disabled={isViewLocationPage}
      />
    </div>
  );
}
