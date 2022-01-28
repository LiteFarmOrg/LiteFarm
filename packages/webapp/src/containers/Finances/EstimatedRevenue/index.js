import React, { useMemo } from 'react';
import Layout from '../../../components/Layout';
import PageTitle from '../../../components/PageTitle/v2';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import WholeFarmRevenue from '../../../components/Finances/WholeFarmRevenue';
import { Semibold } from '../../../components/Typography';
import DateRangePicker from '../../../components/Form/DateRangePicker';
import EstimatedCropRevenue from '../EstimatedCropRevenue';
import FinanceListHeader from '../../../components/Finances/FinanceListHeader';
import { managementPlansSelector } from '../../managementPlanSlice';
import { taskEntitiesByManagementPlanIdSelector } from '../../taskSlice';
import { isTaskType } from '../../Task/useIsTaskType';

export default function EstimatedRevenue({ history, match }) {
  const { t } = useTranslation();
  const onGoBack = () => history.push(`/finances`);
  const managementPlans = useSelector(managementPlansSelector);
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);

  const {
    register,
    getValues,
    watch,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onBlur',
    shouldUnregister: true,
    defaultValues: {
      from_date: moment().startOf('year').format('YYYY-MM-DD'),
      to_date: moment().endOf('year').format('YYYY-MM-DD'),
    },
  });

  const fromDate = watch('from_date');
  const toDate = watch('to_date');

  const estimatedRevenueItems = useMemo(() => {
    return managementPlans
      .filter(({ abandon_date }) => !abandon_date)
      .reduce((acc, plan) => {
        const { crop_variety_id } = plan;
        if (!acc[crop_variety_id]) acc[crop_variety_id] = [];

        const harvestTasks =
          tasksByManagementPlanId[plan.management_plan_id]?.filter((task) =>
            isTaskType(task.taskType, 'HARVEST_TASK'),
          ) || [];
        const harvestDates = harvestTasks?.map((task) =>
          moment(task.due_date).utc().format('YYYY-MM-DD'),
        );
        if (
          harvestDates.some(
            (harvestDate) =>
              new Date(harvestDate) >= new Date(fromDate) &&
              new Date(harvestDate) <= new Date(toDate),
          )
        ) {
          acc[crop_variety_id].push(plan);
        }
        return acc;
      }, {});
  }, [managementPlans, fromDate, toDate]);

  const total = Object.entries(estimatedRevenueItems).reduce((acc, [crop_variety_id, plans]) => {
    const varietyTotal = plans.reduce((acc, plan) => {
      const { estimated_revenue } = plan;
      return acc + estimated_revenue;
    }, 0);
    return acc + varietyTotal;
  }, 0);

  return (
    <Layout>
      <PageTitle
        title={t('FINANCES.ESTIMATED_REVENUE.TITLE')}
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
      />

      <WholeFarmRevenue amount={total} style={{ marginBottom: '14px' }} />

      <Semibold style={{ marginBottom: '24px' }} sm>
        {t('FINANCES.VIEW_WITHIN_DATE_RANGE')}
      </Semibold>
      <DateRangePicker
        register={register}
        control={control}
        getValues={getValues}
        style={{ marginBottom: '24px' }}
      />

      <FinanceListHeader
        firstColumn={t('FINANCES.DATE')}
        secondColumn={t('FINANCES.REVENUE')}
        style={{ marginBottom: '8px' }}
      />
      {Object.entries(estimatedRevenueItems).map(
        ([crop_variety_id, plans]) =>
          plans.length > 0 && (
            <EstimatedCropRevenue
              key={crop_variety_id}
              cropVarietyId={crop_variety_id}
              managementPlans={plans}
              history={history}
              style={{ marginBottom: '16px' }}
            />
          ),
      )}
    </Layout>
  );
}
