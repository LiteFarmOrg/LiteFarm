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


export function PureSignup7({ inputs = [{}, {}], onSubmit, onGoBack }) {
  const { title: titleClass, ...inputClasses } = styles;
  return <Form onSubmit={onSubmit} buttonGroup={
    <><Button onClick={onGoBack} color={'secondary'} fullLength>Go Back</Button><Button type={'submit'}
                                                                                        fullLength>Continue</Button></>
  }>
    <img src={signup7} alt={'Avatar'} className={styles.svg} loading={'lazy'}/>
    <div className={styles.svgtitle}>Great!</div>
    <p className={clsx(styles.paragraph)}>We'll indicate data required for organic certification with <span
      className={styles.leaf}><FaLeaf/></span> throughout the app!</p>
    <label className={styles.checkboxLabel}>Please select your certifier</label>
    <Checkbox classes={{container: styles.firstCheckboxContainer}} {...inputs[0]}/>
    <Checkbox  classes={{container: styles.secondCheckboxContainer}} {...inputs[1]}/>
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
                   name: CERTIFICATE,
                   onChange: onChange,
                 }, {
                   label: 'Certifier’s name',
                   inputRef: refInput,
                   name: OTHERNAME,
                   errors: errors[OTHERNAME] && 'Certificate name is required',
                   disabled: disabled,
                   autoFocus: !disabled,
                   info: 'Our forms are accepted by most certifiers.',
                 }]}/>
    {disabled}
  </>
}