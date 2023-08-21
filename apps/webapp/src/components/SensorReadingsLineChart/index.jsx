import React, { useState, useEffect, useRef } from 'react';
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
  ReferenceArea,
} from 'recharts';
import { Semibold } from '../Typography';
import PropTypes from 'prop-types';
import PredictedRect from './PredictedRect';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { SensorReadingChartSpotlightProvider } from './SensorReadingChartSpotlightProvider';
import produce from 'immer';
import { useTranslation } from 'react-i18next';
import useElementWidth from '../hooks/useElementWidth';

const PureSensorReadingsLineChart = ({
  showSpotLight,
  resetSpotlight,
  sensorReadings,
  title,
  subTitle,
  predictedXAxisLabel,
  lastUpdatedReadings,
  xAxisDataKey,
  yAxisDataKeys,
  lineColors,
}) => {
  const { t } = useTranslation();
  const [legendsList, setLegendsList] = useState({});

  const language = getLanguageFromLocalStorage();
  const dateFormat = new Intl.DateTimeFormat(language, { day: '2-digit' });
  const dayFormat = new Intl.DateTimeFormat(language, { weekday: 'short' });

  const chartRef = useRef(null);
  const { elementWidth: chartWidth } = useElementWidth(chartRef);

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
    setLegendsList(
      produce((legends) => {
        const isActive = legends[entry.value].isActive;
        legends[entry.value].isActive = !isActive;
      }),
    );
  };

  const renderCusomizedLegend = ({ payload }) => {
    return (
      <div id="legend" className={styles.legendWrapper}>
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
        <SensorReadingChartSpotlightProvider open={showSpotLight} onFinish={resetSpotlight} />
      </div>
    );
  };

  const renderDateOnXAxis = (tickProps) => {
    const { x, y, payload, index } = tickProps;
    const { value } = payload;
    const tickDate = new Date(value);
    const displayDate = dateFormat.format(tickDate);
    const displayDay = dayFormat.format(tickDate);

    // Hourly datapoints
    if (index % 24 == 12) {
      return (
        <>
          <text x={x} y={y - 16} textAnchor="middle">
            {displayDate}
          </text>
          <text x={x} y={y} textAnchor="middle">
            {displayDay}
          </text>
        </>
      );
    }

    if (index % 24 === 0 && index !== 0) {
      const pathX = Math.floor(x) + 0.5;

      return <path d={`M${pathX},${y - 22}v${-16}`} stroke="black" />;
    }
    return null;
  };

  const dateTickFormatter = (tick) => {
    const newTick = new String(tick);
    let tickArr = newTick.split(' ');
    tickArr = tickArr.slice(0, -1);
    return tickArr.join(' ');
  };

  // Returns density of specified data in datapoints / hour
  const dataDensity = (data, sensorName) => {
    const validDatapoints = data.filter((datapoint) => typeof datapoint[sensorName] === 'number');

    if (validDatapoints?.length <= 1) return 0; // one or no datapoints

    const firstTimestamp = new Date(validDatapoints[0]?.current_date_time);
    const lastTimestamp = new Date(validDatapoints[validDatapoints.length - 1]?.current_date_time);

    const totalIntervalinHours = (lastTimestamp - firstTimestamp) / (1000 * 60 * 60);

    return (validDatapoints.length - 1) / totalIntervalinHours;
  };

  return (
    <>
      <div className={styles.titleWrapper} ref={chartRef}>
        <label>
          <Semibold className={styles.title}>{title}</Semibold>
          <Semibold className={styles.subTitle}>{subTitle}</Semibold>
        </label>
        {lastUpdatedReadings && (
          <label>
            <Semibold className={styles.titleLastUpdated}>
              {t('SENSOR.LAST_UPDATED', {
                latestReadingUpdate: lastUpdatedReadings,
              })}
            </Semibold>
          </label>
        )}
      </div>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart
          data={sensorReadings}
          margin={{
            top: 20,
            right: 10,
            left: -30,
            bottom: 20,
          }}
        >
          <pattern
            id="pattern-stripe"
            width="8"
            height="4"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="2" height="2" transform="translate(0,0)" fill="white"></rect>
          </pattern>
          <mask id="mask-stripe">
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-stripe)" />
          </mask>
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis dataKey={xAxisDataKey} tick={false} tickFormatter={dateTickFormatter} />
          <XAxis
            dataKey={xAxisDataKey}
            axisLine={false}
            tickLine={false}
            interval={0}
            tick={renderDateOnXAxis}
            height={1}
            xAxisId="quarter"
          />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            payload={Object.values(legendsList)}
            content={renderCusomizedLegend}
          />
          {yAxisDataKeys.length &&
            Object.values(legendsList)
              .filter((l) => l.isActive)
              .map((attribute, idx) => (
                <Line
                  key={idx}
                  strokeWidth={2}
                  dataKey={attribute.value}
                  stroke={attribute.color}
                  isAnimationActive={false}
                  activeDot={{ r: 5 }}
                  dot={dataDensity(sensorReadings, attribute.value) < 0.9}
                  type={
                    dataDensity(sensorReadings, attribute.value) >= 0.9 ||
                    (chartWidth < 400 && dataDensity(sensorReadings, attribute.value) > 0.5)
                      ? 'natural'
                      : 'linear'
                  }
                  connectNulls
                />
              ))}
          <ReferenceArea fill={'#EBECED'} shape={<PredictedRect />} x1={predictedXAxisLabel} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

PureSensorReadingsLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string,
  lastUpdatedReadings: PropTypes.string,
  predictedXAxisLabel: PropTypes.string.isRequired,
  yAxisDataKeys: PropTypes.array.isRequired,
  lineColors: PropTypes.array.isRequired,
  xAxisDataKey: PropTypes.string.isRequired,
  sensorReadings: PropTypes.array.isRequired,
};

export default PureSensorReadingsLineChart;
