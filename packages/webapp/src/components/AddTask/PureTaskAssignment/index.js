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
import { useSelector } from 'react-redux';

const PureTaskAssignment = ({ onSubmit, handleGoBack, handleCancel, onError, userFarmOptions }) => {
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
    defaultValues: { assignee: userFarmOptions.length === 1 ? userFarmOptions[0] : undefined },
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
      </Form>
    </>
  );
};

export default PureTaskAssignment;
