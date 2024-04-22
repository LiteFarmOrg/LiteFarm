/*
 *  Copyright 2024 LiteFarm.org
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

// Type of string has the dual purpose of being used in routes parameter pathing
//   as well as accomodating UUID types.

// Animals

export const ANIMALS_URL = '/animals';
export const ANIMALS_INVENTORY_URL = '/animals/inventory';
export const ANIMALS_LOCATION_URL = '/animals/location';
export const ANIMALS_GROUPS_URL = '/animals/groups';

// Finances

export const FINANCES_URL = '/finances';
export const FINANCES_HOME_URL = '/finances/transactions';
export const REVENUE_TYPES_URL = '/finances/revenue_types';
export const ADD_REVENUE_URL = '/finances/add_revenue';
export const MANAGE_CUSTOM_REVENUES_URL = '/finances/manage_custom_revenues';
export const ACTUAL_REVENUE_URL = '/finances/actual_revenue';
export const ESTIMATED_REVENUE_URL = '/finances/estimated_revenue';
export const LABOUR_URL = '/finances/labour';
export const OTHER_EXPENSE_URL = '/finances/other_expense';
export const ADD_EXPENSE_URL = '/finances/add_expense';
export const MANAGE_CUSTOM_EXPENSES_URL = '/finances/manage_custom_expenses';
export const ADD_CUSTOM_EXPENSE_URL = '/finances/add_custom_expense';
export const ADD_CUSTOM_REVENUE_URL = '/finances/add_custom_revenue';
export const createExpenseDetailsUrl = (id: string | number): string => {
  return `/finances/expense/${id}`;
};
export const createEditExpenseDetailsUrl = (id: string | number): string => {
  return `${createExpenseDetailsUrl(id)}/edit`;
};
export const createRevenueDetailsUrl = (id: string | number): string => {
  return `/finances/revenue/${id}`;
};
export const createEditRevenueDetailsUrl = (id: string | number): string => {
  return `${createRevenueDetailsUrl(id)}/edit`;
};
export const createManagementPlanEstimatedRevenueURL = (id: string | number): string => {
  return `${ESTIMATED_REVENUE_URL}/plan/${id}`;
};
export const createReadonlyCustomExpenseURL = (id: string | number): string => {
  return `/finances/readonly_custom_expense/${id}`;
};
export const createEditCustomExpenseURL = (id: string | number): string => {
  return `/finances/edit_custom_expense/${id}`;
};

export const createEditCustomRevenueUrl = (id: string | number): string => {
  return `/finances/edit_custom_revenue/${id}`;
};

export const createReadonlyCustomRevenueUrl = (id: string | number): string => {
  return `/finances/readonly_custom_revenue/${id}`;
};

// Tasks
// First complete page for cleaning, field work, irrigation, pest, planting, soil amendment, transplant tasks
export const createBeforeCompleteTaskUrl = (id: string | number): string => {
  return `/tasks/${id}/before_complete`;
};

// First complete page harvest tasks
export const createCompleteHarvestQuantityTaskUrl = (id: string | number): string => {
  return `/tasks/${id}/complete_harvest_quantity`;
};

// First complete page for custom tasks
export const createCompleteTaskUrl = (id: string | number): string => {
  return `/tasks/${id}/complete`;
};
