import PropTypes from 'prop-types';
import { History } from 'history';
import TabComponent, { BaseTab, TabProps, VARIANTS } from './Tab';

type Tab = BaseTab & {
  path: string;
  state?: string;
};

type RouterTabProps = Omit<TabProps<Tab>, 'onClick' | 'isSelected'> & { history: History };

export default function RouterTab({ history, ...props }: RouterTabProps) {
  const isSelected = (tab: Tab) => history.location.pathname?.toLowerCase().includes(tab.path);
  const onClick = (tab: Tab) => !isSelected(tab) && history.replace(tab.path, tab.state);

  return <TabComponent<Tab> onClick={onClick} isSelected={isSelected} {...props} />;
}

RouterTab.prototype = {
  tabs: PropTypes.shape({
    label: PropTypes.string,
    path: PropTypes.string,
    state: PropTypes.string,
  }),
  history: PropTypes.object,
  classes: PropTypes.object,
  variant: PropTypes.oneOf(Object.values(VARIANTS)),
};
