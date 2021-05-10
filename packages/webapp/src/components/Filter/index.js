import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import CheckBoxPill from './CheckBoxPill';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';
import { cloneObject } from '../../util';

const Filter = ({ subject, items, filterKey, style, filterRef }) => {
  const [open, setOpen] = useState(false);
  const initFilterState = {};
  for (const item of items) {
    initFilterState[item.value] = item.default;
  }
  const [filterState, setFilterState] = useState(initFilterState);

  const updateFilterState = (value) => {
    setFilterState((prev) => {
      const change = cloneObject(prev);
      change[value] = !prev[value];
      return change;
    });
  };

  useEffect(() => {
    filterRef.current[filterKey] = filterState;
  }, [filterRef, filterState]);

  return (
    <div className={clsx(styles.container, open && styles.openContainer)} style={style}>
      <div className={clsx(styles.head, open && styles.openHead)} onClick={() => setOpen(!open)}>
        <div>{subject}</div>
        <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
      </div>
      <fieldset className={styles.dropdown} style={{ display: open ? 'flex' : 'none' }}>
        {items.map((item) => {
          return (
            <CheckBoxPill
              label={item.label}
              value={item.value}
              checked={filterState[item.value]}
              updateFilterState={updateFilterState}
              key={item.value}
            />
          );
        })}
      </fieldset>
    </div>
  );
};

Filter.prototype = {
  subject: PropTypes.string,
  items: PropTypes.array,
  filterKey: PropTypes.string,
};

export default Filter;
