import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CertificationsModal from '../../../../components/Modals/CertificationsModal';
import { isAdminSelector } from '../../../userFarmSlice';
import { doesCertifierSurveyExistSelector } from '../../../OrganicCertifierSurvey/slice';
import { postOrganicCertifierSurvey } from '../../../OrganicCertifierSurvey/saga';
import { getOrganicSurveyReqBody } from '../../../OrganicCertifierSurvey/SetCertificationSummary/utils/getOrganicSurveyReqBody';
import { setIntroducingCertifications } from '../../../Navigation/navbarSlice';
import history from '../../../../history';

export default function CertificationsSpotlight() {
  const dispatch = useDispatch();

  // const doesCertifierSurveyExist = useSelector(doesCertifierSurveyExistSelector);
  // const isAdmin = useSelector(isAdminSelector);
  // const [showCertificationsModal, setShowCertificationsModal] = useState(
  //   !doesCertifierSurveyExist && isAdmin,
  // );
  const onClickMaybeLater = () => {
    // dispatch(
    //   postOrganicCertifierSurvey({
    //     survey: getOrganicSurveyReqBody({ interested: false }),
    //   }),
    // );
    dispatch(setIntroducingCertifications(true));
  };
  const onClickCertificationsYes = () => {
    dispatch(
      postOrganicCertifierSurvey({
        survey: getOrganicSurveyReqBody({ interested: false }),
        callback: () => history.push('/certification/interested_in_organic'),
      }),
    );
  };
  const onDismissStepTwoModal = () => {
    // setShowCertificationsModal(false);
    dispatch(
      postOrganicCertifierSurvey({
        survey: getOrganicSurveyReqBody({ interested: false }),
      }),
    );
    dispatch(setIntroducingCertifications(false));
  };

  return (
    <CertificationsModal
      handleClickMaybeLater={onClickMaybeLater}
      handleClickYes={onClickCertificationsYes}
      dismissStepTwoModal={onDismissStepTwoModal}
    />
  );
}
