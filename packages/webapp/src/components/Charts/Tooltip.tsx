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

import type { TooltipProps as RechartsTooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { LineConfig } from './LineChart';
import styles from './styles.module.scss';

export interface TooltipProps extends RechartsTooltipProps<ValueType, NameType> {
  activeLine: LineConfig['id'];
  lineConfig: LineConfig[];
  xAxisFormatter: (label: any) => string | number;
  tooltipValueFormatter?: (label: any, value?: ValueType) => string | number;
}

const Tooltip = ({
  active,
  payload,
  label,
  activeLine,
  lineConfig,
  xAxisFormatter,
  tooltipValueFormatter,
}: TooltipProps) => {
  if (active && payload?.length && activeLine) {
    const data = payload.find(({ dataKey }) => dataKey === activeLine);

    if (data) {
      const { color } = lineConfig.find(({ id }) => id === activeLine)!;

      return (
        <dl className={styles.tooltip} style={{ '--tooltipColor': color } as React.CSSProperties}>
          <dt>{xAxisFormatter(label)}</dt>
          <dd>{tooltipValueFormatter?.(label, data.value) || data.value}</dd>
        </dl>
      );
    }
  }

  return null;
};

export default Tooltip;
