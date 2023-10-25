import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import FinanceGroup from '../../../components/Finances/FinanceGroup';
import { getManagementPlanCardDate } from '../../../util/moment';
import { setSelectedSale } from '../actions';

const ActualRevenueItem = ({ revenueItem, history, ...props }) => {
  const { sale_id, sale_date, customer_name } = revenueItem.sale;

  const dispatch = useDispatch();

  const onClickForward = () => {
    dispatch(setSelectedSale(revenueItem.sale));
    history.push(`/revenue/${sale_id}`);
  };

  return (
    <FinanceGroup
      headerTitle={getManagementPlanCardDate(sale_date)}
      headerSubtitle={customer_name}
      headerClickForward={onClickForward}
      {...revenueItem}
      {...props}
    />
  );
};

ActualRevenueItem.prototype = {
  isDropDown: PropTypes.bool,
};

export default ActualRevenueItem;
