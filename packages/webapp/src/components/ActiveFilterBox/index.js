import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import Pill from '../Filter/Pill';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import { removeFilter } from '../../containers/filterSlice';

const ActiveFilterBox = ({ pageFilter, pageFilterKey, style }) => {
  const [firstRow, setFirstRow] = useState(0);
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch();

  const activeFilters = Object.entries(pageFilter).reduce((pfAcc, pfCurr) => {
    const filterKey = pfCurr[0];
    const filter = pfCurr[1];
    const activeList = Object.entries(filter).reduce((fAcc, fCurr) => {
      const filterItemValue = fCurr[0];
      const isFilterItemActive = fCurr[1].active;
      if (isFilterItemActive) {
        fAcc.push({
          filterKey,
          value: filterItemValue,
          label: filterItemValue,
        });
      }
      return fAcc;
    }, []);
    return [...activeList, ...pfAcc];
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const elements = document.getElementsByClassName('uniqueClassName');
      let y = 0;
      let firstRowEle = 0;
      for (const element of elements) {
        const top = element.getClientRects()?.[0]?.top;
        if (!y) {
          y = top;
        } else if (y !== top) {
          setFirstRow(firstRowEle);
          return;
        }
        firstRowEle++;
      }
      setFirstRow(firstRowEle);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return (_) => window.removeEventListener('resize', handleResize);
  }, []);

  const numHidden = activeFilters.length - firstRow;

  const handleRemovePill = (filter) => () => {
    dispatch(removeFilter({ pageFilterKey, filterKey: filter.filterKey, value: filter.value }));
  };

  // open
  if (open)
    return (
      <div className={clsx(styles.container)} style={style}>
        <div className={clsx(styles.pillContainer)}>
          {activeFilters.map((filter) => {
            return (
              <Pill
                className={'uniqueClassName'}
                label={filter.label}
                selected
                removable
                onRemovePill={handleRemovePill(filter)}
              />
            );
          })}
          {numHidden > 0 && (
            <button className={styles.test} onClick={() => setOpen(false)}>
              <BsChevronDown style={{ transform: 'scaleY(-1)' }} />
            </button>
          )}
        </div>
      </div>
    );

  // closed
  return (
    <div className={clsx(styles.container, styles.closedContainer)} style={style}>
      <div className={clsx(styles.pillContainer)}>
        {activeFilters.map((filter) => {
          return (
            <Pill
              className={'uniqueClassName'}
              label={filter.label}
              selected
              removable
              onRemovePill={handleRemovePill(filter)}
            />
          );
        })}
      </div>
      {numHidden > 0 && (
        <button className={styles.test} onClick={() => setOpen(true)}>
          {`+${numHidden}`}
          <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
        </button>
      )}
    </div>
  );
};

ActiveFilterBox.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
  filterKey: PropTypes.string,
};

export default ActiveFilterBox;

// const FilterCountDropdownButton = ({onClick, numHidden, open}) => {
//   return (
//     <button className={styles.test} onClick={onClick}>
//       {numHidden > 0 && !open && `+${numHidden}`}
//       <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
//     </button>
//   );
// }
