import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherBoard from '../../containers/WeatherBoard';
import PureHome from '../../components/Home';
import { userFarmSelector } from '../userFarmSlice';
import { useTranslation } from 'react-i18next';
import FarmSwitchOutro from '../FarmSwitchOutro';
import history from '../../history';
import RequestConfirmationComponent from '../../components/Modals/RequestConfirmationModal';
import { showHelpRequestModalSelector, dismissHelpRequestModal } from './homeSlice';
import { chooseFarmFlowSelector } from '../ChooseFarm/chooseFarmFlowSlice';

export default function Home() {
  const { t } = useTranslation();
  const userFarm = useSelector(userFarmSelector);
  const imgUrl = getSeason(userFarm?.grid_points?.lat);
  const { showSpotLight } = useSelector(chooseFarmFlowSelector);
  const dispatch = useDispatch();
  const [switchFarm, setSwitchFarm] = useState(history.location.state);
  const dismissPopup = () => setSwitchFarm(false);

  const showHelpRequestModal = useSelector(showHelpRequestModalSelector);
  const showRequestConfirmationModalOnClick = () => dispatch(dismissHelpRequestModal());
  return (
    <PureHome greeting={t('HOME.GREETING')} first_name={userFarm?.first_name} imgUrl={imgUrl}>
      {userFarm ? <WeatherBoard /> : null}
      {switchFarm && !showSpotLight && <FarmSwitchOutro onFinish={dismissPopup} />}

      {switchFarm && !showSpotLight && (
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
