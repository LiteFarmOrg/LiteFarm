import { useEffect } from 'react';
import PureWelcomeScreen from '../../components/WelcomeScreen';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmLengthSelector, userFarmStatusSelector } from '../userFarmSlice';
import { getUserFarms } from '../ChooseFarm/saga';
import { userLogReducerSelector } from '../userLogSlice';
import { useNavigate } from 'react-router-dom-v5-compat';

export default function WelcomeScreen() {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const hasUserFarm = useSelector(userFarmLengthSelector);
  const { loaded, loading } = useSelector(userFarmStatusSelector);
  const { lastActiveDatetime } = useSelector(userLogReducerSelector);

  useEffect(() => {
    const currentDateAsNumber = new Date().getTime();
    const minute = 1000 * 60;
    !hasUserFarm &&
      !loading &&
      currentDateAsNumber - lastActiveDatetime > minute &&
      dispatch(getUserFarms());
  }, []);

  useEffect(() => {
    loaded && hasUserFarm && navigate('/farm_selection');
  }, [loaded, hasUserFarm]);
  const onClick = () => {
    navigate('./add_farm');
  };
  return <PureWelcomeScreen onClick={onClick} />;
}
