import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.module.scss';
import CheckBoxPill from '../CheckBoxPill';
import clsx from 'clsx';
import { BsChevronDown } from 'react-icons/bs';
import produce from 'immer';

const FilterPillSelect = ({
  subject,
  filterKey,
  style,
  filterRef,
  shouldReset,
  options = [],
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const defaultFilterState = useMemo(() => {
    return options.reduce((defaultFilterState, option) => {
      defaultFilterState[option.value] = {
        active: option.default,
        label: option.label,
      };
      return defaultFilterState;
    }, {});
  }, []);
  const [filterState, setFilterState] = useState(defaultFilterState);
  const updateFilterState = (value) => {
    setFilterState((filterState) => {
      return produce(filterState, (filterState) => {
        filterState[value].active = !filterState[value].active;
      });
    });
    onChange?.(value);
  };
  const counter = useMemo(
    () =>
      Object.values(filterState).reduce((acc, curr) => {
        return curr.active ? acc + 1 : acc;
      }, 0),
    [filterState],
  );
  useEffect(() => {
    filterRef.current[filterKey] = filterState;
  }, [filterState]);

  useEffect(() => {
    if (shouldReset) {
      const initState = options.reduce((defaultFilterState, option) => {
        defaultFilterState[option.value] = {
          active: false,
          label: option.label,
        };
        return defaultFilterState;
      }, {});
      setFilterState(initState);
    }
  }, [shouldReset]);

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
        {options.map((option) => {
          return (
            <CheckBoxPill
              label={option.label}
              value={option.value}
              checked={filterState[option.value].active}
              updateFilterState={updateFilterState}
              key={option.value}
            />
          );
        })}
      </fieldset>
    </div>
  );
};

FilterPillSelect.prototype = {
  subject: PropTypes.string,
  options: PropTypes.array,
  filterKey: PropTypes.string,
  shouldReset: PropTypes.number,
};

export default FilterPillSelect;
