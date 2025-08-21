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

import { ReactNode } from 'react';
import { Redirect } from 'react-router-dom';

interface RequireConditionProps {
  condition: boolean;
  children: ReactNode;
}

// Reference: https://gist.github.com/mjackson/d54b40a094277b7afdd6b81f51a0393f#get-started-upgrading-today
const RequireCondition = ({ condition, children }: RequireConditionProps) => {
  return condition ? children : <Redirect to="/" />;
};

export default RequireCondition;
