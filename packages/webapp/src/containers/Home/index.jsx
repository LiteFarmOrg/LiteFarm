import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import FarmSwitchOutro from '../FarmSwitchOutro';
import {
  chooseFarmFlowSelector,
  endExportModal,
  endSwitchFarmModal,
  switchFarmSelector,
} from '../ChooseFarm/chooseFarmFlowSlice';

import PreparingExportModal from '../../components/Modals/PreparingExportModal';
import { getAlert } from '../Navigation/Alert/saga.js';
import useMediaWithAuthentication from '../hooks/useMediaWithAuthentication';
import { useGetSensorsQuery } from '../../store/api/apiSlice';

export default function Home() {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const defaultImageUrl = getSeason(userFarm?.grid_points?.lat);
  const { showSpotLight, showExportModal } = useSelector(chooseFarmFlowSelector);
  const dispatch = useDispatch();
  const showSwitchFarmModal = useSelector(switchFarmSelector);
  const dismissPopup = () => dispatch(endSwitchFarmModal(userFarm.farm_id));
  const dismissExportModal = () => dispatch(endExportModal(userFarm.farm_id));
  const { mediaUrl: authenticatedImageUrl, isLoading } = useMediaWithAuthentication({
    fileUrls: [userFarm.farm_image_url],
  });

  const { refetch: refetchSensors } = useGetSensorsQuery();

  useEffect(() => {
    refetchSensors();
    dispatch(getAlert());
  }, []);

  return (
    <PureHome
      greeting={t('HOME.GREETING')}
      first_name={userFarm?.first_name}
      imgUrl={authenticatedImageUrl || (isLoading ? '' : defaultImageUrl)}
    >
      {userFarm ? <WeatherBoard /> : null}
      {showSwitchFarmModal && !showSpotLight && <FarmSwitchOutro onFinish={dismissPopup} />}

      {showExportModal && <PreparingExportModal dismissModal={() => dismissExportModal(false)} />}
    </PureHome>
  );
}
