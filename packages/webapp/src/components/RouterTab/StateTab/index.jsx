import PropTypes from 'prop-types';
import { Semibold } from '../../Typography';
import styles from '../styles.module.scss';
import clsx from 'clsx';

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
 *
 * @returns {React.Component} The rendered StateTab component.
 */

export default function StateTab({ tabs, state, setState, className = '' }) {
  const isSelected = (key) => state === key;
  return (
    <div className={clsx(styles.container, className, styles.pill)}>
      {tabs.map((tab, index) => (
        <Semibold
          key={index}
          className={clsx(styles.tab, styles.pill, isSelected(tab.key) && styles.selected)}
          onClick={() => !isSelected(tab.key) && setState(tab.key)}
          id={tab.label + index}
        >
          {tab.label}
        </Semibold>
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
};
