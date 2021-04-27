import { useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import PureRoleSelection from '../../components/RoleSelection';
import { useDispatch, useSelector } from 'react-redux';
import { patchRole } from '../AddFarm/saga';
import history from '../../history';
import { roleToId } from './roleMap';
import { useTranslation } from 'react-i18next';
import { userFarmSelector } from "../userFarmSlice";

function RoleSelection() {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue } = useForm();
  const ROLE = 'role';
  const OWNER_OPERATED = 'owner_operated';
  const { role, owner_operated } = useSelector(userFarmSelector);
  const dispatch = useDispatch();

  const onSubmit = ({ role, owner_operated }) => {
    const callback = () => history.push('/consent');
    const boolOwnerOperated = owner_operated === "true" ? true : owner_operated === "false" ? false : null;
    dispatch(patchRole({ role, owner_operated: boolOwnerOperated, role_id: roleToId[role], callback }));
  };

  useEffect(() => {
    setValue(ROLE, role);
    setValue(OWNER_OPERATED, owner_operated?.toString());
  }, [])

  const onGoBack = () => {
    history.push('/add_farm');
  };
  return (
    <PureRoleSelection
      onSubmit={handleSubmit(onSubmit)}
      onGoBack={onGoBack}
      inputs={[
        {
          label: t('ROLE_SELECTION.FARM_OWNER'),
          value: 'Owner',
          inputRef: register({ required: true }),
          name: ROLE,
          defaultChecked: true,
        },
        {
          label: t('ROLE_SELECTION.FARM_MANAGER'),
          value: 'Manager',
          inputRef: register({ required: true }),
          name: ROLE,
        },
        {
          label: t('ROLE_SELECTION.FARM_EO'),
          value: 'Extension Officer',
          inputRef: register({ required: true }),
          name: ROLE,
        },
        {
          label: t('common:YES'),
          value: true,
          inputRef: register(),
          name: OWNER_OPERATED,
        },
        {
          label: t('common:NO'),
          value: false,
          inputRef: register(),
          name: OWNER_OPERATED,
        },
      ]}
      title={t('ROLE_SELECTION.TITLE')}
    />
  );
}

export default RoleSelection;
