import PureAccount from '../../../components/Profile/Account';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { updateUser } from '../../saga';
import { getProcessedFormData } from '../../hooks/useHookFormPersist/utils';

export default function Account({ history }) {
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    dispatch(updateUser(getProcessedFormData(data)));
  };
  return <PureAccount history={history} userFarm={userFarm} onSubmit={onSubmit} />;
}
