import { useEffect, useMemo } from 'react';
import Layout from '../../../components/Layout';
import PageTitle from '../../../components/PageTitle/v2';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import WholeFarmRevenue from '../../../components/Finances/WholeFarmRevenue';
import { Semibold } from '../../../components/Typography';
import EstimatedCropRevenue from '../EstimatedCropRevenue';
import FinanceListHeader from '../../../components/Finances/FinanceListHeader';
import { managementPlansSelector } from '../../managementPlanSlice';
import { taskEntitiesByManagementPlanIdSelector } from '../../taskSlice';
import { isTaskType } from '../../Task/useIsTaskType';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import useDateRangeSelector from '../../../components/DateRangeSelector/useDateRangeSelector';
import { SUNDAY } from '../../../util/dateRange';
import { getManagementPlansAndTasks } from '../../saga';
import { FINANCES_HOME_URL } from '../../../util/siteMapConstants';
import { useNavigate } from 'react-router-dom-v5-compat';

export default function EstimatedRevenue() {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const onGoBack = () => navigate(FINANCES_HOME_URL);
  const managementPlans = useSelector(managementPlansSelector);
  const tasksByManagementPlanId = useSelector(taskEntitiesByManagementPlanIdSelector);
  const { startDate: fromDate, endDate: toDate } = useDateRangeSelector({ weekStartDate: SUNDAY });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getManagementPlansAndTasks());
  }, []);

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
      <DateRangeSelector />

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
              style={{ marginBottom: '16px' }}
            />
          ),
      )}
    </Layout>
  );
}
