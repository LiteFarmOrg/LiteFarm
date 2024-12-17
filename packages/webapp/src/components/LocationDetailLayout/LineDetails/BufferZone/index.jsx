import React from 'react';
import { useTranslation } from 'react-i18next';
import LineDetails from '../LineDetails';
import { useForm, useFormContext } from 'react-hook-form';
import { bufferZoneEnum } from '../../../../containers/constants';
import Unit from '../../../Form/Unit';
import { area_total_area, line_width } from '../../../../util/convert-units/unit';
import LocationButtons from '../../LocationButtons';

import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import RouterTab from '../../../RouterTab';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';
import { FieldDetailsChildren } from '../../AreaDetails/Field';

export default function PureBufferZoneWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureBufferZone {...props} />
    </PersistedFormWrapper>
  );
}

export function PureBufferZone({
  history,
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
      type: 'buffer_zone',
    });
    formData[bufferZoneEnum.width_unit] = formData[bufferZoneEnum.width_unit]?.value;
    formData[bufferZoneEnum.length_unit] = formData[bufferZoneEnum.length_unit]?.value;
    formData[bufferZoneEnum.total_area_unit] = formData[bufferZoneEnum.total_area_unit]?.value;
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      system={system}
      locationType={'buffer_zone'}
      locationCategory={'line'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'BUFFER_ZONE'}
      detailsChildren={
        <BufferZoneDetailsChildren
          isViewLocationPage={isViewLocationPage}
          isEditLocationPage={isEditLocationPage}
          system={system}
        />
      }
      tabs={['crops', 'tasks', 'details']}
    />
  );
}

export function BufferZoneDetailsChildren({ isViewLocationPage, isEditLocationPage, system }) {
  const { t } = useTranslation();
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <div>
      <div>
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1, marginBottom: '40px' } }}
          label={t('FARM_MAP.BUFFER_ZONE.WIDTH')}
          name={bufferZoneEnum.width}
          displayUnitName={bufferZoneEnum.width_unit}
          errors={errors[bufferZoneEnum.width]}
          unitType={line_width}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={!isEditLocationPage}
        />
      </div>
      <div
        style={{
          flexDirection: 'row',
          display: 'inline-flex',
          paddingBottom: '40px',
          width: '100%',
          gap: '16px',
        }}
      >
        <Unit
          register={register}
          classes={{ container: { flexGrow: 1 } }}
          label={t('FARM_MAP.AREA_DETAILS.TOTAL_AREA')}
          name={bufferZoneEnum.total_area}
          displayUnitName={bufferZoneEnum.total_area_unit}
          errors={errors[bufferZoneEnum.total_area]}
          unitType={area_total_area}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          required
          disabled={isViewLocationPage}
        />
      </div>
    </div>
  );
}
