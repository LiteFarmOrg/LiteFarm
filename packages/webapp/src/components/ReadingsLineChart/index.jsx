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
  Label,
} from 'recharts';

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

const ReadingsLineCart = ({
  yAxisDataKeys = [],
  chartData = [],
  xAxisDataKey = '',
  lineColors = [],
  xAxisLabel = '',
  yAxisLabel = '',
}) => {
  return (
    <ResponsiveContainer width="100%" height="50%">
      <LineChart
        width={1000}
        height={500}
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
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
          />
        )}
        {yAxisDataKeys.length &&
          yAxisDataKeys.map((attribute, idx) => (
            <Line
              key={idx}
              strokeWidth={2}
              dataKey={attribute}
              stroke={lineColors[idx % lineColors.length]}
              activeDot={{ r: 6 }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

ReadingsLineCart.propTypes = {};

export default ReadingsLineCart;
