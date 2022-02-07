import PureEditUser from '../../components/Profile/EditUser';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmEntitiesSelector, userFarmSelector } from '../userFarmSlice';
import { deactivateUser, reactivateUser } from './People/saga';

export default function EditUser({ history, match }) {
  const { farm_id } = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();
  const userFarmsEntities = useSelector(userFarmEntitiesSelector);
  const { user_id } = match.params;
  const userFarm = userFarmsEntities[farm_id]?.[user_id];
  const onSubmit = data => {
    dispatch(data);
  };
  const onRevoke = () => {
    dispatch(deactivateUser(user_id));
  };
  const onActivate = () => {
    dispatch(reactivateUser(user_id));
  };
  return <PureEditUser onActivate={onActivate} userFarm={userFarm} isAdmin={isAdmin} onSubmit={onSubmit}
                       onRevoke={onRevoke} history={history} />;
}
