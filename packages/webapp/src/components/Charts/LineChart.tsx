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
import { TFunction, useTranslation } from 'react-i18next';
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
import { isSameDay } from '../../util/date';
import styles from './styles.module.scss';

const convertToMilliseconds = (unixTimestamp: number): number => {
  return unixTimestamp * 1000;
};

const getLocalShortDate = (unixTime: number, language: string, t: TFunction): string => {
  return isSameDay(new Date(), new Date(convertToMilliseconds(unixTime)))
    ? t('common:TODAY')
    : new Intl.DateTimeFormat(language, { month: 'short', day: 'numeric' }).format(
        new Date(convertToMilliseconds(unixTime)),
      );
};

const getTime = (unixTime: number, language: string): string => {
  return new Intl.DateTimeFormat(language, {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(convertToMilliseconds(unixTime)));
};

const getDateTime = (
  dateTime: number,
  language: string,
  truncPeriod: TruncPeriod,
  t: TFunction,
) => {
  const date = getLocalShortDate(dateTime, language, t);
  const time = truncPeriod === 'hour' ? ` ${getTime(dateTime, language)}` : '';

  return `${date}${time}`;
};

const DATE_TIME = 'dateTime';

const axisLabelStyles = {
  stroke: '#2B303A',
  strokeWidth: 1,
  fontFamily: 'Open Sans',
  fontSize: '12px',
  letterSpacing: '0.15px',
};

interface LineConfig {
  id: string;
  color: string;
}

interface CommonProps {
  title?: string;
  lineConfig: LineConfig[];
  formatTooltipValue?: (label: string, value?: ValueType) => string | number;
}

export type TruncPeriod = 'day' | 'hour';

type TimeScaleProps = CommonProps & {
  xAxisDataKey?: 'dateTime';
  data: { dateTime: number; [key: string]: string | number | undefined | null }[];
  language: string;
  startDate?: string;
  endDate?: string;
  ticks?: number[];
  truncPeriod: TruncPeriod;
};

type GeneralScaleProps<T extends string> = CommonProps & {
  xAxisDataKey: T;
  data: Record<T | string, string | number | undefined | null>[];
  ticks?: number[] | string[];
};

function isTimeScaleProps(props: LineChartProps): props is TimeScaleProps {
  return !props.xAxisDataKey || props.xAxisDataKey === DATE_TIME;
}

export type LineChartProps<T extends string = never> = TimeScaleProps | GeneralScaleProps<T>;

function LineChart(props: LineChartProps) {
  const { title, data, lineConfig, ticks, xAxisDataKey = DATE_TIME, formatTooltipValue } = props;
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
          <dl className={styles.tooltip} style={{ '--lineColor': color } as React.CSSProperties}>
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

  return (
    <div className={styles.wrapper}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart width={500} height={230} data={data} margin={{ top: 12 }}>
            <CartesianGrid stroke="#E9F3FF" vertical={false} />
            <XAxis
              dataKey={xAxisDataKey}
              domain={['auto', 'auto']}
              padding={{ left: 38, right: 38 }}
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
                  dot={false}
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
    </div>
  );
}

export default LineChart;
