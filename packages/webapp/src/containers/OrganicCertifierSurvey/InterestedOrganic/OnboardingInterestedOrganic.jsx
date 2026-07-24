import React from 'react';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { PureInterestedOrganic } from '../../../components/OrganicCertifierSurvey/InterestedOrganic/PureInterestedOrganic';
import Spinner from '../../../components/Loading/LoadingV2/Spinner';
import {
  useGetCertificationsQuery,
  useAddCertificationMutation,
  useDeleteCertificationMutation,
} from '../../../store/api/certificationsApi';
import { patchStepFour } from '../saga';
import { enqueueErrorSnackbar } from '../../Snackbar/snackbarSlice';

export default function OnboardingInterestedOrganic() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { data: certifications = [], isLoading } = useGetCertificationsQuery();
  const [addCertification] = useAddCertificationMutation();
  const [deleteCertification] = useDeleteCertificationMutation();

  const onGoBack = () => {
    history.push('/consent');
  };

  const onSubmit = async (data) => {
    try {
      if (data.interested) {
        if (!certifications.length) {
          await addCertification({ is_active: false }).unwrap();
        }
      } else if (certifications.length) {
        await Promise.all(
          certifications.map((certification) => deleteCertification(certification.id).unwrap()),
        );
      }
      dispatch(patchStepFour());
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ORGANIC_CERTIFIER_SURVEY.ERROR.CREATE')));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  const survey = certifications.length ? { interested: true } : {};

  return <PureInterestedOrganic onSubmit={onSubmit} onGoBack={onGoBack} survey={survey} />;
}
