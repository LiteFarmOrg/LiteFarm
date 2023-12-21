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
import { Route, Switch } from 'react-router-dom';
import { DeprecatedRoutes } from './DeprecatedRoutes';
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

export const FinancesRoutes = () => (
  <Switch>
    <Route path="/finances/transactions" exact component={Finances} />
    <Route path="/finances/actual_revenue" exact component={ActualRevenue} />
    <Route
      path="/finances/estimated_revenue/plan/:management_plan_id"
      exact
      component={UpdateEstimatedCropRevenue}
    />
    <Route path="/finances/revenue_types" exact component={RevenueTypes} />
    <Route path="/finances/add_revenue" exact component={AddSale} />
    <Route path="/finances/manage_custom_revenues" exact component={ManageRevenueTypes} />
    <Route path="/finances/revenue/:sale_id/" exact component={RevenueDetail} />
    <Route path="/finances/revenue/:sale_id/edit" exact component={RevenueDetail} />
    <Route path="/finances/estimated_revenue" exact component={EstimatedRevenue} />
    <Route path="/finances/labour" exact component={Labour} />
    <Route path="/finances/other_expense" exact component={OtherExpense} />
    <Route path="/finances/expense/:expense_id/" exact component={ExpenseDetail} />
    <Route path="/finances/expense/:expense_id/edit" exact component={ExpenseDetail} />
    <Route path="/finances/expense_categories" exact component={ExpenseCategories} />
    <Route path="/finances/add_expense" exact component={AddExpense} />
    <Route path="/finances/manage_custom_expenses" exact component={ManageExpenseTypes} />
    <Route path="/finances/add_custom_expense" exact component={AddCustomExpense} />
    <Route
      path="/finances/readonly_custom_expense/:expense_type_id"
      exact
      component={ReadOnlyCustomExpense}
    />
    <Route
      path="/finances/edit_custom_expense/:expense_type_id"
      exact
      component={EditCustomExpense}
    />
    <Route path="/finances/add_custom_revenue" exact component={AddCustomRevenue} />
    <Route
      path="/finances/readonly_custom_revenue/:revenue_type_id"
      exact
      component={ReadOnlyCustomRevenue}
    />
    <Route
      path="/finances/edit_custom_revenue/:revenue_type_id"
      exact
      component={EditCustomRevenue}
    />
    {/* Redirect old routes to nested finances routes for backwards compatibility */}
    <DeprecatedRoutes />
  </Switch>
);
