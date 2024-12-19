import { PureInterestedOrganic } from '../../../components/OrganicCertifierSurvey/InterestedOrganic/PureInterestedOrganic';
import { useDispatch, useSelector } from 'react-redux';
import { certifierSurveySelector } from '../slice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { getOrganicSurveyReqBody } from '../SetCertificationSummary/utils/getOrganicSurveyReqBody';
import { putOrganicCertifierSurvey } from '../saga';
import { useNavigate } from 'react-router-dom-v5-compat';

export default function UpdateInterestedOrganic() {
  let navigate = useNavigate();
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();

  const goBackPath = '/certification';
  const onGoBack = () => {
    navigate(goBackPath);
  };
  const certificationSelectionPath = '/certification/selection';

  const onSubmit = (data) => {
    if (data.interested) {
      navigate(certificationSelectionPath);
    } else {
      const reqBody = getOrganicSurveyReqBody({ interested: false, survey_id: survey.survey_id });
      const callback = () => navigate('/certification', { state: { success: true } });
      dispatch(putOrganicCertifierSurvey({ survey: reqBody, callback }));
    }
  };

  return (
    <HookFormPersistProvider>
      <PureInterestedOrganic
        onSubmit={onSubmit}
        onGoBack={onGoBack}
        persistedPathNames={[certificationSelectionPath]}
        survey={survey}
      />
    </HookFormPersistProvider>
  );
}
