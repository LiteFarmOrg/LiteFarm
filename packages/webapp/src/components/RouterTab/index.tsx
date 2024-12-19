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
import { useLocation, useNavigate } from 'react-router-dom-v5-compat';
import TabComponent, { BaseTab, TabProps, Variant } from './Tab';

type Tab = BaseTab & {
  path: string;
  state?: string;
};

type RouterTabProps = Omit<TabProps<Tab>, 'onClick' | 'isSelected'>;

export default function RouterTab({ ...props }: RouterTabProps) {
  let navigate = useNavigate();
  let location = useLocation();
  const isSelected = (tab: Tab) => location.pathname?.toLowerCase().includes(tab.path);
  const onClick = (tab: Tab) =>
    !isSelected(tab) && navigate(tab.path, { replace: true, state: tab.state });

  return <TabComponent<Tab> onClick={onClick} isSelected={isSelected} {...props} />;
}

RouterTab.prototype = {
  tabs: PropTypes.shape({
    label: PropTypes.string,
    path: PropTypes.string,
    state: PropTypes.string,
    format: PropTypes.func,
  }),
  classes: PropTypes.object,
  variant: PropTypes.oneOf(Object.values(Variant)),
};
