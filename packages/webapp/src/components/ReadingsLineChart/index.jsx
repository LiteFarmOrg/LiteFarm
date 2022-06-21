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

const data = [
  {
    date: '12/12/12',
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    av: 1000,
    amt: 2400,
  },
  {
    date: '12/12/12',
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    av: 1000,
    amt: 2210,
  },
  {
    date: '12/12/12',
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    av: 1000,
    amt: 2290,
  },
  {
    date: '12/12/12',
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    av: 1000,
    amt: 2000,
  },
  {
    date: '12/12/12',
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    av: 1000,
    amt: 2181,
  },
  {
    date: '12/12/12',
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    av: 1000,
    amt: 2500,
  },
  {
    date: '12/12/12',
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    av: 1000,
    amt: 2100,
  },
];

const ReadingsLineCart = ({ yAxisDataKeys = ['pv', 'av'] }) => {
  return (
    <ResponsiveContainer width="50%" height="50%">
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="1 1" />
        <XAxis label={{ value: 'Pages', position: 'insideBottom', offset: -10 }} dataKey="date" />
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
          yAxisDataKeys.map((attribute) => (
            <Line dataKey={attribute} stroke="#8884d8" activeDot={{ r: 8 }} />
          ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

ReadingsLineCart.propTypes = {};

export default ReadingsLineCart;
