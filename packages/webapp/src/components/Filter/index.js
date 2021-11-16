import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import CheckBoxPill from './CheckBoxPill';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';
import { cloneObject } from '../../util';

const Filter = ({
  subject,
  items,
  filterKey,
  style,
  filterRef,
  filterState,
  updateFilter,
  counter,
}) => {
  const [open, setOpen] = useState(false);

  const updateFilterState = (value) => {
    updateFilter(filterKey, value);
  };

  useEffect(() => {
    filterRef.current[filterKey] = filterState;
  }, [filterRef, filterState]);

  return (
    <div className={clsx(styles.container, open && styles.openContainer)} style={style}>
      <div className={clsx(styles.head, open && styles.openHead)} onClick={() => setOpen(!open)}>
        <div>{subject}</div>
        {counter > 0 && (
          <>
            <div className={styles.circle} />
            <div style={{ flexGrow: '1' }} />
            <div className={styles.counter}>{`+${counter}`}</div>
          </>
        )}
        <BsChevronDown style={open ? { transform: 'scaleY(-1)' } : {}} />
      </div>
      <fieldset className={styles.dropdown} style={{ display: open ? 'flex' : 'none' }}>
        {items.map((item) => {
          return (
            <CheckBoxPill
              label={item.label}
              value={item.value}
              checked={filterState[item.value].active}
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
