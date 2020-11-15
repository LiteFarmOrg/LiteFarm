import { useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import PureInterestedOrganic from '../../../components/InterestedOrganic';
import { certifierSurveySelector } from '../slice';
import { useDispatch, useSelector } from 'react-redux';
import { postCertifiers, getCertifiers, patchInterested } from '../saga';
import history from '../../../history';
export default function InterestedOrganic() {
  const { register, handleSubmit, setValue } = useForm();
  const INTERESTED = 'interested';
  const title = 'Interested in Organic?';
  const paragraph = 'Do you plan to pursue or renew organic certification this season?';
  const underlined = 'Why are we asking this?';
  const content = 'LiteFarm generates forms required for organic certification. Some information will be mandatory.';
  const ref = register({ required: true });
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(!survey.survey_id){
      dispatch(getCertifiers());
    }
    if(survey){
      setValue(INTERESTED,survey.interested===false?'false':'true');
    }
  },[survey]);


  const onSubmit = (data) => {
    const interested = data.interested === 'true';
    const callback = ()=> interested?history.push('/organic_partners'):history.push('/outro');
    if(survey.survey_id){
      dispatch(patchInterested({interested,callback}));
    }else{
      dispatch(postCertifiers({survey:{interested},callback}));
    }


  }
  const onGoBack = () => {
    console.log('goback')
    history.push('/consent');
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
                             inputRef: ref,
                             name: INTERESTED,
                             defaultValue: true,
                           }, {
                             label: 'No',
                             inputRef: ref,
                             name: INTERESTED,
                             defaultValue: false,
                           }]}/>
  </>
}
