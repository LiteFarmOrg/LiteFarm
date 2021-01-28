import React, { Component, useState } from 'react';
import ReactChartKick, { AreaChart } from 'react-chartkick';
import Chart from 'chart.js';
import { getMassUnit, roundToTwoDecimal } from '../../../util';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../../containers/userFarmSlice';

ReactChartKick.addAdapter(Chart);

function PriceCropContainer({ currencySymbol, name, pricePoints }) {
  const [state, setState] = useState({
    max: 0,
    ownPriceSeries: {},
    networkPriceSeries: {},
  });

  const {
    units: { measurement },
  } = useSelector(userFarmSelector);

  const formatState = () => {
    const ownPriceSeries = {};
    const networkPriceSeries = {};

    pricePoints.forEach((pricePoint, index) => {
      // Clean data: format crop_date into YY-MM-DD and round prices to two decimal places
      ownPriceSeries[[pricePoint['crop_date'] + '-01']] = roundToTwoDecimal(
        pricePoint['crop_price'] / (measurement === 'metric' ? 1 : 2.20462),
      );
      networkPriceSeries[[pricePoint['crop_date'] + '-01']] = roundToTwoDecimal(
        pricePoint['network_price'] / (measurement === 'metric' ? 1 : 2.20462),
      );
    });

    // Find max datapoint across the two datasets for styling chart
    const ownPriceDataPoints = Object.values(ownPriceSeries);
    const networkPriceDataPoints = Object.values(networkPriceSeries);
    const allDataPoints = ownPriceDataPoints.concat(networkPriceDataPoints);
    const maxDataPoint = allDataPoints.reduce((a, b) => Math.max(a, b));

    setState({
      ownPriceSeries,
      networkPriceSeries,
      max: maxDataPoint,
    });
  };

  useState(() => formatState(), []);

  const { ownPriceSeries, networkPriceSeries, max } = state;

  const yTitle = `Price (${currencySymbol}/${getMassUnit()})`;

  return (
    <div style={{ marginBottom: '12px' }}>
      <h4>
        <b>{name}</b>
      </h4>
      <div>
        <AreaChart
          messages={{ empty: 'Not data' }}
          width="95%"
          height="85%"
          ytitle={yTitle}
          max={max}
          library={{
            scales: {
              xAxes: [
                {
                  type: 'time',
                  time: {
                    unit: 'month',
                  },
                },
              ],
            },
          }}
          data={[
            {
              name: 'Own Price',
              data: ownPriceSeries,
              dataset: {
                backgroundColor: 'rgba(51, 102, 204, 0.4)',
              },
            },
            {
              name: 'Network Price',
              data: networkPriceSeries,
              dataset: {
                backgroundColor: 'rgba(220, 57, 18, 0.4)',
              },
            },
          ]}
        />
      </div>
    </div>
  );
}

export default PriceCropContainer;
