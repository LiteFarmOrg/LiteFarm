import Layout from '../../Layout';
import Button from '../../Form/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../PageTitle/v2';
import { useSelector } from 'react-redux';
import { taskSelectorById } from '../../../containers/taskSlice';
import Input from '../../Form/Input';
import InputAutoSize from '../../Form/InputAutoSize';
import { userFarmsByFarmSelector } from '../../../containers/userFarmSlice';
import { userFarmSelector } from '../../../containers/userFarmSlice';
import LocationViewer from '../../LocationViewer';
import { Label, Underlined, Semibold, EditLink } from '../../Typography';
import styles from './styles.module.scss';
import { isAdminSelector } from '../../../containers/userFarmSlice';

export default function PureTaskReadOnly({
  task_id,
  onGoBack,
  taskSpecific,
  onComplete,
  onEdit,
  onAbandon,
}) {
  const { t } = useTranslation();

  const task = useSelector(taskSelectorById(task_id));
  const taskType = task.taskType;
  const dueDate = task.due_date.split('T')[0];
  const locations = task.locations.map(({ location_id }) => (location_id));
  const owner = task.owner_user_id;

  const users = useSelector(userFarmsByFarmSelector);
  const user = useSelector(userFarmSelector);
  const self = user.user_id;
  const isAdmin = useSelector(isAdminSelector);

  let assignee = null;
  for (let user of users) {
    if (user.user_id === task.assignee_user_id) {
      assignee = user.first_name + ' ' + user.last_name;
    }
  }

  return (
    <Layout
      buttonGroup={self === task.assignee_user_id && (
        <>
          <Button color={'primary'} onClick={onComplete} fullLength>
            {t('common:MARK_COMPLETE')}
          </Button>
        </>
      )}
    >

      <PageTitle
        onGoBack={onGoBack}
        style={{ marginBottom: '24px' }}
        title={t(`TASK.${taskType.task_translation_key}`) + ' ' + t('TASK.TASK')}
        onEdit={isAdmin || owner === self ? onEdit : false}
        editLink={t('TASK.EDIT_TASK')}
      >
      </PageTitle>


      <Input
        style={{ marginBottom: '40px' }}
        label={t('ADD_TASK.ASSIGNEE')}
        isSearchBar={true}
        disabled={true}
        value={assignee}
      />

      <Input
        style={{ marginBottom: '40px' }}
        type={'date'}
        value={dueDate}
        label={t('TASK.DUE_DATE')}
        disabled
      />

      <Label
        style={{ marginBottom: '12px' }}
      >
        {t('TASK.TARGET')}
      </Label>

      <LocationViewer
        className={styles.mapContainer}
        viewLocations={locations}
      />

      <Semibold
        style={{ marginBottom: '18px' }}
      >
        {t(`TASK.${taskType.task_translation_key}`) + ' ' + t('TASK.DETAILS')}
      </Semibold>

      {taskSpecific}

      <InputAutoSize
        style={{ marginBottom: '40px' }}
        label={t('common:NOTES')}
        value={task.notes}
        optional
      />

      {(self === task.assignee_user_id || self === owner || isAdmin) &&
        (<Underlined
          style={{ marginBottom: '16px' }}
          onClick={onAbandon}
        >
          {t('TASK.ABANDON_TASK')}
        </Underlined>
        )}
    </Layout>
  )
}