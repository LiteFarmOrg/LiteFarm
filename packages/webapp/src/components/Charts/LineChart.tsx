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

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { DataKey } from 'recharts/types/util/types';
import { Payload } from 'recharts/types/component/DefaultLegendContent';
import { getDateTime, getLocalShortDate } from './utils';
import styles from './styles.module.scss';

interface LineConfig {
  id: string;
  color: string;
}

export type ChartTruncPeriod = 'day' | 'hour';

interface CommonProps {
  title?: string;
  lineConfig: LineConfig[];
  formatTooltipValue?: (label: any, value?: ValueType) => string | number;
  isCompactView?: boolean;
}

type TimeScaleProps = CommonProps & {
  xAxisDataKey?: 'dateTime';
  data: { dateTime: number; [key: string]: string | number | undefined | null }[];
  language: string;
  truncPeriod: ChartTruncPeriod;
  ticks?: number[];
};

type GeneralScaleProps<T extends string> = CommonProps & {
  xAxisDataKey: T;
  data: ({ [K in T]: string | number } & { [key: string]: string | number | undefined | null })[];
  ticks?: number[] | string[];
};

export type LineChartProps<T extends string = never> = TimeScaleProps | GeneralScaleProps<T>;

const DATE_TIME = 'dateTime';

function isTimeScaleProps(props: LineChartProps): props is TimeScaleProps {
  return !props.xAxisDataKey || props.xAxisDataKey === DATE_TIME;
}

const axisLabelStyles = {
  stroke: '#2B303A',
  strokeWidth: 1,
  fontFamily: 'Open Sans',
  fontSize: '12px',
  letterSpacing: '0.15px',
};

/**
 * Renders a responsive line chart using Recharts.
 *
 * Uses the `activeLine` state to override the default Recharts behaviour of displaying
 * tooltips and dots for all x-axis points, ensuring that tooltip values and dots are
 * shown only for the hovered line.
 */
function LineChart(props: LineChartProps) {
  const {
    title,
    data,
    lineConfig,
    ticks,
    xAxisDataKey = DATE_TIME,
    formatTooltipValue,
    isCompactView,
  } = props;

  const { t } = useTranslation('common');

  const [activeLine, setActiveLine] = useState('');
  const [hiddenLines, setHiddenLines] = useState<string[]>([]);

  const showLegend = lineConfig.length > 1;

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload?.length && activeLine) {
      const data = payload.find(({ dataKey }) => dataKey === activeLine);

      if (data) {
        const { color } = lineConfig.find(({ id }) => id === activeLine)!;
        const xAxisData = isTimeScaleProps(props)
          ? getDateTime(label, props.language, props.truncPeriod, t)
          : label;
        const value = formatTooltipValue?.(label, data.value) || data.value;

        return (
          <dl className={styles.tooltip} style={{ '--tooltipColor': color } as React.CSSProperties}>
            <dt>{xAxisData}</dt>
            <dd>{value}</dd>
          </dl>
        );
      }
    }

    return null;
  };

  const onLineMouseOver = (id: string): void => {
    setActiveLine(id);
  };

  const onLineMouseLeave = (): void => {
    setActiveLine('');
  };

  const onLegendClick = (data: Payload & { dataKey?: DataKey<any> }): void => {
    if (typeof data.dataKey === 'string') {
      setHiddenLines(
        hiddenLines.includes(data.dataKey)
          ? hiddenLines.filter((id) => id !== data.dataKey)
          : [...hiddenLines, data.dataKey],
      );
    }
  };

  const xAxisSidePadding = isCompactView ? 16 : 38;

  return (
    <div className={styles.wrapper}>
      {title && <div className={styles.title}>{title}</div>}
      <ResponsiveContainer width="100%" height={showLegend ? 280 : 230}>
        <RechartsLineChart data={data} margin={{ top: 12 }}>
          <CartesianGrid stroke="#E9F3FF" vertical={false} />
          <XAxis
            dataKey={xAxisDataKey}
            domain={['auto', 'auto']}
            padding={{ left: xAxisSidePadding, right: xAxisSidePadding }}
            axisLine={false}
            tick={{ ...axisLabelStyles, transform: 'translate(0, 8)' }}
            tickSize={3}
            tickMargin={6}
            tickLine={{ transform: 'translate(0, 8)' }}
            ticks={ticks}
            {...(isTimeScaleProps(props)
              ? {
                  type: 'number',
                  scale: 'time',
                  tickFormatter: (time) => getLocalShortDate(time, props.language, t),
                }
              : {})}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            tick={axisLabelStyles}
            axisLine={false}
            // Default width is 60, which causes a gap
            // https://github.com/recharts/recharts/issues/2027
            width={40}
          />
          {showLegend && (
            <Legend
              iconType="circle"
              onClick={onLegendClick}
              wrapperStyle={{
                paddingTop: 16,
                paddingBottom: 16,
                fontSize: 12,
                fontWeight: 600,
              }}
            />
          )}
          <Tooltip content={CustomTooltip} cursor={false} />
          {lineConfig.map(({ id, color }) => {
            return (
              <Line
                key={id}
                yAxisId="left"
                type="linear"
                dataKey={id}
                stroke={color}
                strokeWidth={3}
                hide={hiddenLines.includes(id)}
                dot={data.length > 12 ? false : { r: 4 }}
                activeDot={{
                  r: 6,
                  fill: activeLine === id ? color : 'transparent',
                  stroke: activeLine === id ? color : 'transparent',
                  // https://github.com/recharts/recharts/issues/2678
                  onMouseOver: () => onLineMouseOver(id),
                  onMouseLeave: onLineMouseLeave,
                }}
              />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LineChart;
