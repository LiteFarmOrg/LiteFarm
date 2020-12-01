import { useForm } from "react-hook-form";
import React from "react";
import PureRoleSelection from "../../components/RoleSelection";
import { useDispatch } from 'react-redux';
import { patchRole } from '../AddFarm/saga';
import history from '../../history';
import {roleToId} from './roleMap';
import { useTranslation } from "react-i18next";

function RoleSelection() {
  const { t } = useTranslation();
  const { register, handleSubmit } = useForm();
  const ROLE = 'role';
  const dispatch = useDispatch();
  const onSubmit = ({role}) => {
    const callback = () => history.push('/consent');
    dispatch(patchRole({ role, role_id: roleToId[role], callback }));
  }
  const onGoBack = () => {
    history.push('/add_farm');
  }
  return (
    <PureRoleSelection onSubmit={handleSubmit(onSubmit)} onGoBack={onGoBack}
                       inputs={[{
                         label: t('ROLE_SELECTION.FARM_OWNER'),
                         value: 'Owner',
                         inputRef: register({required: true}),
                         name: ROLE,
                         defaultChecked: true
                       },{
                         label: t('ROLE_SELECTION.FARM_MANAGER'),
                         value: 'Manager',
                         inputRef: register({required: true}),
                         name: ROLE
                       },{
                         label: t('ROLE_SELECTION.FARM_EO'),
                         value: 'Extension Officer',
                         inputRef: register({required: true}),
                         name: ROLE
                       }
                       ]} title={t('ROLE_SELECTION.TITLE')}>

    </PureRoleSelection>
  )
}

export default RoleSelection;
