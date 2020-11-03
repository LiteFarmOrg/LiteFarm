import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import React from "react";
import history from '../../history';
import { finishStepTwo } from './actions';
import PureRoleSelection from "../../components/RoleSelection";

function RoleSelection({dispatch, farm}) {
  const { register, handleSubmit } = useForm();
  const patchRole = (role) => {
  }

  const redirectConsent = () => {
    dispatch(finishStepTwo())
    history.push('/consent')
  }
  
  return (
    <PureRoleSelection onSubmit={handleSubmit(patchRole)}
                       inputs={[{
                         label: 'Farm owner',
                         value: 'Owner',
                         inputRef: register({required: true}),
                         name: '_role',
                         defaultChecked: true
                       },{
                         label: 'Farm manager',
                         value: 'Manager',
                         inputRef: register({required: true}),
                         name: '_role'
                       },{
                         label: 'Extension officer',
                         value: 'Extension Officer',
                         inputRef: register({required: true}),
                         name: '_role'
                       }
                       ]} title={'What is your role on the farm?'}
                       redirectConsent={redirectConsent}
                       >

    </PureRoleSelection>
  )
}


const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  }
};

const mapStateToProps = (state) => {
  return {
    farm: state.baseReducer.farm,
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(RoleSelection);
