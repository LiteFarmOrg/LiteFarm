import { useForm } from 'react-hook-form';
import React from 'react';
import PureInterestedOrganic from '../../../components/InterestedOrganic';
import { certifierSurveySelector } from '../selector';
import { useDispatch, useSelector } from 'react-redux';
import { addOrganicCertificateSurvey, updateInterested } from '../actions';
import history from '../../../history';
export default function InterestedOrganic() {
  const { register, handleSubmit } = useForm();
  const INTERESTED = 'interested';
  const title = 'Interested in Organic?';
  const paragraph = 'Do you plan to pursue or renew organic certification this season?';
  const underlined = 'Why are we asking this?';
  const content = 'LiteFarm generates forms required for organic certification. Some information will be mandatory.';
  const ref = register({ required: true });
  const survey = useSelector(certifierSurveySelector);
  const dispatch = useDispatch();
  const onSubmit = (data) => {
    const interested = data.interested === 'true';
    console.log(interested, data);
    if(survey.survey_id){
      dispatch(updateInterested(interested));
    }else{
      dispatch(addOrganicCertificateSurvey({interested}));
    }
    if(interested){
      history.push('/organic_partners');
    }else{
      history.push('/outro')
    }


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
