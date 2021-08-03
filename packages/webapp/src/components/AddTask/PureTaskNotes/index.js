import React from 'react';
import Form from '../../../components/Form';
import MultiStepPageTitle from '../../../components/PageTitle/MultiStepPageTitle';
import { useTranslation } from 'react-i18next';
import { Label, Main } from '../../Typography';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import Input, { getInputErrors } from '../../Form/Input';
import Infoi from '../../Tooltip/Infoi';

const PureTaskNotes = ({ handleGoBack, handleCancel, onSubmit, onError }) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    watch,
    register,
    setValue,
    formState: { errors, isValid },
  } = useForm({});

  const TASK_NOTES = 'task_notes';
  let task_notes = watch(TASK_NOTES);

  return (
    <>
      <Form
        buttonGroup={
          <div style={{ display: 'flex', flexDirection: 'column', rowGap: '16px', flexGrow: 1 }}>
            <Button color={'primary'} fullLength>
              {t('common:CONTINUE')}
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
          value={71}
        />

        <Main>{t('ADD_TASK.TELL_US_ABOUT_YOUR_TASK_TYPE_ONE') + ' (task_type)'}</Main>

        <Input
          toolTipContent={t('ADD_TASK.SEARCH_INFOI')}
          label={t('LOG_COMMON.NOTES')}
          optional={true}
          style={{ paddingTop: '20px' }}
          hookFormRegister={register(TASK_NOTES, {
            required: false,
            valueAsNumber: false,
          })}
          errors={getInputErrors(errors, TASK_NOTES)}
          name={TASK_NOTES}
          hookFormSetValue-={setValue}
        />
      </Form>
    </>
  );
};

export default PureTaskNotes;
