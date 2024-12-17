import React from 'react';
import { useTranslation } from 'react-i18next';
import AreaDetails from '../AreaDetails';
import { useForm } from 'react-hook-form';
import LocationButtons from '../../LocationButtons';
import { naturalAreaEnum } from '../../../../containers/constants';
import Form from '../../../Form';
import LocationPageHeader from '../../LocationPageHeader';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';
import { FieldDetailsChildren } from '../Field';

export default function PureNaturalAreaWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureNaturalArea {...props} />
    </PersistedFormWrapper>
  );
}

export function PureNaturalArea({
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
  const { t } = useTranslation();
  const onSubmit = (data) => {
    data[naturalAreaEnum.total_area_unit] = data[naturalAreaEnum.total_area_unit]?.value;
    data[naturalAreaEnum.perimeter_unit] = data[naturalAreaEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'natural_area',
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      history={history}
      system={system}
      locationType={'natural_area'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'NATURAL_AREA'}
      showPerimeter={true}
      tabs={['tasks', 'details']}
    />
  );
}
