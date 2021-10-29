import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';
import Button from '../../Form/Button';
import RetireCustomTaskModal from '../../Modals/RetireCustomTaskModal';
import Layout from '../../Layout';
import { useForm } from 'react-hook-form';
import Input from '../../Form/Input';

const PureEditCustomTask = ({ handleGoBack, handleEdit, handleRetire, selectedType }) => {
  const { t } = useTranslation();
  const {
    handleSubmit,
    register,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: { task_name: selectedType?.task_name },
  });
  const TASK_NAME = 'task_name';
  const [showRetire, setShowRetire] = useState(false);
  return (
    <>
      <Layout
        buttonGroup={
          <>
            <Button
              color={'secondary'}
              fullLength
              onClick={() => {
                setShowRetire(true);
              }}
            >
              {t('common:RETIRE')}
            </Button>
            {/* <Button color={'primary'} fullLength onClick={handleEdit}>
              {t('common:EDIT')}
            </Button> */}
          </>
        }
      >
        <PageTitle
          style={{ marginBottom: '20px' }}
          title={t('ADD_TASK.CUSTOM_TASK')}
          onGoBack={handleGoBack}
        />

        <Input
          label={t('ADD_TASK.CUSTOM_TASK_NAME')}
          name={TASK_NAME}
          hookFormRegister={register(TASK_NAME)}
          disabled
        />
        {showRetire && (
          <RetireCustomTaskModal
            dismissModal={() => {
              setShowRetire(false);
            }}
            onRetire={handleRetire}
          />
        )}
      </Layout>
    </>
  );
};

export default PureEditCustomTask;
