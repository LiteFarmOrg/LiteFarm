import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm, useFormContext } from 'react-hook-form';
import { surfaceWaterEnum } from '../../../../containers/constants';
import { Label } from '../../../Typography';
import LocationButtons from '../../LocationButtons';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';

import RadioGroup from '../../../Form/RadioGroup';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';
import { FieldDetailsChildren } from '../Field';

export default function PureSurfaceWaterWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureSurfaceWater {...props} />
    </PersistedFormWrapper>
  );
}

export function PureSurfaceWater({
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
    const usedForIrrigation = data[surfaceWaterEnum.used_for_irrigation];
    data[surfaceWaterEnum.total_area_unit] = data[surfaceWaterEnum.total_area_unit]?.value;
    data[surfaceWaterEnum.perimeter_unit] = data[surfaceWaterEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: 'surface_water',
      used_for_irrigation: usedForIrrigation,
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      match={match}
      system={system}
      locationType={'surface_water'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'SURFACE_WATER'}
      detailsChildren={<SurfaceWaterDetailsChildren isViewLocationPage={isViewLocationPage} />}
      showPerimeter={true}
      tabs={['tasks', 'details']}
    />
  );
}

export function SurfaceWaterDetailsChildren({ isViewLocationPage }) {
  const { t } = useTranslation();
  const { control } = useFormContext();
  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <Label style={{ paddingRight: '10px', display: 'inline-block' }}>
          {t('FARM_MAP.SURFACE_WATER.IRRIGATION')}
        </Label>
        <Label style={{ display: 'inline-block' }} sm>
          {t('common:OPTIONAL')}
        </Label>
      </div>
      <div style={{ marginBottom: '16px' }}>
        <RadioGroup
          row
          disabled={isViewLocationPage}
          name={surfaceWaterEnum.used_for_irrigation}
          hookFormControl={control}
        />
      </div>
    </div>
  );
}
