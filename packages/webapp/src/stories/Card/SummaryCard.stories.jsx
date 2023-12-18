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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import React from 'react';
import SummaryCard from '../../components/Card/SummaryCard';
import { componentDecorators } from '../Pages/config/Decorators';

export default {
  title: 'Components/SummaryCard',
  component: SummaryCard,
  decorators: componentDecorators,
};

export const Large = {
  args: {
    label: 'My balance',
    data: '$40,500.50',
    size: 'lg',
  },
};

export const Negative = {
  args: {
    color: 'negative',
    label: 'Total expense',
    data: '$40,500.50',
  },
};

export const Positive = {
  args: {
    color: 'positive',
    label: 'Total revenue',
    data: '$40,500.50',
  },
};

export const FinanceSummary = {
  render: () => {
    return (
      <div style={{ maxWidth: 312, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <SummaryCard label="My balance" data="$100,000.00" size="lg" />
        <div style={{ display: 'flex', gap: 16 }}>
          <SummaryCard color="negative" label="Total expense" data="$40,500.50" />
          <SummaryCard color="positive" label="Total revenue" data="$140,500.50" />
        </div>
      </div>
    );
  },
};
