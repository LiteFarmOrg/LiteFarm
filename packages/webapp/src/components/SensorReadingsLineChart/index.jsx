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
  ReferenceArea,
} from 'recharts';
import { Label, Semibold } from '../Typography';
import PropTypes from 'prop-types';
import PredictedRect from './PredictedRect';
import { getLanguageFromLocalStorage } from '../../util/getLanguageFromLocalStorage';
import { SensorReadingChartSpotlightProvider } from './SensorReadingChartSpotlightProvider';
import { TEMPERATURE } from '../../containers/SensorReadings/constants';
import produce from 'immer';

const PureSensorReadingsLineChart = ({
  showSpotLight,
  resetSpotlight,
  title,
  subTitle,
  xAxisDataKey,
  yAxisDataKeys,
  lineColors,
  xAxisLabel,
  yAxisLabel,
  chartData,
  weatherStationName,
  lastUpdatedReadings,
  predictedXAxisLabel,
  isReadingTypeActive,
  readingType,
}) => {
  const [legendsList, setLegendsList] = useState({});

  const language = getLanguageFromLocalStorage();
  const dateFormat = new Intl.DateTimeFormat(language, { day: '2-digit' });
  const dayFormat = new Intl.DateTimeFormat(language, { weekday: 'short' });

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
    const { value, offset } = payload;
    const tickDate = new Date(value);
    const displayDate = dateFormat.format(tickDate);
    const displayDay = dayFormat.format(tickDate);

    if (index % 4 == 2) {
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
    if (index % 4 === 0 && index !== 0) {
      const pathX = Math.floor(x + offset) + 0.5;
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

  return (
    <>
      {isReadingTypeActive ? (
        <>
          <div className={styles.titleWrapper}>
            <label>
              <Semibold className={styles.title}>{title}</Semibold>
            </label>
            <label>
              <Semibold className={styles.titleLastUpdated}>{lastUpdatedReadings}</Semibold>
            </label>
          </div>
          {readingType === TEMPERATURE && (
            <>
              <Label className={styles.subTitle}>{subTitle}</Label>
              <Label className={styles.subTitle}>{weatherStationName}</Label>
            </>
          )}
          <ResponsiveContainer width="100%" height={380}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
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
                label={{ value: xAxisLabel, position: 'insideBottom', dy: 45 }}
                dataKey={xAxisDataKey}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={renderDateOnXAxis}
                height={1}
                scale="band"
                xAxisId="quarter"
              />
              <YAxis
                domain={['auto', 'auto']}
                label={{ value: yAxisLabel, position: 'insideCenter', angle: -90, dx: -20 }}
              />
              <Tooltip />
              <Legend
                layout="horizontal"
                verticalAlign="top"
                align="center"
                wrapperStyle={{ top: 10, left: 50 }}
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
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  ))}
              <ReferenceArea fill={'#EBECED'} shape={<PredictedRect />} x1={predictedXAxisLabel} />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <></>
      )}
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
  weatherStationName: PropTypes.string.isRequired,
  lastUpdatedReadings: PropTypes.string.isRequired,
  predictedXAxisLabel: PropTypes.string.isRequired,
  isReadingTypeActive: PropTypes.bool.isRequired,
  readingType: PropTypes.string.isRequired,
};

export default PureSensorReadingsLineChart;
