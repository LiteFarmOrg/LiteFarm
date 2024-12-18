import PureJoinFarmSuccessScreen from '../../components/JoinFarmSuccessScreen';
import { useDispatch, useSelector } from 'react-redux';
import { chooseFarmFlowSelector, endInvitationFlow } from '../ChooseFarm/chooseFarmFlowSlice';
import { deselectFarmSuccess, loginSelector } from '../userFarmSlice';
import { useLocation, useNavigate } from 'react-router';

export default function JoinFarmSuccessScreen() {
  let navigate = useNavigate();
  let location = useLocation();
  const dispatch = useDispatch();
  const { farm_id } = useSelector(loginSelector);
  const { showSpotLight, skipChooseFarm } = useSelector(chooseFarmFlowSelector);
  const { farm_name } = location.state || {};
  const onClick = () => {
    if (skipChooseFarm) {
      dispatch(endInvitationFlow(farm_id));
      navigate('/');
    } else {
      dispatch(endInvitationFlow(farm_id));
      dispatch(deselectFarmSuccess());
      navigate('/farm_selection', { state: { farm_id } });
    }
  };
  return (
    <PureJoinFarmSuccessScreen
      onClick={onClick}
      farm_name={farm_name}
      showSpotLight={showSpotLight}
    />
  );
}
