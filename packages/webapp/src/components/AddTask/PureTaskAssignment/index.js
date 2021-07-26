import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import Button from '../../Form/Button';
import { PureSnackbar } from '../../PureSnackbar';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { useForm, Controller } from 'react-hook-form';
import { Main } from '../../Typography';
import styles from '../../CertificationReportingPeriod/styles.module.scss';
import ReactSelect from '../../Form/ReactSelect';
import RadioGroup from '../../Form/RadioGroup';

const PureTaskAssignment = ({
  onSubmit,
  handleGoBack,
  handleCancel,
  onError,
  userFarmOptions,
  isFarmWorker,
}) => {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      assignee: userFarmOptions.length === 1 ? userFarmOptions[0] : undefined,
      override_hourly_wage: false,
    },
  });

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button color={'primary'} fullLength>
              {t('common:SAVE')}
            </Button>
          </div>
        }
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={handleCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={86}
        />

        <Main className={styles.mainText}>{t('ADD_TASK.DO_YOU_WANT_TO_ASSIGN')}</Main>

        <Controller
          control={control}
          name={'assignee'}
          render={({ field }) => (
            <ReactSelect
              options={userFarmOptions}
              label={t('ADD_TASK.ASSIGNEE')}
              optional={true}
              {...field}
            />
          )}
          rules={{ required: true }}
        />

        {!isFarmWorker && (
          <>
            <Main className={styles.mainText} style={{ paddingTop: '35px' }}>
              {t('ADD_TASK.DO_YOU_NEED_TO_OVERRIDE')}
            </Main>

            <RadioGroup
              hookFormControl={control}
              style={{ marginBottom: '16px' }}
              name={'override_hourly_wage'}
              radios={[
                {
                  label: t('LOG_DETAIL.YES'),
                  value: true,
                },
                {
                  label: t('LOG_DETAIL.NO'),
                  value: false,
                  defaultChecked: true,
                },
              ]}
              required
            />
          </>
        )}
      </Form>
    </>
  );
};

export default PureTaskAssignment;
