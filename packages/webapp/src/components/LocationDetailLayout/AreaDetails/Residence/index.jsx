import { residenceEnum } from '../../../../containers/constants';
import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureResidenceWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureResidence {...props} />
    </PersistedFormWrapper>
  );
}

export function PureResidence({
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
    data[residenceEnum.total_area_unit] = data[residenceEnum.total_area_unit]?.value;

    data[residenceEnum.perimeter_unit] = data[residenceEnum.perimeter_unit]?.value;
    const formData = getFormDataWithoutNulls({
      ...persistedFormData,
      ...data,

      type: 'residence',
    });
    submitForm({ formData });
  };

  return (
    <PureLocationDetailLayout
      system={system}
      locationType={'residence'}
      locationCategory={'area'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'RESIDENCE'}
      showPerimeter={false}
      tabs={['tasks', 'details']}
    />
  );
}
