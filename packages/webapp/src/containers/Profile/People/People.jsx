import PurePeople from '../../../components/Profile/People';
import { useSelector } from 'react-redux';
import { isAdminSelector, userFarmsByFarmSelector } from '../../userFarmSlice';

export default function People() {
  const userFarms = useSelector(userFarmsByFarmSelector);
  const isAdmin = useSelector(isAdminSelector);
  return <PurePeople users={userFarms} isAdmin={isAdmin} />;
}
