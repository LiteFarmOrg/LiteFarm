import React, { useEffect, useMemo } from 'react';
import Layout from '../../../components/Layout';
import PageTitle from '../../../components/PageTitle/v2';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { dateRangeSelector, salesSelector } from '../selectors';
import WholeFarmRevenue from '../../../components/Finances/WholeFarmRevenue';
import { AddLink, Semibold } from '../../../components/Typography';
import DateRangePicker from '../../../components/Form/DateRangePicker';
import ActualCropRevenue from '../ActualCropRevenue';
import FinanceListHeader from '../../../components/Finances/FinanceListHeader';
import { calcActualRevenue, filterSalesByDateRange } from '../util';
import { setDateRange } from '../actions';

export default function ActualRevenue({ history, match }) {
  const { t } = useTranslation();
  const onGoBack = () => history.back();
  const onAddRevenue = () => history.push(`/add_sale`);
  // TODO: refactor sale data after finance reducer is remade
  const sales = useSelector(salesSelector);
  const dateRange = useSelector(dateRangeSelector);
  const dispatch = useDispatch();

  const year = new Date().getFullYear();

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
      from_date: dateRange?.startDate
        ? new Date(
            typeof dateRange.startDate === 'string'
              ? dateRange.startDate.split('T')[0] + 'T00:00:00.000Z'
              : dateRange.startDate,
          )
            .toISOString()
            .split('T')[0]
        : `${year}-01-01`,
      to_date: dateRange?.endDate
        ? new Date(
            typeof dateRange.endDate === 'string'
              ? dateRange.endDate.split('T')[0] + 'T00:00:00.000Z'
              : dateRange.endDate,
          )
            .toISOString()
            .split('T')[0]
        : `${year}-12-31`,
    },
  });

  const fromDate = watch('from_date');
  const toDate = watch('to_date');

  const revenueForWholeFarm = useMemo(
    () => calcActualRevenue(sales, fromDate, toDate),
    [sales, fromDate, toDate],
  );
  const filteredSales = useMemo(
    () => filterSalesByDateRange(sales, fromDate, toDate),
    [sales, fromDate, toDate],
  );

  useEffect(() => {
    dispatch(setDateRange({ startDate: fromDate, endDate: toDate }));
  }, [fromDate, toDate]);

  return (
    <Layout>
      <PageTitle
        title={t('FINANCES.ACTUAL_REVENUE.TITLE')}
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
      />

      <WholeFarmRevenue amount={revenueForWholeFarm} style={{ marginBottom: '14px' }} />
      <AddLink onClick={onAddRevenue} style={{ marginBottom: '32px' }}>
        {t('FINANCES.ACTUAL_REVENUE.ADD_REVENUE')}
      </AddLink>

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
      {filteredSales.map((sale) => (
        <ActualCropRevenue
          key={sale.sale_id}
          sale={sale}
          history={history}
          style={{ marginBottom: '16px' }}
        />
      ))}
    </Layout>
  );
}
