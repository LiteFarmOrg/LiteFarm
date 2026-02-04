import { useTranslation } from 'react-i18next';
import Button from '../../Form/Button';
import Form from '../../Form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import styles from '../../CertificationReportingPeriod/styles.module.scss';
import AssignTask from '../AssignTask';

const PureTaskAssignment = ({
  onSubmit,
  handleGoBack,
  onError,
  useHookFormPersist,
  control,
  register,
  errors,
  disabled,
  assigneeOptions,
  selectedWorker,
  showHourlyWageInputs,
  shouldSetWage,
  userFarmWage,
  handleSubmit,
  getValues,
  additionalContent,
  progress = 86,
}) => {
  const { t } = useTranslation();

  const { historyCancel } = useHookFormPersist(getValues);

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
          value={progress}
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
          additionalContent={additionalContent}
          userFarmWage={userFarmWage}
        />
      </Form>
    </>
  );
};

export default PureTaskAssignment;
