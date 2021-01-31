import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector, userFarmStatusSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import FarmSwitchOutro from '../FarmSwitchOutro';
import RequestConfirmationComponent from '../../components/Modals/RequestConfirmationModal';
import { showHelpRequestModalSelector, dismissHelpRequestModal } from './homeSlice';
import {
  chooseFarmFlowSelector,
  endSwitchFarmModal,
  switchFarmSelector,
} from '../ChooseFarm/chooseFarmFlowSlice';

export default function Home() {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const imgUrl = getSeason(userFarm?.grid_points?.lat);
  const { showSpotLight } = useSelector(chooseFarmFlowSelector);
  const dispatch = useDispatch();
  const showSwitchFarmModal = useSelector(switchFarmSelector);
  const dismissPopup = () => dispatch(endSwitchFarmModal(userFarm.farm_id));

  const showHelpRequestModal = useSelector(showHelpRequestModalSelector);
  const showRequestConfirmationModalOnClick = () => dispatch(dismissHelpRequestModal());
  return (
    <PureHome greeting={t('HOME.GREETING')} first_name={userFarm?.first_name} imgUrl={imgUrl}>
      {userFarm ? <WeatherBoard /> : null}
      {showSwitchFarmModal && !showSpotLight && <FarmSwitchOutro onFinish={dismissPopup} />}

      {showSwitchFarmModal && !showSpotLight && (
        <div
          onClick={dismissPopup}
          style={{
            position: 'fixed',
            zIndex: 100,
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
    </PureHome>
  );
}
