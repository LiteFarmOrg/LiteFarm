import Form from '../../Form';
import Button from '../../Form/Button';
import { Label, Main } from '../../Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PureWarningBox from '../../WarningBox';
import Infoi from '../../Tooltip/Infoi';
import { useForm } from 'react-hook-form';
import RadioGroup from '../../Form/RadioGroup';
import PageTitle from '../../PageTitle/v2';

export function PureInterestedOrganic({
  onSubmit,
  onGoBack,
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
  } = useForm({ mode: 'onChange', defaultValues: persistedFormData });
  useHookFormPersist?.(persistedPathNames, getValues);
  const INTERESTED = 'interested';
  const disabled = !isValid;
  const title = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.TITLE');
  const paragraph = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.PARAGRAPH');
  const underlined = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.WHY');
  const content = t('CERTIFICATION.INTERESTED_IN_CERTIFICATION.WHY_ANSWER');
  return (
    <Form
      onSubmit={handleSubmit(onSubmit)}
      buttonGroup={
        <>
          <Button type={'submit'} fullLength disabled={disabled}>
            {t('common:CONTINUE')}
          </Button>
        </>
      }
    >
      <PageTitle title={title} onGoBack={onGoBack} style={{ marginBottom: '20px' }} />
      <PureWarningBox style={{ marginBottom: '24px' }}>
        <Label>{t('CERTIFICATION.WARNING')}</Label>
      </PureWarningBox>
      <Main style={{ marginBottom: '24px' }}>
        {paragraph}{' '}
        <Infoi placement={'bottom'} content={content} style={{ transform: 'translateY(2px)' }} />{' '}
      </Main>
      <RadioGroup hookFormControl={control} name={INTERESTED} required />
    </Form>
  );
}

PureInterestedOrganic.prototype = {
  onSubmit: PropTypes.func,
  onGoBack: PropTypes.func,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  persistedPathNames: PropTypes.arrayOf(PropTypes.string),
};
