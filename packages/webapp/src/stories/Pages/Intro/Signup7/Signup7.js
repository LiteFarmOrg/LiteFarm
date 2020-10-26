import Form from '../components/Form';
import PropTypes from 'prop-types';
import Button from '../../../Button';
import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './styles.scss';
import Checkbox from '../../../Form/checkbox';
import Input from '../../../Form/Input';

import signup7 from '../../../assets/signUp/signup7.svg';
import { FaLeaf } from 'react-icons/fa';

import { useForm } from 'react-hook-form';
import history from '../../../../history';
import { connect } from 'react-redux';


export function PureSignup7({ title, paragraph, inputs = [{}, {}], onSubmit, onGoBack, underlined, content }) {
  const { title: titleClass, ...inputClasses } = styles;
  return <Form onSubmit={onSubmit} buttonGroup={
    <><Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button><Button type={'submit'}
                                                                                        fullLength>Continue</Button></>
  }>
    <img src={signup7} alt={'Avatar'} className={styles.svg} loading={'lazy'}/>
    <span>Great!</span>
    <p className={clsx(styles.paragraph)}>We'll indicate data required for organic certification with <span
      className={styles.leaf}><FaLeaf/></span> throughout the app!</p>
    <label>Please select your certifier</label>
    <Checkbox {...inputs[0]}/>
    <Checkbox {...inputs[1]}/>
    <Input {...inputs[2]}/>
  </Form>
}

PureSignup7.prototype = {
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(PropTypes.exact({ label: PropTypes.string, info: PropTypes.string, icon: PropTypes.node })),
}

export default function Signup7() {
  const { register, handleSubmit, getValues, errors } = useForm();
  const [ disabled, setDisabled ] = useState(true);
  const ref = register({ required: true });
  const refInput = register({required: !disabled});
  const CERTIFICATE = 'certificate';
  const OTHER = 'other';
  const OTHERNAME = 'otherName';

  const onSubmit = (data) => {
    console.log('submit');
    console.log(getValues(CERTIFICATE), data);
  }

  const onGoBack = () => {
    console.log('back');
  }

  const onChange = (e) => {
    setDisabled(!e.target.checked);
  }

  console.log(disabled);

  return <>
    <PureSignup7 onSubmit={handleSubmit(onSubmit)}
                 onGoBack={onGoBack}
                 inputs={[{
                   label: 'COABC',
                   inputRef: ref,
                   name: CERTIFICATE,
                 }, {
                   label: 'Other',
                   inputRef: ref,
                   name: OTHER,
                   onChange: onChange,
                 }, {
                   label: 'Certifier’s name',
                   inputRef: refInput,
                   name: OTHERNAME,
                   errors: errors[OTHERNAME] && 'Certificate name is required',
                   disabled: disabled,
                   autoFocus: !disabled
                 }]}/>
    {disabled}
  </>
}