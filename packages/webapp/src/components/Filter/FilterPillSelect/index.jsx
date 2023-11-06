/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://wwwl.gnu.org/licenses/>.
 */

import clsx from 'clsx';
import produce from 'immer';
import PropTypes, { string } from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import CheckBoxPill from '../CheckBoxPill';
import FilterControls from '../FilterControls';
import styles from './styles.module.scss';

const FilterPillSelect = ({
  subject,
  filterKey,
  style,
  filterRef,
  shouldReset,
  options = [],
  onChange,
  isDisabled = false,
  className,
  showIndividualControls = false,
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

  const updateAllFilters = useCallback(
    (active) => {
      const initState = options.reduce((defaultFilterState, option) => {
        defaultFilterState[option.value] = {
          active,
          label: option.label,
        };
        return defaultFilterState;
      }, {});
      setFilterState(initState);
      onChange?.();
    },
    [options, defaultFilterState],
  );

  useEffect(() => {
    if (shouldReset) {
      updateAllFilters(false);
    }
  }, [shouldReset, updateAllFilters]);

  const selectAllDisabled = useMemo(
    () => !options.some((option) => !filterState[option.value]?.active),
    [options, filterState],
  );
  const clearAllDisabled = useMemo(
    () => !options.some((option) => filterState[option.value]?.active),
    [options, filterState],
  );

  return (
    <>
      <div
        className={clsx(styles.container, open && styles.openContainer, className)}
        style={style}
      >
        <div
          className={clsx(styles.head, open && styles.openHead, isDisabled && styles.disabled)}
          onClick={isDisabled ? null : () => setOpen(!open)}
        >
          <div>{subject}</div>
          {counter > 0 && (
            <>
              <div className={styles.circle} />
              <div style={{ flexGrow: '1' }} />
              <div className={styles.counter}>{`${counter}`}</div>
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
                isDisabled={isDisabled}
              />
            );
          })}
        </fieldset>
      </div>
      {showIndividualControls && (
        <FilterControls
          updateFilters={updateAllFilters}
          selectAllDisabled={selectAllDisabled}
          clearAllDisabled={clearAllDisabled}
        />
      )}
    </>
  );
};

FilterPillSelect.prototype = {
  subject: PropTypes.string,
  options: PropTypes.array,
  filterKey: PropTypes.string,
  shouldReset: PropTypes.number,
  showIndividualControls: PropTypes.bool,
  className: string,
};

FilterPillSelect.defaultProps = {
  showIndividualControls: false,
};

export default FilterPillSelect;
