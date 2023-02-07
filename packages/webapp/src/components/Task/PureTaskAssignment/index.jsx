import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import styles from '../../CertificationReportingPeriod/styles.module.scss';
import RadioGroup from '../../Form/RadioGroup';
import Input, { getInputErrors, numberOnKeyDown } from '../../Form/Input';
import AssignTask from '../AssignTask';

const PureTaskAssignment = ({
  onSubmit,
  handleGoBack,
  onError,
  isFarmWorker,
  currencySymbol,
  useHookFormPersist,
  override,
  control,
  register,
  errors,
  disabled,
  assigneeOptions,
  selectedWorker,
  currency,
  showHourlyWageInputs,
  shouldSetWage,
  handleSubmit,
  getValues,
  setValue,
}) => {
  const { t } = useTranslation();
  const OVERRIDE_HOURLY_WAGE = 'override_hourly_wage';
  const WAGE_OVERRIDE = 'wage_at_moment';

  const { historyCancel } = useHookFormPersist(getValues);

  const contentForWorkerWithWage = useMemo(() => {
    if (isFarmWorker) {
      return null;
    }

    return (
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
      </>
    );
  }, [override, control]);

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button
              data-cy="addTask-assignmentSave"
              color={'primary'}
              disabled={disabled}
              fullLength
            >
              {t('common:SAVE')}
            </Button>
          </div>
        }
        onSubmit={handleSubmit(onSubmit, onError)}
      >
        <MultiStepPageTitle
          style={{ marginBottom: '24px' }}
          onGoBack={handleGoBack}
          onCancel={historyCancel}
          title={t('ADD_TASK.ADD_A_TASK')}
          cancelModalTitle={t('ADD_TASK.CANCEL')}
          value={86}
        />

        <AssignTask
          intro={<Main className={styles.mainText}>{t('ADD_TASK.DO_YOU_WANT_TO_ASSIGN')}</Main>}
          assigneeOptions={assigneeOptions}
          control={control}
          selectedWorker={selectedWorker}
          optional={true}
          register={register}
          errors={errors}
          showHourlyWageInputs={showHourlyWageInputs}
          shouldSetWage={shouldSetWage}
          currency={currency}
          contentForWorkerWithWage={contentForWorkerWithWage}
        />
      </Form>
    </>
  );
};

export default PureTaskAssignment;
