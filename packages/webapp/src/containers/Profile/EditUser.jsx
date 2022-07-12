import PureEditUser from '../../components/Profile/EditUser';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmEntitiesSelector, userFarmSelector } from '../userFarmSlice';
import { deactivateUser, invitePseudoUser, reactivateUser, updateUserFarm } from './People/saga';
import { useMemo } from 'react';

export default function EditUser({ history, match }) {
  const { farm_id, user_id: currentUserId } = useSelector(userFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  const dispatch = useDispatch();
  const userFarmsEntities = useSelector(userFarmEntitiesSelector);
  const { user_id } = match.params;
  const userFarm = userFarmsEntities[farm_id]?.[user_id];

  const isCurrentUser = useMemo(() => {
    return user_id === currentUserId;
  }, [user_id, currentUserId]);

  const getReqBody = (data) => {
    const role_id = parseInt(data.role_id.value);
    const reqBody = {
      ...data,
      user_id,
      role_id,
      wage: { amount: data.wage.amount, type: userFarm.wage?.type || 'hourly' },
    };
    if (role_id === userFarm.role_id) delete reqBody.role_id;
    if (data.wage?.amount === userFarm.wage?.amount) delete reqBody.wage;
    return reqBody;
  };

  const onUpdate = (data) => {
    dispatch(updateUserFarm(getReqBody(data)));
  };
  const onInvite = (data) => {
    dispatch(invitePseudoUser(getReqBody(data)));
  };
  const onRevoke = () => {
    dispatch(deactivateUser(user_id));
  };
  const onActivate = () => {
    dispatch(reactivateUser(user_id));
  };
  return (
    <PureEditUser
      onActivate={onActivate}
      userFarm={userFarm}
      isAdmin={isAdmin}
      onUpdate={onUpdate}
      onRevoke={onRevoke}
      history={history}
      onInvite={onInvite}
      isCurrentUser={isCurrentUser}
    />
  );
}
