import { useHistory, useNavigate } from 'react-router-dom';
import PureRoleSelection from '../../components/RoleSelection';
import { useDispatch, useSelector } from 'react-redux';
import { patchRole } from '../AddFarm/saga';
import { roleToId } from './roleMap';
import { useTranslation } from 'react-i18next';
import { userFarmSelector } from '../userFarmSlice';

function RoleSelection() {
  const navigate = useNavigate();
  const history = useHistory();
  const { t } = useTranslation();
  const { role, owner_operated } = useSelector(userFarmSelector);
  const dispatch = useDispatch();

  const onSubmit = ({ role, owner_operated }) => {
    const callback = () => navigate('/consent');

    dispatch(patchRole({ role, owner_operated, role_id: roleToId[role], callback }));
  };

  const onGoBack = () => {
    navigate('/add_farm');
  };
  return (
    <PureRoleSelection
      onSubmit={onSubmit}
      onGoBack={onGoBack}
      title={t('ROLE_SELECTION.TITLE')}
      defaultRole={role}
      defaultOwnerOperated={owner_operated}
    />
  );
}

export default RoleSelection;
