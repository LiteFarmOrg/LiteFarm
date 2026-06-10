import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSeason } from './utils/season';
import WeatherForecast from '../../containers/WeatherForecast';
import ProfitabilityWidget from './ProfitabilityWidget';
import PureHome from '../../components/Home';
import { userFarmSelector } from '../userFarmSlice';
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
import FarmNotes from '../FarmNotes';
import { getLocalizedDateString } from '../../util/moment';

export default function Home() {
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
      first_name={userFarm?.first_name}
      farmName={userFarm?.farm_name}
      // Note: image is not currently used but should be restored in some way in the final design
      imgUrl={authenticatedImageUrl || (isLoading ? '' : defaultImageUrl)}
      date={getLocalizedDateString(new Date(), {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    >
      <FarmNotes />

      {userFarm ? <WeatherForecast /> : null}
      {userFarm ? <ProfitabilityWidget /> : null}
      {showSwitchFarmModal && !showSpotLight && <FarmSwitchOutro onFinish={dismissPopup} />}

      {showExportModal && <PreparingExportModal dismissModal={() => dismissExportModal(false)} />}
    </PureHome>
  );
}
