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

import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import WithNavigation from './WithNavigation';
const Finances = React.lazy(() => import('../containers/Finances'));
const ActualRevenue = React.lazy(() => import('../containers/Finances/ActualRevenue'));
const UpdateEstimatedCropRevenue = React.lazy(() =>
  import('../containers/Finances/UpdateEstimatedCropRevenue'),
);
const RevenueTypes = React.lazy(() => import('../containers/Finances/AddSale/RevenueTypes'));
const AddSale = React.lazy(() => import('../containers/Finances/AddSale'));
const ManageRevenueTypes = React.lazy(() =>
  import('../containers/Finances/ManageCustomRevenueTypes'),
);
const RevenueDetail = React.lazy(() => import('../containers/Finances/RevenueDetail'));
const EstimatedRevenue = React.lazy(() => import('../containers/Finances/EstimatedRevenue'));
const Labour = React.lazy(() => import('../containers/Finances/Labour'));
const OtherExpense = React.lazy(() => import('../containers/Finances/OtherExpense'));
const ExpenseDetail = React.lazy(() => import('../containers/Finances/ExpenseDetail'));
const ExpenseCategories = React.lazy(() =>
  import('../containers/Finances/NewExpense/ExpenseCategories'),
);
const AddExpense = React.lazy(() => import('../containers/Finances/NewExpense/AddExpense'));
const ManageExpenseTypes = React.lazy(() =>
  import('../containers/Finances/ManageCustomExpenseTypes'),
);
const AddCustomExpense = React.lazy(() =>
  import('../containers/Finances/CustomExpenseType/AddSimpleCustomExpense'),
);
const ReadOnlyCustomExpense = React.lazy(() =>
  import('../containers/Finances/CustomExpenseType/ReadOnlySimpleCustomExpense'),
);
const EditCustomExpense = React.lazy(() =>
  import('../containers/Finances/CustomExpenseType/EditSimpleCustomExpense'),
);
const AddCustomRevenue = React.lazy(() =>
  import('../containers/Finances/CustomRevenueType/AddCustomRevenue'),
);
const ReadOnlyCustomRevenue = React.lazy(() =>
  import('../containers/Finances/CustomRevenueType/ReadOnlyCustomRevenue'),
);
const EditCustomRevenue = React.lazy(() =>
  import('../containers/Finances/CustomRevenueType/EditCustomRevenue'),
);

const FinancesRoutes = () => (
  <Routes>
    <Route path="transactions" element={<Finances />} />
    <Route path="actual_revenue" element={<ActualRevenue />} />
    <Route
      path="estimated_revenue/plan/:management_plan_id"
      element={<UpdateEstimatedCropRevenue />}
    />
    <Route path="revenue_types" element={<RevenueTypes />} />
    <Route path="add_revenue" element={<AddSale />} />
    <Route path="manage_custom_revenues" element={<ManageRevenueTypes />} />
    <Route path="revenue/:sale_id" element={<RevenueDetail />} />
    <Route path="revenue/:sale_id/edit" element={<RevenueDetail />} />
    <Route path="estimated_revenue" element={<EstimatedRevenue />} />
    <Route path="labour" element={<Labour />} />
    <Route path="other_expense" element={<OtherExpense />} />
    <Route path="expense/:expense_id" element={<ExpenseDetail />} />
    <Route path="expense/:expense_id/edit" element={<ExpenseDetail />} />
    <Route path="expense_categories" element={<WithNavigation component={ExpenseCategories} />} />
    <Route path="add_expense" element={<WithNavigation component={AddExpense} />} />
    <Route path="manage_custom_expenses" element={<ManageExpenseTypes />} />
    <Route path="add_custom_expense" element={<AddCustomExpense />} />
    <Route path="readonly_custom_expense/:expense_type_id" element={<ReadOnlyCustomExpense />} />
    <Route path="edit_custom_expense/:expense_type_id" element={<EditCustomExpense />} />
    <Route path="add_custom_revenue" element={<AddCustomRevenue />} />
    <Route path="readonly_custom_revenue/:revenue_type_id" element={<ReadOnlyCustomRevenue />} />
    <Route path="edit_custom_revenue/:revenue_type_id" element={<EditCustomRevenue />} />
    <Route path="*" element={<Navigate to={'/'} />} />
  </Routes>
);

export default FinancesRoutes;
