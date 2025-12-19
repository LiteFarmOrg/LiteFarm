/*
 *  Copyright 2025 LiteFarm.org
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

import { ComponentType } from 'react';
import history from '../history';
import { History } from 'history';

interface WithNavigationProps {
  component: ComponentType<{ history: History }>;
  [key: string]: any;
}

/**
 * Higher-order component that provides React Router navigation props to class components.
 *
 * This component bridges the gap between modern React Router hooks
 * and legacy class components that cannot use hooks directly.
 *
 * @see https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f?permalink_comment_id=3966559#gistcomment-3966559
 */
const WithNavigation = ({ component: Component, ...props }: WithNavigationProps) => {
  return <Component {...props} history={history} />;
};

export default WithNavigation;
