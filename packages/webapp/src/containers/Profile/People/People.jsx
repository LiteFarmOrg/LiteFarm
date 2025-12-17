import { useHistory } from 'react-router-dom';
import PurePeople from '../../../components/Profile/People';
import { useSelector } from 'react-redux';
import { isAdminSelector, userFarmsByFarmSelector } from '../../userFarmSlice';

export default function People() {
  const history = useHistory();
  const userFarms = useSelector(userFarmsByFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  return <PurePeople users={userFarms} history={history} isAdmin={isAdmin} />;
}
