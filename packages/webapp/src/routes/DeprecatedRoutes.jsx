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

import { Redirect, Route, Switch } from 'react-router-dom';

// Redirects from previous routes
const DeprecatedRoutes = () => (
  <Switch>
    {/* Redirect old routes to nested finances routes for backwards compatibility */}
    {/* <Redirect exact from="/finances" to="/finances/transactions" /> */}
    {/* <Redirect exact from="/revenue_types" to="/finances/revenue_types" /> */}
    {/* <Redirect exact from="/add_sale" to="/finances/add_revenue" /> */}
    {/* <Redirect exact from="/manage_custom_revenues" to="/finances/manage_custom_revenues" /> */}
    {/* <Redirect exact from="/revenue/:sale_id" to="/finances/revenue/:sale_id" />
    <Redirect exact from="/revenue/:sale_id/edit" to="/finances/revenue/:sale_id/edit" /> */}
    {/* <Redirect exact from="/estimated_revenue" to="/finances/estimated_revenue" /> */}
    {/* <Redirect exact from="/labour" to="/finances/labour" /> */}
    {/* <Redirect exact from="/other_expense" to="/finances/other_expense" /> */}
    <Redirect exact from="/expense/:expense_id" to="/finances/expense/:expense_id" />
    <Redirect exact from="/expense/:expense_id/edit" to="/finances/expense/:expense_id/edit" />
    {/* <Redirect exact from="/expense_categories" to="/finances/expense_categories" /> */}
    {/* <Redirect exact from="/add_expense" to="/finances/add_expense" /> */}
    {/* <Redirect exact from="/manage_custom_expenses" to="/finances/manage_custom_expenses" /> */}
    {/* <Redirect exact from="/add_custom_expense" to="/finances/add_custom_expense" /> */}
    {/* <Redirect
      exact
      from="/readonly_custom_expense/:expense_type_id"
      to="/finances/readonly_custom_expense/:expense_type_id"
    /> */}
    {/* <Redirect
      exact
      from="/edit_custom_expense/:expense_type_id"
      to="/finances/edit_custom_expense/:expense_type_id"
    /> */}
    {/* <Redirect exact from="/add_custom_revenue" to="/finances/add_custom_revenue" /> */}
    {/* <Redirect
      exact
      from="/readonly_custom_revenue/:revenue_type_id"
      to="/finances/readonly_custom_revenue/:revenue_type_id"
    /> */}
    {/* <Redirect
      exact
      from="/edit_custom_revenue/:revenue_type_id"
      to="/finances/edit_custom_revenue/:revenue_type_id"
    /> */}
    <Redirect exact to={'/'} />
  </Switch>
);

export default DeprecatedRoutes;
