import PurePeople from '../../../components/Profile/People';
import { useSelector } from 'react-redux';
import { isAdminSelector, userFarmsByFarmSelector } from '../../userFarmSlice';

export default function People({ history, match }) {
  const userFarms = useSelector(userFarmsByFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  return <PurePeople users={userFarms} history={history} isAdmin={isAdmin} />;
}
