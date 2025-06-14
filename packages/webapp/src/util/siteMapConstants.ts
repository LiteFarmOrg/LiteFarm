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
export const ADD_ANIMALS_URL = '/animals/inventory/add_animals';
export const createSingleAnimalViewURL = (id: string | number): string => {
  return `/animals/${id}`;
};
export const createSingleAnimalTasksURL = (id: string | number): string => {
  return `${createSingleAnimalViewURL(id)}/tasks`;
};

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
export const EXPENSE_CATEGORIES_URL = '/finances/expense_categories';
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
export const ADD_TASK_DETAILS = '/add_task/task_details';
export const ADD_TASK_ASSIGNMENT = '/add_task/task_assignment';

// First complete page for cleaning, field work, irrigation, pest, planting, soil amendment,
// transplant, animal movement, soil sample tasks
export const createBeforeCompleteTaskUrl = (id: string | number): string => {
  return `/tasks/${id}/before_complete`;
};

// First complete page harvest tasks
export const createCompleteHarvestQuantityTaskUrl = (id: string | number): string => {
  return `/tasks/${id}/complete_harvest_quantity`;
};

// First complete page for custom tasks
export const createCompleteTaskUrl = (id: string | number, hasAnimals: boolean): string => {
  return hasAnimals ? `/tasks/${id}/before_complete` : `/tasks/${id}/complete`;
};

// Maps
export const MAP_URL = '/map';
export const ADD_SENSORS_URL = '/add_sensors';
export const SENSORS_URL = '/sensors';

// Sensors
export const createSensorsUrl = (partnerId?: number): string => {
  return `/sensors${partnerId ? `?partner_id=${partnerId}` : ''}`;
};

// Smart Irrigation
export const IRRIGATION_PRESCRIPTION_URL = '/irrigation_prescription';

const LOCATION_TYPE_ROUTES = [
  '/barn',
  '/buffer_zone',
  '/ceremonial_area',
  '/farm_site_boundary',
  '/fence',
  '/field',
  '/garden',
  '/gate',
  '/greenhouse',
  '/natural_area',
  '/residence',
  '/sensor',
  '/sensor_array',
  '/surface_water',
  '/watercourse',
];

// For top menu navigation title
export const MAP_ROUTES = [...LOCATION_TYPE_ROUTES, IRRIGATION_PRESCRIPTION_URL];
