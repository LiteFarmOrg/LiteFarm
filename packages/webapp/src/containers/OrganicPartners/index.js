import { useForm } from "react-hook-form";
import React, { useState } from "react";
import { PureOrganicPartners } from "../../components/OrganicPartners";

export default function OrganicPartners() {
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
    <PureOrganicPartners onSubmit={handleSubmit(onSubmit)}
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
