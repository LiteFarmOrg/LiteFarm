/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import PropTypes from 'prop-types';
import CardsCarrousel from '../../CardsCarrousel';
import ProfitLossIconDark from '../../../assets/images/finance/Profit-loss-icn-dark.svg?react';
import ProfitLossIconLight from '../../../assets/images/finance/Profit-loss-icn-light.svg?react';
import ProfitLossIconRedDark from '../../../assets/images/finance/Profit-loss-icn-red-dark.svg?react';
import ProfitLossIconRedLight from '../../../assets/images/finance/Profit-loss-icn-red-light.svg?react';
import ExpenseIcon from '../../../assets/images/finance/Expense-icn.svg?react';
import CropIcon from '../../../assets/images/finance/Crop-icn.svg?react';
import styles from './styles.module.scss';
import { Semibold, Text } from '../../Typography';
import clsx from 'clsx';
import TextButton from '../../Form/Button/TextButton';
import {
  ACTUAL_REVENUE_URL,
  ESTIMATED_REVENUE_URL,
  LABOUR_URL,
  OTHER_EXPENSE_URL,
} from '../../../util/siteMapConstants';

ChartJS.register(ArcElement, Tooltip);

const ShadowPlugin = {
  beforeDraw: (chart) => {
    const { ctx } = chart;
    ctx.shadowColor = '#FFEFCF';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
  },
};

