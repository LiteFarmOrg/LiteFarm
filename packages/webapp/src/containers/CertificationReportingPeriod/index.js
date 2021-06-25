import React from 'react';
import PureCertificationReportingPeriod from '../../components/CertificationReportingPeriod';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../hooks/useHookFormPersist/hookFormPersistSlice';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../userFarmSlice';

function CertificationReportingPeriod({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const persistedFormData = useSelector(hookFormPersistSelector);
  const { email } = useSelector(userFarmSelector);
  const onError = (error) => {
    console.log(error);
  };
  const onContinue = (data) => {
    // TODO: dispatch action and history push
    console.log(data);
  };

  return (
    <HookFormPersistProvider>
      <PureCertificationReportingPeriod
        onSubmit={onContinue}
        onError={onError}
        handleGoBack={() => console.log('TODO: replace with proper goBack history push')}
        handleCancel={() => console.log('TODO: replace with proper cancel history push')}
        defaultEmail={email}
      />
    </HookFormPersistProvider>
  );
}

export default CertificationReportingPeriod;
