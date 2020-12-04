import { useForm } from 'react-hook-form';
import React, { useEffect } from 'react';
import PureInterestedOrganic from '../../../components/InterestedOrganic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { postCertifiers, getCertifiers, patchInterested } from '../saga';
import history from '../../../history';
import { certifierSurveySelector } from '../slice';
import { useTranslation } from 'react-i18next';

export default function InterestedOrganic() {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue } = useForm();
  const INTERESTED = 'interested';
  const title = t('ORGANIC.INTERESTED_IN_ORGANIC.TITLE');
  const paragraph = t('ORGANIC.INTERESTED_IN_ORGANIC.PARAGRAPH');
  const underlined = t('ORGANIC.INTERESTED_IN_ORGANIC.WHY');
  const content = t('ORGANIC.INTERESTED_IN_ORGANIC.WHY_ANSWER');
  const ref = register({ required: true });
  const survey = useSelector(certifierSurveySelector, shallowEqual);
  const dispatch = useDispatch();
  useEffect(() => {
    if (!survey.survey_id) {
      dispatch(getCertifiers());
    }
    if (survey) {
      setValue(INTERESTED, survey.interested === false ? 'false' : 'true');
    }
  }, [survey, dispatch]);

  const onSubmit = (data) => {
    const interested = data.interested === 'true';
    const callback = () =>
      interested ? history.push('/organic_partners') : history.push('/outro');
    if (survey.survey_id) {
      dispatch(patchInterested({ interested, callback }));
    } else {
      dispatch(postCertifiers({ survey: { interested }, callback }));
    }
  };
  const onGoBack = () => {
    console.log('goback');
    history.push('/consent');
  };

  return (
    <>
      <PureInterestedOrganic
        onSubmit={handleSubmit(onSubmit)}
        title={title}
        paragraph={paragraph}
        underlined={underlined}
        content={content}
        onGoBack={onGoBack}
        inputs={[
          {
            label: 'Yes',
            inputRef: ref,
            name: INTERESTED,
            defaultValue: true,
          },
          {
            label: 'No',
            inputRef: ref,
            name: INTERESTED,
            defaultValue: false,
          },
        ]}
      />
    </>
  );
}