const FinancesCarrousel = ({
  totalExpense,
  totalRevenue,
  labourExpense,
  otherExpense,
  estimatedRevenue,
  currencySymbol,
  history,
}) => {
  const { t } = useTranslation();

  const expenseChartData = {
    labels: [t('SALE.FINANCES.TOTAL_LABOUR'), t('SALE.FINANCES.TOTAL_OTHER')],
    datasets: [
      {
        data: [labourExpense, otherExpense],
        backgroundColor: ['#FFB800', '#AA5F04'],
      },
    ],
  };

  const profitLoss = totalRevenue - totalExpense;

  const ProfitLossLight = profitLoss < 0 ? ProfitLossIconRedLight : ProfitLossIconLight;
  const ProfitLossDark = profitLoss < 0 ? ProfitLossIconRedDark : ProfitLossIconDark;

  const cards = [
    {
      id: 'profit-loss',
      label: t('SALE.FINANCES.PROFIT_LOSS'),
      inactiveBackgroundColor: 'var(--teal700)',
      inactiveIcon: <ProfitLossDark role="img" aria-label={t('SALE.FINANCES.PROFIT_LOSS')} />,
      activeContent: (
        <div className={clsx([styles.cardContent, styles.profitLossCardContent])}>
          <div className={styles.revenueExpensesContainer}>
            <TextButton
              className={clsx([styles.revenueContainer, styles.clickableContainer])}
              onClick={() => history.push(ACTUAL_REVENUE_URL)}
            >
              <span>
                <span className={styles.revenueTitle}>{t('SALE.FINANCES.TOTAL_REVENUE')}</span>
                <span className={clsx([styles.stat, styles.revenueStat])}>
                  <br></br>
                  {currencySymbol}
                  {totalRevenue}
                </span>
              </span>
              <BsChevronRight width={16} height={16} />
            </TextButton>
            <div className={styles.expenseContainer}>
              <Text className={styles.expenseTitle}>{t('SALE.FINANCES.TOTAL_EXPENSES')}</Text>
              <p className={clsx([styles.stat, styles.expenseStat])}>
                {currencySymbol}
                {totalExpense}
              </p>
            </div>
          </div>
          <div className={clsx([styles.profitLossSummaryContainer, profitLoss < 0 && styles.loss])}>
            <ProfitLossLight role="img" aria-label={t('SALE.FINANCES.PROFIT_LOSS')} />
            <Text className={styles.profitLossTitle}>{t('SALE.FINANCES.PROFIT_LOSS')}</Text>
            <p className={clsx([styles.stat, styles.profitLossStat])}>
              {profitLoss < 0 ? '-' : ''}
              {currencySymbol}
              {Math.abs(profitLoss)}
            </p>
          </div>
        </div>
      ),
      note: t('SALE.FINANCES.CARROUSEL_TEXT.GENERIC'),
      noteColor: '#72B8B0',
    },
    {
      id: 'expenses',
      label: t('SALE.FINANCES.EXPENSES'),
      inactiveBackgroundColor: '#FFF',
      inactiveIcon: <ExpenseIcon aria-label={t('SALE.FINANCES.EXPENSES')} />,
      activeContent: (
        <div className={styles.cardContent}>
          <div className={styles.totalExpensesContainer}>
            <Semibold className={styles.totalExpensesTitle}>
              {t('SALE.FINANCES.TOTAL_EXPENSES')}
            </Semibold>
            <div className={styles.expensesChartContainer}>
              <div className={styles.expensesChart}>
                <Doughnut
                  data={expenseChartData}
                  options={{ cutout: '70%', borderWidth: 0, animation: false }}
                  plugins={[ShadowPlugin]}
                />
              </div>
              <div className={styles.totalExpensesStatContainer}>
                <p className={clsx([styles.stat, styles.totalExpensesStat])}>
                  {currencySymbol}
                  {totalExpense}
                </p>
              </div>
            </div>
          </div>
          <div className={styles.expensesStatsContainer}>
            <TextButton
              className={clsx([styles.labourExpensesContainer, styles.clickableContainer])}
              onClick={() => history.push(LABOUR_URL)}
            >
              <span>
                <span className={styles.labourExpensesTitle}>
                  {t('SALE.FINANCES.TOTAL_LABOUR')}
                </span>
                <span className={clsx([styles.stat, styles.labourExpensesStat])}>
                  <br></br>
                  {currencySymbol}
                  {labourExpense}
                </span>
              </span>
              <BsChevronRight width={16} height={16} />
            </TextButton>
            <TextButton
              className={clsx([styles.otherExpensesContainer, styles.clickableContainer])}
              onClick={() => history.push(OTHER_EXPENSE_URL)}
            >
              <span>
                <span className={styles.otherExpensesTitle}>{t('SALE.FINANCES.TOTAL_OTHER')}</span>
                <span className={clsx([styles.stat, styles.otherExpensesStat])}>
                  <br></br>
                  {currencySymbol}
                  {otherExpense}
                </span>
              </span>
              <BsChevronRight width={16} height={16} />
            </TextButton>
          </div>
        </div>
      ),
      note: t('SALE.FINANCES.CARROUSEL_TEXT.GENERIC'),
      noteColor: 'var(--brown700)',
    },
    {
      id: 'crop-revenue',
      label: t('SALE.FINANCES.ESTIMATED_HARVEST_REVENUE'),
      inactiveBackgroundColor: 'var(--green400)',
      inactiveIcon: (
        <CropIcon role="img" aria-label={t('SALE.FINANCES.ESTIMATED_HARVEST_REVENUE')} />
      ),
      activeContent: (
        <div className={clsx([styles.cardContent, styles.estimatedRevenueCardContent])}>
          <CropIcon
            width={56}
            height={56}
            role="img"
            aria-label={t('SALE.FINANCES.ESTIMATED_HARVEST_REVENUE')}
          />
          <TextButton
            className={clsx([styles.estimatedRevenueContainer, styles.clickableContainer])}
            onClick={() => history.push(ESTIMATED_REVENUE_URL)}
          >
            <span>
              <span className={styles.estimatedRevenueTitle}>
                {t('SALE.FINANCES.ESTIMATED_HARVEST_REVENUE')}
              </span>
              <span className={styles.stat}>
                <br></br>
                {currencySymbol}
                {estimatedRevenue}
              </span>
            </span>
            <BsChevronRight width={16} height={16} />
          </TextButton>
        </div>
      ),
      note: t('SALE.FINANCES.CARROUSEL_TEXT.ESTIMATED_REVENUE'),
      noteColor: '#72B8B0',
    },
  ];

  return <CardsCarrousel cards={cards} />;
};

FinancesCarrousel.propTypes = {
  totalExpense: PropTypes.string.isRequired,
  totalRevenue: PropTypes.string.isRequired,
  labourExpense: PropTypes.string.isRequired,
  otherExpense: PropTypes.string.isRequired,
  estimatedRevenue: PropTypes.string.isRequired,
  currencySymbol: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default FinancesCarrousel;
