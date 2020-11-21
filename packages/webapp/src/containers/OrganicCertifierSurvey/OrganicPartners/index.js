import { useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import { PureOrganicPartners } from '../../../components/OrganicPartners';
import { certifierSurveySelector } from '../slice';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { getCertifiers, patchCertifiers } from '../saga';
import history from '../../../history';

export default function OrganicPartners() {
  const { register, handleSubmit, errors, watch, setValue } = useForm();
  const COABC = 'COABC';
  const OTHER = 'other';
  const OTHERNAME = 'otherName';
  const required = watch(OTHER, false);
  const coabc = watch(COABC, false);
  const otherName = watch(OTHERNAME, undefined);
  const refInput = register({ required: required });
  const dispatch = useDispatch();
  const survey = useSelector(certifierSurveySelector, shallowEqual);
  useEffect(() => {
    console.log(survey);
    if (!survey.survey_id) {
      dispatch(getCertifiers());
    }
    if(survey){
      const { certifiers } = survey;
      setValue(COABC, certifiers?.includes(COABC));
      const otherCertifiers = certifiers?.filter(certifier => certifier!== COABC);
      const othername = otherCertifiers?.length > 0 ? otherCertifiers[0] : '';
      setValue(OTHER, !!othername);
      setValue(OTHERNAME, othername);
    }
  }, [survey]);
  const onSubmit = (data) => {
    const certifiers = [];
    const other = data[OTHERNAME];
    const coabc = data[COABC];
    const callback = () => history.push('/outro');
    if (other) {
      certifiers.push(other);
    }
    if (coabc) {
      certifiers.push(COABC);
    }
    dispatch(patchCertifiers({certifiers,callback}));

  }

  const onGoBack = () => {
    history.push('/interested_in_organic');
  }
  const disabled = !coabc && (!otherName || !required);
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
