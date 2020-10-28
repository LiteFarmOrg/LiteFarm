import React from 'react';
import Form from "../components/Form";
import Button from "../../../Button";
import clsx from "clsx";
import styles from './styles.scss'
import Radio from "../../../Form/radio";
import { useForm } from "react-hook-form";

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


function RoleSelection() {
  // const Roles = {
  //   "Owner": 1,
  //   "Manager": 2,
  //   "Extension Officer": 5
  // }
  const { register, handleSubmit } = useForm();
  const patchRole = (role) => {
    console.log(role);
  }
  return (
    <PureRoleSelection onSubmit={handleSubmit(patchRole)}
    inputs={[{
      label: 'Owner',
      value: 'Owner',
      inputRef: register({required: true}),
      name: '_role'
    },{
      label: 'Manager',
      value: 'Manager',
      inputRef: register({required: true}),
      name: '_role'
    },{
      label: 'Extension Officer',
      value: 'Extension Officer',
      inputRef: register({required: true}),
      name: '_role'
    }
    ]} title={'What is your role on the farm?'}>

    </PureRoleSelection>
  )
}


export default RoleSelection;
