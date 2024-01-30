import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import Form from '../../Form';
import PageTitle from '../../PageTitle/v2';
import { AddLink } from '../../Typography';
import styles from './styles.module.scss';
import clsx from 'clsx';
import CustomTask from '../../../assets/images/task/Custom.svg';

export const PureManageCustomTasks = ({
  handleGoBack,
  onAddCustomTask,
  onError,
  persistedFormData,
  useHookFormPersist,
  history,
  onEditCustomTask,
  customTasks,
}) => {
  const { t } = useTranslation();

  const { getValues, setValue, register, watch } = useForm({
    defaultValues: persistedFormData,
    mode: 'onChange',
  });

  useHookFormPersist(getValues);

  const TASK_TYPE_ID = 'task_type_id';
  register(TASK_TYPE_ID);
  const selected_task_type = watch(TASK_TYPE_ID);

  const onTileClick = (task_type_id) => {
    // pass task_type_id to pfd so custom task page knows which custom task is being edited
    setValue(TASK_TYPE_ID, task_type_id);
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

        <div className={styles.matrixContainer}>
          {customTasks
            .sort((firstEl, secondEl) => firstEl.task_name.localeCompare(secondEl.task_name))
            .map(({ task_translation_key, task_type_id, task_name }) => {
              return (
                <div
                  onClick={() => {
                    onTileClick(task_type_id);
                  }}
                  key={task_type_id}
                >
                  <div
                    className={clsx(
                      styles.typeContainer,
                      selected_task_type === task_type_id && styles.typeContainerSelected,
                    )}
                  >
                    <CustomTask />
                    <div className={styles.taskTypeLabelContainer}>{task_name}</div>
                  </div>
                </div>
              );
            })}
        </div>
      </Form>
    </>
  );
};
