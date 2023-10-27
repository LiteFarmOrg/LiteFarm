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
import PureTransactionList from '../../../components/Finances/Transaction/Mobile/List';
import useTransactions from '../useTransactions';

export default function TransactionList({ startDate, endDate }) {
  const mobileView = true;

  const dateFilter = { startDate, endDate };
  // TODO: LF-3752
  const expenseTypeFilter = null;
  const revenueTypeFilter = null;

  const transactions = useTransactions({ dateFilter, expenseTypeFilter, revenueTypeFilter });

  return <PureTransactionList data={transactions} mobileView={mobileView} />;
}
