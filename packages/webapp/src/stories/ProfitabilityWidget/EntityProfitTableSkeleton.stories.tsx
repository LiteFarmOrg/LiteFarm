/*
 *  Copyright 2026 LiteFarm.org
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

import { useState } from 'react';
import { EntityProfitTableSkeleton } from '../../components/ProfitabilityWidget/ProfitabilityWidgetSkeleton';
import { EntityTab } from '../../components/ProfitabilityWidget/constants';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/ProfitabilityWidget/EntityProfitTableSkeleton',
  component: EntityProfitTableSkeleton,
  decorators: componentDecorators,
};

export const Default = {
  render: () => {
    const [tab, setTab] = useState(EntityTab.CROPS);
    return (
      <div>
        <EntityProfitTableSkeleton entityTab={tab} onTabChange={setTab} />
      </div>
    );
  },
};
