import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { isAdminSelector, userFarmSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import FarmSwitchOutro from '../FarmSwitchOutro';
import RequestConfirmationComponent from '../../components/Modals/RequestConfirmationModal';
import { dismissHelpRequestModal, showHelpRequestModalSelector } from './homeSlice';
import {
  chooseFarmFlowSelector,
  endSwitchFarmModal,
  switchFarmSelector,
} from '../ChooseFarm/chooseFarmFlowSlice';
import NotifyUpdatedFarmModal from '../../components/Modals/NotifyUpdatedFarmModal';
import { showedSpotlightSelector } from '../showedSpotlightSlice';
import { setSpotlightToShown } from '../Map/saga';
import PreparingExportModal from '../../components/Modals/PreparingExportModal';
import { doesCertifierSurveyExistSelector } from '../OrganicCertifierSurvey/slice';
import { CertificationsModal } from '../../components/Modals/CertificationsModal';
import { postOrganicCertifierSurvey } from '../OrganicCertifierSurvey/saga';
import { getOrganicSurveyReqBody } from '../OrganicCertifierSurvey/SetCertificationSummary/utils/getOrganicSurveyReqBody';
import { setIntroducingCertifications } from '../Navigation/navbarSlice';

export default function Home({ history }) {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const imgUrl = getSeason(userFarm?.grid_points?.lat);
  const { showSpotLight } = useSelector(chooseFarmFlowSelector);
  const dispatch = useDispatch();
  const showSwitchFarmModal = useSelector(switchFarmSelector);
  const dismissPopup = () => dispatch(endSwitchFarmModal(userFarm.farm_id));

  const showHelpRequestModal = useSelector(showHelpRequestModalSelector);
  const showRequestConfirmationModalOnClick = () => dispatch(dismissHelpRequestModal());
  const { introduce_map, navigation } = useSelector(showedSpotlightSelector);
  const showNotifyUpdatedFarmModal = !introduce_map && navigation;
  const [showExportModal, setShowExportModal] = useState(history.location.state?.showExportModal);

  // Certification modal logic
  const doesCertifierSurveyExist = useSelector(doesCertifierSurveyExistSelector);
  const isAdmin = useSelector(isAdminSelector);
  const [showCertificationsModal, setShowCertificationsModal] = useState(
    !doesCertifierSurveyExist && isAdmin,
  );
  const onClickMaybeLater = () => {
    dispatch(
      postOrganicCertifierSurvey({
        survey: getOrganicSurveyReqBody({ interested: false }),
      }),
    );
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

  return (
    <PureHome greeting={t('HOME.GREETING')} first_name={userFarm?.first_name} imgUrl={imgUrl}>
      {userFarm ? <WeatherBoard /> : null}
      {showSwitchFarmModal && !showSpotLight && <FarmSwitchOutro onFinish={dismissPopup} />}

      {showSwitchFarmModal && !showSpotLight && (
        <div
          onClick={dismissPopup}
          style={{
            position: 'fixed',
            zIndex: 1500,
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            backgroundColor: 'rgba(25, 25, 40, 0.8)',
          }}
        />
      )}

      {showHelpRequestModal && (
        <RequestConfirmationComponent
          onClick={showRequestConfirmationModalOnClick}
          dismissModal={showRequestConfirmationModalOnClick}
        />
      )}

      {showNotifyUpdatedFarmModal && (
        <NotifyUpdatedFarmModal
          dismissModal={() => dispatch(setSpotlightToShown('introduce_map'))}
        />
      )}

      {showExportModal && <PreparingExportModal dismissModal={() => setShowExportModal(false)} />}

      {showCertificationsModal && (
        <CertificationsModal
          handleClickMaybeLater={onClickMaybeLater}
          handleClickYes={onClickCertificationsYes}
          dismissModal={() => {
            setShowCertificationsModal(false);
            dispatch(setIntroducingCertifications(false));
          }}
        />
      )}
    </PureHome>
  );
}
