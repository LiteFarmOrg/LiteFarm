import React from 'react';
import PureCertificationReportingPeriod from '../../../components/CertificationReportingPeriod';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { hookFormPersistSelector } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { useTranslation } from 'react-i18next';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { userFarmSelector } from '../../userFarmSlice';
import PureCertificationContactCertifierFailed from '../../../components/CertificationContactCertiferFailed';

function CertificationContactCertifierFailed({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onError = (error) => {
    console.log(error);
  };
  const onExport = () => {
    // TODO: dispatch action and history push
    console.log('clicked export button');
  };

  return (
    <PureCertificationContactCertifierFailed
      onExport={onExport}
      handleGoBack={() => console.log('TODO: replace with proper goBack history push')}
      handleCancel={() => console.log('TODO: replace with proper cancel history push')}
    />
  );
}

export default CertificationContactCertifierFailed;
