import Form from '../../Form';
import Button from '../../Form/Button';
import { Main } from '../../Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import RadioGroup from '../../Form/RadioGroup';
import PageTitle from '../../PageTitle/v2';

export function PureInterestedOrganic({
  onSubmit,
  onGoBack,
  survey = {},
  persistedFormData,
  useHookFormPersist,
  persistedPathNames,
}) {
  const { t } = useTranslation(['translation', 'common']);
  const {
    handleSubmit,
    control,
    getValues,
    formState: { isValid },
  } = useForm({ mode: 'onChange', defaultValues: { ...survey, ...persistedFormData } });
  useHookFormPersist?.(getValues, persistedPathNames);
  const INTERESTED = 'interested';
  const disabled = !isValid;
  const title = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.TITLE');
  const paragraph = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.PARAGRAPH');
  const content = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.WHY_ANSWER');
  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button data-cy='interestedInOrganic-continue' type={'submit'} fullLength disabled={disabled}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <PageTitle title={title} onGoBack={onGoBack} style={{ marginBottom: '20px' }} />
      <Main style={{ marginBottom: '24px' }} tooltipContent={content}>
        {paragraph}
      </Main>
      <RadioGroup data-cy='interestedInOrganic-select' hookFormControl={control} name={INTERESTED} required />
    </Form>
  );
}

PureInterestedOrganic.prototype = {
  onSubmit: PropTypes.func,
  onGoBack: PropTypes.func,
  survey: PropTypes.shape({
    certification_id: PropTypes.number,
    certifier_id: PropTypes.number,
    farm_id: PropTypes.string,
    interested: PropTypes.bool,
    requested_certification: PropTypes.string,
    requested_certifier: PropTypes.string,
    survey_id: PropTypes.number,
  }),
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  persistedPathNames: PropTypes.arrayOf(PropTypes.string),
};
