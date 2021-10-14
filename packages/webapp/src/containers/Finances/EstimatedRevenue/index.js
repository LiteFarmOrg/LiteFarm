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

export default function EstimatedRevenue({ history, match }) {
  const { t } = useTranslation();
  const onGoBack = () => history.goBack();
  const managementPlans = useSelector(managementPlansSelector);

  const total = managementPlans.reduce((acc, plan) => {
    const { estimated_revenue } = plan;
    return acc + estimated_revenue;
  }, 0);

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
    return managementPlans.reduce((acc, plan) => {
      const { crop_variety_id } = plan;
      if (!acc[crop_variety_id]) acc[crop_variety_id] = [];

      // TODO: update harvest date filter condition to be based on task
      const harvestDate = moment(plan.harvest_date).utc().format('YYYY-MM-DD');
      if (
        new Date(harvestDate) >= new Date(fromDate) &&
        new Date(harvestDate) <= new Date(toDate)
      ) {
        acc[crop_variety_id].push(plan);
      }
      return acc;
    }, {});
  }, [managementPlans, fromDate, toDate]);

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
              plans={plans}
              history={history}
              style={{ marginBottom: '16px' }}
            />
          ),
      )}
    </Layout>
  );
}
