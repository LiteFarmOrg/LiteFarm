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
    <Route path="/finances" exact>
      <Redirect to="/finances/transactions" />
    </Route>
    <Route path="/revenue_types" exact>
      <Redirect to="/finances/revenue_types" />
    </Route>
    <Route path="/add_sale" exact>
      <Redirect to="/finances/add_revenue" />
    </Route>
    <Route path="/manage_custom_revenues" exact>
      <Redirect to="/finances/manage_custom_revenues" />
    </Route>
    <Route path="/revenue/:sale_id" exact>
      <Redirect to="/finances/revenue/:sale_id" />
    </Route>
    <Route path="/revenue/:sale_id/edit" exact>
      <Redirect to="/finances/revenue/:sale_id/edit" />
    </Route>
    <Route path="/estimated_revenue" exact>
      <Redirect to="/finances/estimated_revenue" />
    </Route>
    <Route path="/labour" exact>
      <Redirect to="/finances/labour" />
    </Route>
    <Route path="/other_expense" exact>
      <Redirect to="/finances/other_expense" />
    </Route>
    <Route path="/expense/:expense_id" exact>
      <Redirect to="/finances/expense/:expense_id" />
    </Route>
    <Route path="/expense/:expense_id/edit" exact>
      <Redirect to="/finances/expense/:expense_id/edit" />
    </Route>
    <Route path="/expense_categories" exact>
      <Redirect to="/finances/expense_categories" />
    </Route>
    <Route path="/add_expense" exact>
      <Redirect to="/finances/add_expense" />
    </Route>
    <Route path="/manage_custom_expenses" exact>
      <Redirect to="/finances/manage_custom_expenses" />
    </Route>
    <Route path="/add_custom_expense" exact>
      <Redirect to="/finances/add_custom_expense" />
    </Route>
    <Route path="/readonly_custom_expense/:expense_type_id" exact>
      <Redirect to="/finances/readonly_custom_expense/:expense_type_id" />
    </Route>
    <Route path="/edit_custom_expense/:expense_type_id" exact>
      <Redirect to="/finances/edit_custom_expense/:expense_type_id" />
    </Route>
    <Route path="/add_custom_revenue" exact>
      <Redirect to="/finances/add_custom_revenue" />
    </Route>
    <Route path="/readonly_custom_revenue/:revenue_type_id" exact>
      <Redirect to="/finances/readonly_custom_revenue/:revenue_type_id" />
    </Route>
    <Route path="/edit_custom_revenue/:revenue_type_id" exact>
      <Redirect to="/finances/edit_custom_revenue/:revenue_type_id" />
    </Route>
    <Redirect to={'/'} />
  </Switch>
);

export default DeprecatedRoutes;
