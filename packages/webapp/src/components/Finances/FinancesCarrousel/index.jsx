import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import CardsCarrousel from '../../CardsCarrousel';
import { ReactComponent as ProfitLossIconDark } from '../../../assets/images/finance/Profit-loss-icn-dark.svg';
import { ReactComponent as ProfitLossIconLight } from '../../../assets/images/finance/Profit-loss-icn-light.svg';
import { ReactComponent as ExpenseIcon } from '../../../assets/images/finance/Expense-icn.svg';
import { ReactComponent as CropIcon } from '../../../assets/images/finance/Crop-icn.svg';
import styles from './styles.module.scss';
import { Semibold, Text } from '../../Typography';
import clsx from 'clsx';
import TextButton from '../../Form/Button/TextButton';

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
    labels: ['Total other', 'Total labour'],
    datasets: [
      {
        data: [11500, 21523],
        backgroundColor: ['#FFB800', '#AA5F04'],
      },
    ],
  };

  const profitLoss = totalRevenue - totalExpense;

  const cards = [
    {
      id: 'profit-loss',
      inactiveBackgroundColor: 'var(--teal700)',
      inactiveIcon: <ProfitLossIconDark />,
      activeContent: (
        <div className={clsx([styles.cardContent, styles.profitLossCardContent])}>
          <div className={styles.revenueExpensesContainer}>
            <TextButton
              className={styles.revenueContainer}
              onClick={() => history.push('/finances/actual_revenue')}
            >
              <div>
                <Text className={styles.revenueTitle}>Total revenue</Text>
                <p className={clsx([styles.stat, styles.revenueStat])}>
                  {currencySymbol}
                  {totalRevenue}
                </p>
              </div>
              <BsChevronRight />
            </TextButton>
            <div className={styles.expenseContainer}>
              <Text className={styles.expenseTitle}>Total expenses</Text>
              <p className={clsx([styles.stat, styles.expenseStat])}>
                {currencySymbol}
                {totalExpense}
              </p>
            </div>
          </div>
          <div className={styles.profitLossSummaryContainer}>
            <ProfitLossIconLight />
            <Text className={styles.profitLossTitle}>Profit / Loss</Text>
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
      inactiveBackgroundColor: 'var(--white)',
      inactiveIcon: <ExpenseIcon />,
      activeContent: (
        <div className={styles.cardContent}>
          <div className={styles.totalExpensesContainer}>
            <Semibold className={styles.totalExpensesTitle}>Total expenses</Semibold>
            <div className={styles.expensesChartContainer}>
              <div className={styles.expensesChart}>
                <Doughnut
                  data={expenseChartData}
                  options={{ cutout: '70%', borderWidth: 0 }}
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
              className={styles.labourExpensesContainer}
              onClick={() => history.push('/labour')}
            >
              <div>
                <Text className={styles.labourExpensesTitle}>Total labour</Text>
                <p className={clsx([styles.stat, styles.labourExpensesStat])}>
                  {currencySymbol}
                  {labourExpense}
                </p>
              </div>
              <BsChevronRight />
            </TextButton>
            <TextButton
              className={styles.otherExpensesContainer}
              onClick={() => history.push('/other_expense')}
            >
              <div>
                <Text className={styles.otherExpensesTitle}>Total other</Text>
                <p className={clsx([styles.stat, styles.otherExpensesStat])}>
                  {currencySymbol}
                  {otherExpense}
                </p>
              </div>
              <BsChevronRight />
            </TextButton>
          </div>
        </div>
      ),
      note: t('SALE.FINANCES.CARROUSEL_TEXT.GENERIC'),
      noteColor: '#AA5F04',
    },
    {
      id: 'crop-revenue',
      inactiveBackgroundColor: 'var(--green400)',
      inactiveIcon: <CropIcon />,
      activeContent: (
        <div className={clsx([styles.cardContent, styles.estimatedRevenueCardContent])}>
          <CropIcon width={56} height={56} />
          <TextButton
            className={styles.estimatedRevenueContainer}
            onClick={() => history.push('/estimated_revenue')}
          >
            <div>
              <Text className={styles.estimatedRevenueTitle}>Estimated harvest revenue</Text>
              <p className={styles.stat}>
                {currencySymbol}
                {estimatedRevenue}
              </p>
            </div>
            <BsChevronRight />
          </TextButton>
        </div>
      ),
      note: t('SALE.FINANCES.CARROUSEL_TEXT.ESTIMATED_REVENUE'),
      noteColor: '#72B8B0',
    },
  ];

  return <CardsCarrousel cards={cards} />;
};

export default FinancesCarrousel;
