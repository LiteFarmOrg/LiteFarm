import React, { useState } from 'react';
import styles from './styles.module.scss';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Label, Semibold } from '../Typography';
import PropTypes from 'prop-types';
import { useReadingsLineChat } from './useReadingsLineChat';

const AxisLabel = ({ axisType, x, y, width, height, stroke, children }) => {
  const isVert = axisType === 'yAxis';
  const cx = isVert ? x : x + width / 2;
  const cy = isVert ? height / 2 + y : y + height + 10;
  const rot = isVert ? `270 ${cx} ${cy}` : 0;
  return (
    <text x={cx} y={cy} transform={`rotate(${rot})`} textAnchor="middle" stroke={stroke}>
      {children}
    </text>
  );
};

const ReadingsLineChart = ({
  title = '',
  subTitle = '',
  xAxisDataKey = '',
  xAxisLabel = '',
  yAxisLabel = '',
  locationIds = [],
}) => {
  const [selectedLine, setSelectedLine] = useState(null);
  const { sensorsReadingsOfTemperature, yAxisDataKeys, lineColors } =
    useReadingsLineChat(locationIds);

  const selectLine = (event) => {
    let sl = selectedLine === event.dataKey ? null : event.dataKey.trim();
    setSelectedLine(sl);
  };

  return (
    <>
      <label>
        <Semibold className={styles.title}>{title}</Semibold>
      </label>
      <Label className={styles.subTitle}>{subTitle}</Label>
      <ResponsiveContainer width="100%" height="50%">
        <LineChart
          data={sensorsReadingsOfTemperature}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis
            label={{ value: xAxisLabel, position: 'insideBottom' }}
            dataKey={xAxisDataKey}
            tick={false}
          />
          <YAxis
            label={
              <AxisLabel axisType="yAxis" x={25} y={165} width={0} height={0}>
                {yAxisLabel}
              </AxisLabel>
            }
          />
          <Tooltip />
          {yAxisDataKeys.length > 1 && (
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              wrapperStyle={{ top: 10, left: 50 }}
              onClick={selectLine}
            />
          )}
          {yAxisDataKeys.length &&
            yAxisDataKeys.map((attribute, idx) => (
              <Line
                key={idx}
                strokeWidth={2}
                dataKey={
                  selectedLine === null || selectedLine === attribute ? attribute : `${attribute} `
                }
                stroke={lineColors[idx % lineColors.length]}
                activeDot={{ r: 6 }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

ReadingsLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  xAxisDataKey: PropTypes.string.isRequired,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string.isRequired,
  locationIds: PropTypes.array.isRequired,
};

export default ReadingsLineChart;
