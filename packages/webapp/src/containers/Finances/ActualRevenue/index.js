import React, { useMemo } from 'react';
import Layout from '../../../components/Layout';
import PageTitle from '../../../components/PageTitle/v2';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import moment from 'moment';
import { salesSelector } from '../selectors';
import WholeFarmRevenue from '../../../components/Finances/WholeFarmRevenue';
import { AddLink, Semibold } from '../../../components/Typography';
import DateRangePicker from '../../../components/Form/DateRangePicker';
import ActualCropRevenue from '../ActualCropRevenue';
import FinanceListHeader from '../../../components/Finances/FinanceListHeader';

export default function ActualRevenue({ history, match }) {
  const { t } = useTranslation();
  const onGoBack = () => history.goBack();
  const onAddRevenue = () => history.push(`/add_sale`);
  // TODO: refactor sale data after finance reducer is remade
  const sales = useSelector(salesSelector);

  const total = sales.reduce((acc, sale) => {
    const { crop_variety_sale } = sale;
    return acc + crop_variety_sale.reduce((acc, cvs) => acc + cvs.sale_value, 0);
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

  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = moment(new Date(sale.sale_date)).utc().format('YYYY-MM-DD');
      return new Date(saleDate) >= new Date(fromDate) && new Date(saleDate) <= new Date(toDate);
    });
  }, [sales, fromDate, toDate]);

  return (
    <Layout>
      <PageTitle
        title={t('FINANCES.ACTUAL_REVENUE.TITLE')}
        style={{ marginBottom: '24px' }}
        onGoBack={onGoBack}
      />

      <WholeFarmRevenue amount={total} style={{ marginBottom: '14px' }} />
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
