import React, { useState, useEffect } from 'react';
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
  Surface,
  Symbols,
} from 'recharts';
import { Label, Semibold } from '../Typography';
import PropTypes from 'prop-types';
import AxisLabel from './AxisLabel';

const PureSensorReadingsLineChart = ({
  title,
  subTitle,
  xAxisDataKey,
  yAxisDataKeys,
  lineColors,
  xAxisLabel,
  yAxisLabel,
  chartData,
}) => {
  const [legendsList, setLegendsList] = useState({});

  useEffect(() => {
    if (yAxisDataKeys.length) {
      setLegendsList(
        yAxisDataKeys.reduce((acc, cv, idx) => {
          acc[cv] = {
            id: cv,
            value: cv,
            color: lineColors[idx % lineColors.length],
            isActive: true,
          };
          return acc;
        }, {}),
      );
    }
  }, [yAxisDataKeys]);

  const handleLegendClick = (entry) => {
    setLegendsList((legends) => {
      const activeCount = Object.values(legends).filter((l) => l.isActive).length;
      const isActive = legends[entry.value].isActive;
      if ((activeCount > 1 && isActive) || (activeCount >= 1 && !isActive)) {
        legends[entry.value].isActive = !isActive;
      }
      return { ...legends };
    });
  };

  const renderCusomizedLegend = ({ payload }) => {
    return (
      <div className={styles.legendWrapper}>
        {payload.map((entry, idx) => {
          const { value = '', color = '', isActive = true } = entry;
          const style = {
            color: !isActive ? '#AAA' : '#000',
            display: 'flex',
            alignItems: 'center',
          };
          return (
            <div
              style={style}
              key={idx}
              onClick={() => handleLegendClick(entry)}
              className={styles.legendContainer}
            >
              <Surface style={{ marginTop: '2px' }} width={10} height={10}>
                <Symbols cx={5} cy={5} type="circle" size={50} fill={color} />
                {!isActive && <Symbols cx={5} cy={5} type="circle" size={25} fill={'#FFF'} />}
              </Surface>
              <span style={{ marginLeft: '4px' }}>{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <label>
        <Semibold className={styles.title}>{title}</Semibold>
      </label>
      <Label className={styles.subTitle}>{subTitle}</Label>
      <ResponsiveContainer width="100%" height="50%">
        <LineChart
          data={chartData}
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
              payload={Object.values(legendsList)}
              content={renderCusomizedLegend}
            />
          )}
          {yAxisDataKeys.length &&
            Object.values(legendsList)
              .filter((l) => l.isActive)
              .map((attribute, idx) => (
                <Line
                  key={idx}
                  strokeWidth={2}
                  dataKey={attribute.value}
                  stroke={attribute.color}
                  activeDot={{ r: 6 }}
                  isAnimationActive={false}
                />
              ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

PureSensorReadingsLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  xAxisDataKey: PropTypes.string.isRequired,
  yAxisDataKeys: PropTypes.array.isRequired,
  lineColors: PropTypes.array.isRequired,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string.isRequired,
  chartData: PropTypes.array.isRequired,
};

export default PureSensorReadingsLineChart;
