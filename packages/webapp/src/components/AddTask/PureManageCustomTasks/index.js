import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import { AddLink } from '../../Typography';
import { useSelector } from 'react-redux';
import { userCreatedTaskTypes } from '../../../containers/taskTypeSlice';
import styles from './styles.module.scss';
import clsx from 'clsx';
import { ReactComponent as CustomTask } from '../../../assets/images/task/Custom.svg';

const PureManageCustomTasks = ({
  handleGoBack,
  onAddCustomTask,
  onError,
  persistedFormData,
  persistedPaths,
  useHookFormPersist,
  history,
  onEditCustomTask,
}) => {
  const { t } = useTranslation();

  const {
    handleSubmit,
    getValues,
    watch,
    control,
    setValue,
    register,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
  });

  const customTasks = useSelector(userCreatedTaskTypes);
  useHookFormPersist(getValues, persistedPaths);

  const CUSTOM_TASK_TYPE = 'type';
  register(CUSTOM_TASK_TYPE, { required: true });
  let selected_custom_task_type = watch(CUSTOM_TASK_TYPE);
  let task = persistedFormData?.type;

  const onTileClick = (task_type_id) => {
    // pass task_type_id to pfd so custom task page knows which custom task is being edited
    setValue(CUSTOM_TASK_TYPE, task_type_id);
    onEditCustomTask();
  };

  return (
    <>
      <Form>
        <PageTitle
          style={{ marginBottom: '20px' }}
          title={t('ADD_TASK.MANAGE_CUSTOM_TASKS')}
          onGoBack={handleGoBack}
        />
        <AddLink style={{ paddingBottom: '20px' }} onClick={onAddCustomTask}>
          {t('ADD_TASK.ADD_CUSTOM_TASK')}
        </AddLink>

        <div className={styles.tileContainer}>
          {customTasks.map(({ task_translation_key, task_type_id, task_name }) => {
            return (
              <div
                onClick={() => {
                  onTileClick(task_type_id);
                }}
                key={task_translation_key}
              >
                <div
                  className={clsx(
                    styles.typeContainer,
                    task === task_type_id && styles.typeContainerSelected,
                  )}
                >
                  <CustomTask />
                  <div>{task_name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Form>
    </>
  );
};

export default PureManageCustomTasks;
