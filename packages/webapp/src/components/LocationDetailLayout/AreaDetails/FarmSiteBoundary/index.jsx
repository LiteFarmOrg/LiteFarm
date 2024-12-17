import React from 'react';
import { farmSiteBoundaryEnum } from '../../../../containers/constants';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureFarmSiteBoundaryWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureFarmSiteBoundary {...props} />
    </PersistedFormWrapper>
  );
}

export function PureFarmSiteBoundary({
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
    data[farmSiteBoundaryEnum.total_area_unit] = data[farmSiteBoundaryEnum.total_area_unit]?.value;
    data[farmSiteBoundaryEnum.perimeter_unit] = data[farmSiteBoundaryEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'farm_site_boundary',
    });
    submitForm({ formData });
  };
  return (
    <PureLocationDetailLayout
      history={history}
      system={system}
      locationType={'farm_site_boundary'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'FARM_SITE_BOUNDARY'}
      tabs={['tasks', 'details']}
      showPerimeter={true}
    />
  );
}
