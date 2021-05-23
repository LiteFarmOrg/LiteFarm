import { useForm } from 'react-hook-form';
import React from 'react';
import PureInterestedOrganic from '../../../components/InterestedOrganic';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { patchInterested, postCertifiers } from '../saga';
import history from '../../../history';
import { certifierSurveySelector } from '../slice';
import { useTranslation } from 'react-i18next';

export default function InterestedOrganic() {
  const { t } = useTranslation(['translation', 'common']);
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm({ mode: 'onChange' });
  const INTERESTED = 'interested';
  const title = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.TITLE');
  const paragraph = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.PARAGRAPH');
  const underlined = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.WHY');
  const content = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.WHY_ANSWER');
  const survey = useSelector(certifierSurveySelector, shallowEqual);
  const dispatch = useDispatch();

  const onSubmit = (data) => {
    const interested = data.interested === 'true';
    const callback = () =>
      interested ? history.push('/certification_selection') : history.push('/outro');
    if (survey.survey_id) {
      dispatch(patchInterested({ interested, callback }));
    } else {
      dispatch(postCertifiers({ survey: { interested }, callback }));
    }
  };
  const onGoBack = () => {
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
        disabled={!isValid}
        inputs={[
          {
            label: t('common:YES'),
            hookFormRegister: register(INTERESTED, { required: true }),
            value: true,
            defaultChecked: survey.interested === true,
          },
          {
            label: t('common:NO'),
            hookFormRegister: register(INTERESTED, { required: true }),
            value: false,
            defaultChecked: survey.interested === false,
          },
        ]}
      />
    </>
  );
}
