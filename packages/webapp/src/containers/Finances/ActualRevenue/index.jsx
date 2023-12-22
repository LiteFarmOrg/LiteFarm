import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import useDateRangeSelector from '../../../components/DateRangeSelector/useDateRangeSelector';
import DateRangeSelector from '../../../components/Finances/DateRangeSelector';
import FinanceListHeader from '../../../components/Finances/FinanceListHeader';
import WholeFarmRevenue from '../../../components/Finances/WholeFarmRevenue';
import Layout from '../../../components/Layout';
import PageTitle from '../../../components/PageTitle/v2';
import { AddLink, Semibold } from '../../../components/Typography';
import { SUNDAY } from '../../../util/dateRange';
import { cropVarietiesSelector } from '../../cropVarietySlice';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { allRevenueTypesSelector } from '../../revenueTypeSlice';
import ActualRevenueItem from '../ActualRevenueItem';
import { getRevenueTypes } from '../saga';
import { salesSelector } from '../selectors';
import {
  calcActualRevenueFromRevenueItems,
  filterSalesByDateRange,
  mapSalesToRevenueItems,
} from '../util';
import { getSales } from '../actions';
import { getCropVarieties } from '../../saga';

export default function ActualRevenue({ history, match }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onGoBack = () => history.back();
  const onAddRevenue = () => {
    dispatch(setPersistedPaths(['/revenue_types', '/add_sale']));
    history.push('/revenue_types');
  };
  // TODO: refactor sale data after finance reducer is remade
  const sales = useSelector(salesSelector);
  const allRevenueTypes = useSelector(allRevenueTypesSelector);
  const cropVarieties = useSelector(cropVarietiesSelector);
  const { startDate: fromDate, endDate: toDate } = useDateRangeSelector({ weekStartDate: SUNDAY });

  const filteredSales = useMemo(
    () => filterSalesByDateRange(sales, fromDate, toDate),
    [sales, fromDate, toDate],
  );
  const revenueItems = useMemo(
    () => mapSalesToRevenueItems(filteredSales, allRevenueTypes, cropVarieties),
    [filteredSales, allRevenueTypes, cropVarieties],
  );
  const revenueForWholeFarm = useMemo(
    () => calcActualRevenueFromRevenueItems(revenueItems),
    [revenueItems],
  );

  useEffect(() => {
    dispatch(getRevenueTypes());
    dispatch(getSales());
    dispatch(getCropVarieties());
  }, []);

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
      <DateRangeSelector />

      <FinanceListHeader
        firstColumn={t('FINANCES.DATE')}
        secondColumn={t('FINANCES.REVENUE')}
        style={{ marginBottom: '8px' }}
      />
      {revenueItems.map((item) => (
        <ActualRevenueItem
          key={item.sale.sale_id}
          revenueItem={item}
          history={history}
          style={{ marginBottom: '16px' }}
        />
      ))}
    </Layout>
  );
}
