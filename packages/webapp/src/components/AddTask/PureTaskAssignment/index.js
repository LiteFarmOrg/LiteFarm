import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../../Layout';
import Button from '../../Form/Button';
import { PureSnackbar } from '../../PureSnackbar';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { useForm, Controller } from 'react-hook-form';
import { Main, Label } from '../../Typography';
import styles from '../../CertificationReportingPeriod/styles.module.scss';
import ReactSelect from '../../Form/ReactSelect';
import RadioGroup from '../../Form/RadioGroup';
import Input, { getInputErrors, integerOnKeyDown } from '../../Form/Input';

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
}) => {
  const { t } = useTranslation();
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
      assignee: userFarmOptions.length === 2 ? userFarmOptions[1] : userFarmOptions[0],
      override_hourly_wage: false,
    },
  });

  useHookFormPersist(persistPaths, getValues);

  const OVERRIDE_HOURLY_WAGE = 'override_hourly_wage';
  const override = watch(OVERRIDE_HOURLY_WAGE);
  const WAGE_OVERRIDE = 'wage_override';
  let wage_override = watch(WAGE_OVERRIDE);
  const currently_assigned = watch('assignee');

  useEffect(() => {
    const currentlyAssignedUserId = currently_assigned?.value;
    const indexOfCurrentlyAssigned = userFarmOptions.indexOf(currently_assigned);
    const wageDataOfCurrentlyAssigned = wageData[indexOfCurrentlyAssigned][currentlyAssignedUserId];
    const hourlyWageOfCurrentlyAssigned =
      typeof wageDataOfCurrentlyAssigned === 'undefined'
        ? 0
        : wageDataOfCurrentlyAssigned.hourly_wage;
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
          name={'assignee'}
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
                  defaultChecked: true,
                },
              ]}
              required
            />
          </>
        )}

        {override && (
          <div>
            <Main style={{ paddingBottom: '15px' }}>
              {t('ADD_TASK.WAGE_OVERRIDE') + ' ' + '(' + currencySymbol + ')'}
            </Main>
            <div style={{ display: 'table' }}>
              <Input
                hookFormRegister={register(WAGE_OVERRIDE, {
                  required: false,
                  valueAsNumber: true,
                })}
                type={'number'}
                onKeyDown={integerOnKeyDown}
                max={100000000}
                errors={getInputErrors(errors, WAGE_OVERRIDE)}
                style={{ display: 'table-cell', width: '100%' }}
                name={WAGE_OVERRIDE}
                hookFormSetValue={setValue}
              />
              <Label style={{ display: 'table-cell', width: '100%', fontSize: '16px' }}>
                {'/hr'}
              </Label>
            </div>
          </div>
        )}
      </Form>
    </>
  );
};

export default PureTaskAssignment;
