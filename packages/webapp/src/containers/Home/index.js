import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import FarmSwitchOutro from './modals/FarmSwitchOutro';
import PreparingExportModal from '../../components/Modals/PreparingExportModal';
import CertificationsSpotlight from './modals/CertificationsSpotlight';
import RequestConfirmationModal from './modals/RequestConfirmation';
import IntroduceMapSpotlight from './modals/UpdatedFarmSpotlight';
import { activeHomeModalSelector } from '../showedSpotlightSlice';

const modalMap = {
  switchFarm: FarmSwitchOutro,
  // PreparingExportModal,
  certifications: CertificationsSpotlight,
  helpRequest: RequestConfirmationModal,
  notifyUpdatedFarm: IntroduceMapSpotlight,
};

export default function Home({ history }) {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const imgUrl = getSeason(userFarm?.grid_points?.lat);

  const [showExportModal, setShowExportModal] = useState(history.location.state?.showExportModal);

  const activeModal = useSelector(activeHomeModalSelector);

  const ActiveModal = activeModal && modalMap[activeModal];

  return (
    <PureHome greeting={t('HOME.GREETING')} first_name={userFarm?.first_name} imgUrl={imgUrl}>
      {userFarm ? <WeatherBoard /> : null}

      {showExportModal && <PreparingExportModal dismissModal={() => setShowExportModal(false)} />}

      {ActiveModal && <ActiveModal />}
    </PureHome>
  );
}
