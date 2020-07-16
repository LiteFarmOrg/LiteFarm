import React, { Component } from "react";
import ReactChartKick, {AreaChart} from 'react-chartkick';
import Chart from 'chart.js';
import { roundToTwoDecimal } from "../../../util";

ReactChartKick.addAdapter(Chart);

class PriceCropContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      max: 0,
      ownPriceSeries: {},
      networkPriceSeries: {},
    };

    this.formatState = this.formatState.bind(this);
  }

  formatState() {
    const { pricePoints } = this.props;
    const ownPriceSeries = {};
    const networkPriceSeries = {};

    pricePoints.forEach((pricePoint, index) => {
      // Clean data: format crop_date into YY-MM-DD and round prices to two decimal places
      ownPriceSeries[[pricePoint['crop_date'] + '-01']] = roundToTwoDecimal(pricePoint['crop_price']);
      networkPriceSeries[[pricePoint['crop_date'] + '-01']] = roundToTwoDecimal(pricePoint['network_price']);
    });

    // Find max datapoint across the two datasets for styling chart
    const ownPriceDataPoints = Object.values(ownPriceSeries);
    const networkPriceDataPoints = Object.values(networkPriceSeries);
    const allDataPoints = ownPriceDataPoints.concat(networkPriceDataPoints);
    const maxDataPoint = allDataPoints.reduce((a, b) => Math.max(a, b));

    this.setState({
      ownPriceSeries,
      networkPriceSeries,
      max: maxDataPoint,
    });
  };

  componentDidMount() {
    this.formatState();
  }

  render() {
    const { ownPriceSeries, networkPriceSeries } = this.state;
    const { currencySymbol, name } = this.props;
    const yTitle = `Price (${currencySymbol}/kg)`;

    return (
      <div>
        <h4>
          <b>{name}</b>
        </h4>
        <div>
          <AreaChart
            messages={{ empty: "Not data" }}
            width="95%"
            height="85%"
            ytitle={yTitle}
            max={this.state.max}
            library={{
              scales: {
                xAxes: [{
                  type: 'time',
                  time: {
                    unit: 'month',
                  },
                }],
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
        <hr/>
      </div>
    )
  }
}

export default PriceCropContainer
