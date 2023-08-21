import React from 'react';
import PureRoleSelection from '../../components/RoleSelection';
import { useDispatch, useSelector } from 'react-redux';
import { patchRole } from '../AddFarm/saga';
import history from '../../history';
import { roleToId } from './roleMap';
import { useTranslation } from 'react-i18next';
import { userFarmSelector } from '../userFarmSlice';

function RoleSelection() {
  const { t } = useTranslation();
  const { role, owner_operated } = useSelector(userFarmSelector);
  const dispatch = useDispatch();

  const onSubmit = ({ role, owner_operated }) => {
    const callback = () => history.push('/consent');

    dispatch(patchRole({ role, owner_operated, role_id: roleToId[role], callback }));
  };

  const onGoBack = () => {
    history.push('/add_farm');
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
