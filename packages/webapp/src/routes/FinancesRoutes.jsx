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
import { Route, Switch, Redirect } from 'react-router-dom';
import {
  ACTUAL_REVENUE_URL,
  ADD_CUSTOM_EXPENSE_URL,
  ADD_CUSTOM_REVENUE_URL,
  ADD_EXPENSE_URL,
  ADD_REVENUE_URL,
  createEditCustomExpenseURL,
  createEditCustomRevenueUrl,
  createEditExpenseDetailsUrl,
  createEditRevenueDetailsUrl,
  createExpenseDetailsUrl,
  createManagementPlanEstimatedRevenueURL,
  createReadonlyCustomExpenseURL,
  createReadonlyCustomRevenueUrl,
  createRevenueDetailsUrl,
  ESTIMATED_REVENUE_URL,
  EXPENSE_CATEGORIES_URL,
  FINANCES_HOME_URL,
  LABOUR_URL,
  MANAGE_CUSTOM_EXPENSES_URL,
  MANAGE_CUSTOM_REVENUES_URL,
  OTHER_EXPENSE_URL,
  REVENUE_TYPES_URL,
} from '../util/siteMapConstants';
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
  <Switch>
    <Route path={FINANCES_HOME_URL} exact component={Finances} />
    <Route path={ACTUAL_REVENUE_URL} exact component={ActualRevenue} />
    <Route
      path={createManagementPlanEstimatedRevenueURL(':management_plan_id')}
      exact
      component={UpdateEstimatedCropRevenue}
    />
    <Route path={REVENUE_TYPES_URL} exact component={RevenueTypes} />
    <Route path={ADD_REVENUE_URL} exact component={AddSale} />
    <Route path={MANAGE_CUSTOM_REVENUES_URL} exact component={ManageRevenueTypes} />
    <Route path={createRevenueDetailsUrl(':sale_id')} exact component={RevenueDetail} />
    <Route path={createEditRevenueDetailsUrl(':sale_id')} exact component={RevenueDetail} />
    <Route path={ESTIMATED_REVENUE_URL} exact component={EstimatedRevenue} />
    <Route path={LABOUR_URL} exact component={Labour} />
    <Route path={OTHER_EXPENSE_URL} exact component={OtherExpense} />
    <Route path={createExpenseDetailsUrl(':expense_id')} exact component={ExpenseDetail} />
    <Route path={createEditExpenseDetailsUrl(':expense_id')} exact component={ExpenseDetail} />
    <Route path={EXPENSE_CATEGORIES_URL} exact component={ExpenseCategories} />
    <Route path={ADD_EXPENSE_URL} exact component={AddExpense} />
    <Route path={MANAGE_CUSTOM_EXPENSES_URL} exact component={ManageExpenseTypes} />
    <Route path={ADD_CUSTOM_EXPENSE_URL} exact component={AddCustomExpense} />
    <Route
      path={createReadonlyCustomExpenseURL(':expense_type_id')}
      exact
      component={ReadOnlyCustomExpense}
    />
    <Route
      path={createEditCustomExpenseURL(':expense_type_id')}
      exact
      component={EditCustomExpense}
    />
    <Route path={ADD_CUSTOM_REVENUE_URL} exact component={AddCustomRevenue} />
    <Route
      path={createReadonlyCustomRevenueUrl(':revenue_type_id')}
      exact
      component={ReadOnlyCustomRevenue}
    />
    <Route
      path={createEditCustomRevenueUrl(':revenue_type_id')}
      exact
      component={EditCustomRevenue}
    />
    <Redirect to={'/'} />
  </Switch>
);

export default FinancesRoutes;
