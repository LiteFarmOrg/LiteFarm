import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Controller, useForm } from 'react-hook-form';
import { Main } from '../../Typography';
import styles from '../../CertificationReportingPeriod/styles.module.scss';
import ReactSelect from '../../Form/ReactSelect';
import RadioGroup from '../../Form/RadioGroup';
import Input, { getInputErrors, numberOnKeyDown } from '../../Form/Input';
import { cloneObject } from '../../../util';

const PureTaskAssignment = ({
  onSubmit,
  handleGoBack,
  handleCancel,
  onError,
  userFarmOptions,
  wageData,
  isFarmWorker,
  currencySymbol,
  useHookFormPersist,
  persistPaths,
  persistedFormData,
}) => {
  const { t } = useTranslation();
  const OVERRIDE_HOURLY_WAGE = 'override_hourly_wage';
  const ASSIGNEE = 'assignee_user_id';
  const WAGE_OVERRIDE = 'wage_at_moment';
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    shouldUnregister: true,
    defaultValues: {
      assignee_user_id: persistedFormData.assignee_user_id
        ? persistedFormData.assignee_user_id
        : userFarmOptions.length === 2
        ? userFarmOptions[1]
        : userFarmOptions[0],
      [OVERRIDE_HOURLY_WAGE]: persistedFormData[OVERRIDE_HOURLY_WAGE] || false,
      wage_at_moment: persistedFormData.wage_at_moment ? persistedFormData.wage_at_moment : null,
      ...cloneObject(persistedFormData),
    },
  });

  useHookFormPersist(getValues, persistPaths);

  const override = watch(OVERRIDE_HOURLY_WAGE);

  const currently_assigned = watch(ASSIGNEE);

  useEffect(() => {
    const currentlyAssignedUserId = currently_assigned?.value;
    const wageDataOfCurrentlyAssigned = wageData.find(
      (userWageObject) => !!userWageObject[currentlyAssignedUserId],
    );
    const hourlyWageOfCurrentlyAssigned =
      typeof wageDataOfCurrentlyAssigned === 'undefined'
        ? 0
        : wageDataOfCurrentlyAssigned[currentlyAssignedUserId].hourly_wage;
    setValue(WAGE_OVERRIDE, hourlyWageOfCurrentlyAssigned);
  }, [currently_assigned]);

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button color={'primary'} disabled={override && !isValid} fullLength>
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
          name={ASSIGNEE}
          render={({ field }) => (
            <ReactSelect
              options={userFarmOptions}
              label={t('ADD_TASK.ASSIGNEE')}
              required={true}
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
              name={OVERRIDE_HOURLY_WAGE}
              radios={[
                {
                  label: t('LOG_DETAIL.YES'),
                  value: true,
                },
                {
                  label: t('LOG_DETAIL.NO'),
                  value: false,
                },
              ]}
              required
            />
          </>
        )}

        {override && (
          <div>
            <Input
              label={t('ADD_TASK.WAGE_OVERRIDE')}
              unit={currencySymbol + t('ADD_TASK.HR')}
              hookFormRegister={register(WAGE_OVERRIDE, {
                required: true,
                valueAsNumber: true,
              })}
              type={'number'}
              onKeyDown={numberOnKeyDown}
              max={100000000}
              errors={getInputErrors(errors, WAGE_OVERRIDE)}
              name={WAGE_OVERRIDE}
              hookFormSetValue={setValue}
            />
          </div>
        )}
      </Form>
    </>
  );
};

export default PureTaskAssignment;
