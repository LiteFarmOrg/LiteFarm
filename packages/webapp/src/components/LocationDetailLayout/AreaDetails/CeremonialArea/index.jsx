import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../LocationButtons';
import { ceremonialEnum } from '../../../../containers/constants';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';
import { BarnDetailChildren } from '../Barn';

export default function PureCeremonialAreaWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureCeremonialArea {...props} />
    </PersistedFormWrapper>
  );
}

export function PureCeremonialArea({
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
    data[ceremonialEnum.total_area_unit] = data[ceremonialEnum.total_area_unit]?.value;
    data[ceremonialEnum.perimeter_unit] = data[ceremonialEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,
      type: 'ceremonial_area',
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      system={system}
      locationType={'ceremonial_area'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'CEREMONIAL_AREA'}
      tabs={['tasks', 'details']}
      showPerimeter={true}
    />
  );
}
