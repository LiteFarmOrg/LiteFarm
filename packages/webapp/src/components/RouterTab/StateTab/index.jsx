/*
 *  Copyright 2021-2024 LiteFarm.org
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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import PropTypes from 'prop-types';
import styles from '../styles.module.scss';
import clsx from 'clsx';

const VARIANTS = {
  PILL: 'pill',
  PLAIN: 'plain',
};

/**
 * A version of RouterTab that toggles an active tab held in parent state, rather than using path changes.
 *
 * For navigation with path change use RouterTab instead
 *
 * @param {Object[]} props.tabs - An array of tab objects.
 * @param {string} props.tabs.label - The displayed name of the tab.
 * @param {string} props.tabs.key - The unique identifier for each tab.
 * @param {string} props.state - The key corresponding to the currently selected tab.
 * @param {function} props.setState - A function to update the selected tab
 * @param {string} props.className - Optional CSS styling to applied to the tab container
 * @param {('pill'|'plain')} props.variant - Determines the style of the tabs.
 *
 * @returns {React.Component} The rendered StateTab component.
 */

export default function StateTab({
  tabs,
  state,
  setState,
  className = '',
  variant = VARIANTS.PILL,
}) {
  const isSelected = (key) => state === key;
  const variantClassName = styles[variant];

  return (
    <div className={clsx(styles.container, className, variantClassName)}>
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={clsx(styles.tab, isSelected(tab.key) && styles.selected, variantClassName)}
          onClick={() => !isSelected(tab.key) && setState(tab.key)}
          id={tab.label + index}
        >
          <span className={styles.tabText}>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

StateTab.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      key: PropTypes.string.isRequired,
    }),
  ).isRequired,
  state: PropTypes.string.isRequired,
  setState: PropTypes.func.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
};
