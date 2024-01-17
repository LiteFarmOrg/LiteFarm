// Finances
export const FinancesHomeURL = '/finances/transactions';
export const RevenueTypesURL = '/finances/revenue_types';
export const AddRevenueURL = '/finances/add_revenue';
export const ManageCustomRevenuesURL = '/finances/manage_custom_revenues';
export const RevenueDetailsUrl = (id) => {
  return `/revenue/${id}`;
};
export const EditRevenueDetailsUrl = (id) => {
  return `${RevenueDetailsUrl(id)}/edit`;
};
