import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
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
  className,
  ...props
}) => {
  const [open, setOpen] = useState(!isDropDown);

  return (
    <div className={clsx(styles.groupContainer, className)} {...props}>
      <FinanceGroupHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        currencyAmount={totalAmount}
        isDropDown={isDropDown}
        open={open}
        setOpen={setOpen}
        onClickForward={headerClickForward}
      />
      {open && financeItemsProps.map((itemProps) => <FinancesItem {...itemProps} />)}
    </div>
  );
};

FinanceGroup.prototype = {
  headerTitle: PropTypes.string,
  headerSubtitle: PropTypes.string,
  headerClickForward: PropTypes.func,
  totalAmount: PropTypes.number,
  isDropDown: PropTypes.bool,
  financeItemsProps: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string,
};

export default FinanceGroup;
