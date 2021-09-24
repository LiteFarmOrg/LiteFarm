import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import FinanceGroupHeader from './Header';
import FinancesItem from './GroupItem';

const FinanceGroup = ({
  headerTitle,
  headerSubtitle,
  headerClickForward,
  totalAmount,
  isDropDown,
  financeItemsProps = [],
}) => {
  const [open, setOpen] = useState(!isDropDown);

  return (
    <div className={styles.groupContainer}>
      <FinanceGroupHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        currencyAmount={totalAmount}
        isDropDown={isDropDown}
        open={open}
        setOpen={setOpen}
        onClickForward={headerClickForward}
      />
      {open && financeItemsProps.map((props) => <FinancesItem {...props} />)}
    </div>
  );
};

FinanceGroup.prototype = {
  isDropDown: PropTypes.bool,
};

export default FinanceGroup;
