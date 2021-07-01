import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import PureCertificationSurveyPage from '../../../components/CertificationSurvey';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';

function CertificationSurveyPage({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onExport = () => {
    // TODO: dispatch action and history push
    console.log('clicked export button');
  };

  const certiferSurvey = useSelector(certifierSurveySelector);

  return (
    <PureCertificationSurveyPage
      onExport={onExport}
      handleGoBack={() => history.push('/certification/report_period')}
      handleCancel={() => history.push('/certification')}
      certifierSurvey={certiferSurvey}
    />
  );
}

export default CertificationSurveyPage;
