import { useForm } from "react-hook-form";
import React from "react";
import PureRoleSelection from "../../components/RoleSelection";
import { useDispatch } from 'react-redux';
import { patchRole } from '../AddFarm/saga';
import history from '../../history';

function RoleSelection() {
  const { register, handleSubmit } = useForm();
  const ROLE = 'role';
  const dispatch = useDispatch();
  const onSubmit = ({role}) => {
    const callback = () => history.push('/consent');
    dispatch(patchRole({ role, callback }));
  }
  return (
    <PureRoleSelection onSubmit={handleSubmit(onSubmit)}
                       inputs={[{
                         label: 'Farm owner',
                         value: 'Owner',
                         inputRef: register({required: true}),
                         name: ROLE,
                         defaultChecked: true
                       },{
                         label: 'Farm manager',
                         value: 'Manager',
                         inputRef: register({required: true}),
                         name: ROLE
                       },{
                         label: 'Extension officer',
                         value: 'Extension Officer',
                         inputRef: register({required: true}),
                         name: ROLE
                       }
                       ]} title={'What is your role on the farm?'}>

    </PureRoleSelection>
  )
}

export default RoleSelection;
