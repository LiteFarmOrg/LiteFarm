import { useForm } from 'react-hook-form';
import React  from 'react';
import { PureOrganicPartners } from '../../../components/OrganicPartners';
import { certifierSurveySelector } from '../selector';
import { useDispatch, useSelector } from 'react-redux';
import { updateCertifiers } from '../actions';
import history from '../../../history';
export default function OrganicPartners() {
  const { register, handleSubmit, errors, watch } = useForm();
  const COABC = 'COABC';
  const OTHER = 'other';
  const OTHERNAME = 'otherName';
  const required = watch(OTHER, false);
  const coabc = watch(COABC, false);
  const otherName = watch(OTHERNAME, undefined);
  const refInput = register({ required: required });
  const {certifiers} = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    const certifiers = [];
    const other = data[OTHERNAME];
    const coabc = data[COABC];
    if(other){
      certifiers.push(other);
    }
    if(coabc){
      certifiers.push(COABC);
    }
    dispatch(updateCertifiers(certifiers));
    history.push('/outro');
  }

  const onGoBack = () => {
    history.push('/interested_in_organic');
    console.log('back');
    console.log(certifiers);
  }
  const disabled = !coabc && !otherName;
  return <>
    <PureOrganicPartners onSubmit={handleSubmit(onSubmit)}
                         onGoBack={onGoBack}
                         disabled={disabled}
                         inputs={[{
                           label: 'COABC',
                           inputRef: register,
                           name: COABC,
                         }, {
                           label: 'Other',
                           inputRef: register,
                           name: OTHER,
                         }, {
                           label: 'Certifier’s name',
                           inputRef: refInput,
                           name: OTHERNAME,
                           errors: errors[OTHERNAME] && 'Certificate name is required',
                           disabled: !required,
                           autoFocus: required,
                           info: 'Our forms are accepted by most certifiers.',
                         }]}/>
  </>
}
