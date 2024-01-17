// Finances
export const FINANCES_HOME_URL = '/finances/transactions';
export const REVENUE_TYPES_URL = '/finances/revenue_types';
export const ADD_REVENUE_URL = '/finances/add_revenue';
export const MANAGE_CUSTOM_REVENUES_URL = '/finances/manage_custom_revenues';
export const ESTIMATED_REVENUE_URL = '/finances/estimated_revenue';

export const createRevenueDetailsUrl = (id: string | number): string => {
  return `/finances/revenue/${id}`;
};
export const createEditRevenueDetailsUrl = (id: string | number): string => {
  return `${createRevenueDetailsUrl(id)}/edit`;
};
export const createManagementPlanEstimatedRevenueURL = (id: string | number): string => {
  return `${ESTIMATED_REVENUE_URL}/plan/${id}}`;
};

/* Temporary new section to prevent merge conflicts */
// Temporarily bottom of constant list
export const ADD_CUSTOM_REVENUE_URL = '/finances/add_custom_revenue';
//

// Temporarily bottom of function list
export const createEditCustomRevenueUrl = (id: string | number): string => {
  return `/finances/edit_custom_revenue/${id}`;
};

export const createReadonlyCustomRevenueUrl = (id: string | number): string => {
  return `/finances/readonly_custom_revenue/${id}`;
};
//
