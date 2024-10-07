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
