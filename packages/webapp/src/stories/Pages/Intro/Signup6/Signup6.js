import Form from '../components/Form';
import PropTypes from 'prop-types';
import Button from '../../../Button';
import React from 'react';
import clsx from 'clsx';
import styles from './styles.scss';
import Radio from '../../../Form/radio';

import { useForm } from 'react-hook-form';
import history from '../../../../history';
import { connect } from 'react-redux';
import OverlayTooltip from '../../../Tooltip';
import Underlined from '../../../Underlined';


export function PureSignup6({ title, paragraph, inputs = [{}, {}], onSubmit, underlined, content }) {
  const { title: titleClass, ...inputClasses } = styles;
  return <Form onSubmit={onSubmit} buttonGroup={
    <><Button color={'secondary'} fullLength>Go Back</Button><Button type={'submit'} fullLength>Continue</Button></>
  }>
    <h4 className={clsx(styles.title)}>{title}</h4>
    <p className={clsx(styles.paragraph)}>{paragraph}</p>
    <Radio {...inputs[0]} checked={true} />
    <Radio classes={inputClasses} {...inputs[1]} />
    <OverlayTooltip content={content}>
      <Underlined>
        {underlined}
      </Underlined>
    </OverlayTooltip>
  </Form>
}

PureSignup6.prototype = {
  onSubmit: PropTypes.func,
  inputs: PropTypes.arrayOf(PropTypes.exact({ label: PropTypes.string, info: PropTypes.string, icon: PropTypes.node })),
}

export default function Signup6() {
  const { register, handleSubmit, getValues, errors } = useForm();
  const INTERESTED = 'interested';
  const title = 'Interested in Organic?';
  const paragraph = 'Do you plan to pursue or renew organic certification this season?';
  const underlined = 'Why are we asking this?';
  const content = 'LiteFarm generates forms required for organic certification. Some information will be mandatory.';


  const onSubmit = (data) => {
    console.log(getValues(INTERESTED), data);
  }


  return <>
    <PureSignup6 onSubmit={handleSubmit(onSubmit)}
                 title={title}
                 paragraph={paragraph}
                 underlined={underlined}
                 content={content}
                 inputs={[{
                   label: 'Yes',
                   inputRef: register,
                   name: INTERESTED,
                   errors: errors[INTERESTED] && 'Farm name is required',
                   value: true
                 }, {
                   label: 'No',
                   inputRef: register,
                   name: INTERESTED,
                   errors: errors[INTERESTED] && 'Address is required',
                   value: false
                 }]}/>
  </>
}