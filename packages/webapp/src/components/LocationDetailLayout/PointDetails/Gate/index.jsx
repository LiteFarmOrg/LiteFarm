import { PersistedFormWrapper } from '../../PersistedFormWrapper';
import { getFormDataWithoutNulls } from '../../../../containers/hooks/useHookFormPersist/utils';
import { PureLocationDetailLayout } from '../../PureLocationDetailLayout';

export default function PureGateWrapper(props) {
  return (
    <PersistedFormWrapper>
      <PureGate {...props} />
    </PersistedFormWrapper>
  );
}

export function PureGate({
  isCreateLocationPage,
  isViewLocationPage,
  isEditLocationPage,
  submitForm,
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
    submitForm({ formData });
  };
  return (
    <PureLocationDetailLayout
      locationType={'gate'}
      locationCategory={'point'}
      isCreateLocationPage={isCreateLocationPage}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
      persistedFormData={persistedFormData}
      useHookFormPersist={useHookFormPersist}
      handleRetire={handleRetire}
      isAdmin={isAdmin}
      onSubmit={onSubmit}
      translationKey={'GATE'}
      tabs={['tasks', 'details']}
    />
  );
}
