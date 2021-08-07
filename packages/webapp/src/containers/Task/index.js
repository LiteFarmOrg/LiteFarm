import Layout from '../../components/Layout';
import { useTranslation } from 'react-i18next';
import PageTitle from '../../components/PageTitle/v2';
import { AddLink, Semibold, Text } from '../../components/Typography';
import { useDispatch, useSelector } from 'react-redux';
import { cropsSelector } from '../cropSlice';
import React, { useEffect, useState } from 'react';

import { isAdminSelector } from '../userFarmSlice';
import { resetAndUnLockFormData } from '../hooks/useHookFormPersist/hookFormPersistSlice';
// import ActiveFilterBox from '../../components/ActiveFilterBox';
import { taskReducerSelector, taskEntitiesSelector } from '../taskSlice';
import { getTasks } from './saga';
import TaskCard from './TaskCard';

export default function TaskPage({ history }) {
  const { t } = useTranslation();
  const isAdmin = useSelector(isAdminSelector);
  const tasks = useSelector(taskEntitiesSelector);
  console.log({ tasks });
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTasks());
  }, []);

  useEffect(() => {
    dispatch(resetAndUnLockFormData());
  }, []);

  return (
    <Layout classes={{ container: { backgroundColor: 'white' } }}>
      <PageTitle title={t('TASK.PAGE_TITLE')} style={{ paddingBottom: '20px' }} />
      <TaskCard task={tasks[0]} />
    </Layout>
  );
}
