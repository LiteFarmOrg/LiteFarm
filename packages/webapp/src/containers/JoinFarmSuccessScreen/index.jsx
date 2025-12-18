import { useHistory, useNavigate } from 'react-router-dom';
import PureJoinFarmSuccessScreen from '../../components/JoinFarmSuccessScreen';
import { useDispatch, useSelector } from 'react-redux';
import { chooseFarmFlowSelector, endInvitationFlow } from '../ChooseFarm/chooseFarmFlowSlice';
import { deselectFarmSuccess, loginSelector } from '../userFarmSlice';

export default function JoinFarmSuccessScreen() {
  const navigate = useNavigate();
  const history = useHistory();
  const dispatch = useDispatch();
  const { farm_id } = useSelector(loginSelector);
  const { showSpotLight, skipChooseFarm } = useSelector(chooseFarmFlowSelector);
  const { farm_name } = history.location.state || {};
  const onClick = () => {
    if (skipChooseFarm) {
      dispatch(endInvitationFlow(farm_id));
      navigate('/');
    } else {
      dispatch(endInvitationFlow(farm_id));
      dispatch(deselectFarmSuccess());
      navigate('/farm_selection', { farm_id });
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
