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

const ReadingsLineCart = ({
  yAxisDataKeys = [],
  chartData = [],
  xAxisDataKey = '',
  lineColors = [],
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
          label={{ value: 'Pages', position: 'insideBottom', offset: -10 }}
          dataKey={xAxisDataKey}
        />
        <YAxis label={{ value: 'Index', angle: -90, position: 'insideLeft' }} />
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
              activeDot={{ r: 8 }}
            />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

ReadingsLineCart.propTypes = {};

export default ReadingsLineCart;
