import React, { Component } from 'react';
import insightStyles from '../../../../containers/Insights/styles.scss';
import BarBalanceComponent from '../../BalanceBarComponent';

class WaterBalanceBarComponent extends Component {
  render() {
    const cropName = this.props.crop.crop;
    const cropPlantAvailableWater = this.props.crop.plantAvailableWater;
    return (
      <div>
        <hr className={insightStyles.defaultLine} />
        <h4>{cropName}</h4>
        <hr className={insightStyles.defaultLine} />
        <BarBalanceComponent value={cropPlantAvailableWater} unit={'mm'} />
      </div>
    );
  }
}

export default WaterBalanceBarComponent;
