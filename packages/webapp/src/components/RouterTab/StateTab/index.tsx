import PropTypes from 'prop-types';
import TabComponent, { TabProps } from '../Tab';

type Tab = {
  label: string;
  key: string;
};

type StateTabProps = Omit<TabProps<Tab>, 'onClick' | 'isSelected'> & {
  state: Tab['key'];
  setState: (key: Tab['key']) => void;
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
 *
 * @returns {React.Component} The rendered StateTab component.
 */
export default function StateTab({ state, setState, ...props }: StateTabProps) {
  const isSelected = (tab: Tab) => state === tab.key;
  const onClick = (tab: Tab) => !isSelected(tab) && setState(tab.key);

  return <TabComponent<Tab> onClick={onClick} isSelected={isSelected} {...props} />;
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
