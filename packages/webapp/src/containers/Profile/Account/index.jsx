import PureAccount from '../../../components/Profile/Account';
import { useDispatch, useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { updateUser } from '../../saga';
import { getProcessedFormData } from '../../hooks/useHookFormPersist/utils';

export default function Account() {
  const userFarm = useSelector(userFarmSelector);
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    const parsedData = {
      ...data,
      first_name: data.first_name.trim(),
      last_name: data.last_name.trim(),
    };

    dispatch(updateUser(getProcessedFormData(parsedData)));
  };
  return <PureAccount userFarm={userFarm} onSubmit={onSubmit} />;
}
