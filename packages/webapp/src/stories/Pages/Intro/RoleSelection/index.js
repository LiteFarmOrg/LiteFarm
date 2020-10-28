import React from 'react';
import Form from "../components/Form";
import Button from "../../../Button";
import clsx from "clsx";
import styles from './styles.scss'
import Radio from "../../../Form/radio";
import { useForm } from "react-hook-form";
import { farmSelector } from "../../../../containers/selector";
import { connect } from "react-redux";

function PureRoleSelection({ onSubmit, title, inputs, inputClasses = '' }) {
  return (
    <Form onSubmit={onSubmit} buttonGroup={<Button type={'submit'} fullLength>Continue</Button>}>
      <h4 className={clsx(styles.headerStyle)}>{title}</h4>
      <Radio classes={inputClasses} {...inputs[0]} />
      <Radio classes={inputClasses} {...inputs[1]} />
      <Radio classes={inputClasses} {...inputs[2]} />
    </Form>
  );
}


function RoleSelection({dispatch, farm}) {
  const { register, handleSubmit } = useForm();
  const patchRole = (role) => {
    console.log(role);
  }
  return (
    <PureRoleSelection onSubmit={handleSubmit(patchRole)}
    inputs={[{
      label: 'Farm owner',
      value: 'Owner',
      inputRef: register({required: true}),
      name: '_role',
      checked: true
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
    ]} title={'What is your role on the farm?'}>

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
    farm: farmSelector(state),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(RoleSelection);
