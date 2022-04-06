import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import Pill from '../Filter/Pill';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';
import { useDispatch } from 'react-redux';
import { removeFilter, removeNonFilterValue } from '../../containers/filterSlice';
import { VALID_ON } from '../../containers/Filter/constants';
import { useTranslation } from 'react-i18next';

const ActiveFilterBox = ({ pageFilter, pageFilterKey, style }) => {
  const [firstRow, setFirstRow] = useState(0);
  const [open, setOpen] = useState(false);

  const { t } = useTranslation(['translation', 'filter']);
  const dispatch = useDispatch();

  const activeFilters = Object.keys(pageFilter).reduce((acc, filterKey) => {
    const filter = pageFilter[filterKey];
    const filterType = typeof filter;

    if (filterType === 'object') {
      return [...acc].concat(
        Object.keys(pageFilter[filterKey])
          .filter((k) => pageFilter[filterKey][k].active)
          .map((k) => ({
            filterKey,
            value: k,
            label: pageFilter[filterKey][k].label,
          })),
      );
    }

    if (filterType === 'string') {
      return [
        ...acc,
        {
          filterKey,
          value: pageFilter[filterKey],
          label: `${t(`filter:FILTER.${filterKey}`)}: ${pageFilter[filterKey]}`,
          customRemoveFilter: removeNonFilterValue({ pageFilterKey, filterKey }),
        },
      ];
    }

    return acc;
  }, []);

  const handleResize = () => {
    const elements = document.getElementsByClassName('activePill');
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

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return (_) => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    handleResize();
  }, [activeFilters]);

  const numHidden = activeFilters.length - firstRow;

  const handleRemovePill = (filter) => () => {
    const { filterKey, customRemoveFilter } = filter;
    if (customRemoveFilter) {
      dispatch(customRemoveFilter);
      return;
    }
    dispatch(removeFilter({ pageFilterKey, filterKey, value: filter.value }));
  };

  // open
  if (open)
    return (
      <div className={clsx(styles.container)} style={style}>
        <div className={clsx(styles.pillContainer)}>
          {activeFilters.map((filter) => {
            return (
              <Pill
                key={filter.value}
                className={'activePill'}
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
              key={filter.value}
              className={'activePill'}
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
