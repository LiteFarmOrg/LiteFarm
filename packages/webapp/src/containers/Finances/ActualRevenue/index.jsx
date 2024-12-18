import { useEffect, useMemo } from 'react';
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
import { getRevenueTypes, getSales } from '../saga';
import { salesSelector } from '../selectors';
import {
  calcActualRevenueFromRevenueItems,
  filterSalesByDateRange,
  mapSalesToRevenueItems,
} from '../util';
import { getCropVarieties } from '../../saga';
import {
  ADD_REVENUE_URL,
  FINANCES_HOME_URL,
  REVENUE_TYPES_URL,
} from '../../../util/siteMapConstants';
import { useNavigate } from 'react-router';

export default function ActualRevenue() {
  let navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const onGoBack = () => navigate(FINANCES_HOME_URL);
  const onAddRevenue = () => {
    dispatch(setPersistedPaths([REVENUE_TYPES_URL, ADD_REVENUE_URL]));
    navigate(REVENUE_TYPES_URL);
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
    dispatch(getSales());
    dispatch(getRevenueTypes());
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
          style={{ marginBottom: '16px' }}
        />
      ))}
    </Layout>
  );
}
