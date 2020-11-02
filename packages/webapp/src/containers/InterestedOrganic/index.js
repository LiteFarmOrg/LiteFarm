import { useForm } from "react-hook-form";
import React from "react";
import PureInterestedOrganic from "../../components/InterestedOrganic";

export default function InterestedOrganic() {
  const { register, handleSubmit, getValues } = useForm();
  const INTERESTED = 'interested';
  const title = 'Interested in Organic?';
  const paragraph = 'Do you plan to pursue or renew organic certification this season?';
  const underlined = 'Why are we asking this?';
  const content = 'LiteFarm generates forms required for organic certification. Some information will be mandatory.';


  const onSubmit = (data) => {
    console.log(getValues(INTERESTED), data);
  }
  const onGoBack = () => {
    console.log('back');
  }


  return <>
    <PureInterestedOrganic onSubmit={handleSubmit(onSubmit)}
                 title={title}
                 paragraph={paragraph}
                 underlined={underlined}
                 content={content}
                 onGoBack={onGoBack}
                 inputs={[{
                   label: 'Yes',
                   inputRef: register,
                   name: INTERESTED,
                   defaultValue: true
                 }, {
                   label: 'No',
                   inputRef: register,
                   name: INTERESTED,
                   defaultValue: false
                 }]}/>
  </>
}
