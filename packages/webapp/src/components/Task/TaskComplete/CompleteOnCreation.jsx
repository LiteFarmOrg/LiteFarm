import Button from '../../Form/Button';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import React from 'react';
import Form from '../../Form';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import RadioGroup from '../../Form/RadioGroup';
import PureCleaningTask from '../CleaningTask';
import PureSoilAmendmentTask from '../SoilAmendmentTask';
import PureFieldWorkTask from '../FieldWorkTask';
import PurePestControlTask from '../PestControlTask';
import { cloneObject } from '../../../util';
import { PurePlantingTask } from '../PlantingTask';
import PureIrrigationTask from '../PureIrrigationTask';

export default function PureCompleteOnCreation({ onContinue, onGoBack }) {
  const { t } = useTranslation();

  return (
    <Form
      buttonGroup={
        <>
          <Button data-cy="taskReadOnly-abandon" color={'secondary'} onClick={onGoBack} fullLength>
            {t('TASK.COMPLETE_ON_CREATION.CANCEL')}
          </Button>
          <Button data-cy="taskReadOnly-complete" color={'primary'} fullLength>
            {t('common:MARK_COMPLETE')}
          </Button>
        </>
      }
      onSubmit={onContinue}
    >
      <MultiStepPageTitle
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
        onCancel={onGoBack}
        cancelModalTitle={t('TASK.COMPLETE_TASK_FLOW')}
        title={t('TASK.COMPLETE_TASK')}
        value={0}
      />

      <Main style={{ marginBottom: '24px' }}>{t('TASK.COMPLETE_ON_CREATION.BODY')}</Main>
    </Form>
  );
}

const taskComponents = {
  CLEANING_TASK: (props) => <PureCleaningTask {...props} />,
  FIELD_WORK_TASK: (props) => <PureFieldWorkTask {...props} />,
  SOIL_AMENDMENT_TASK: (props) => <PureSoilAmendmentTask {...props} />,
  PEST_CONTROL_TASK: (props) => <PurePestControlTask {...props} />,
  PLANT_TASK: (props) => <PurePlantingTask disabled isPlantTask={true} {...props} />,
  TRANSPLANT_TASK: (props) => <PurePlantingTask disabled isPlantTask={false} {...props} />,
  IRRIGATION_TASK: (props) => <PureIrrigationTask {...props} />,
};
