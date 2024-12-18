import PureFarm from '../../../components/Profile/Farm';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, userFarmSelector } from '../../userFarmSlice';
import { putFarm } from '../../saga';
import { getProcessedFormData } from '../../hooks/useHookFormPersist/utils';

export default function Farm() {
  const isAdmin = useSelector(isAdminSelector);
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    dispatch(putFarm(getProcessedFormData(data)));
  };
  return <PureFarm isAdmin={isAdmin} userFarm={userFarm} onSubmit={onSubmit} />;
}
