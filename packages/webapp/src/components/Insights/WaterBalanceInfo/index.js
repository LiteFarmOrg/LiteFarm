import React, {Component} from "react";
import WaterBalanceBarComponent from './WaterBalanceBarComponent/'

class WaterBalanceInfo extends Component {
  render() {
    const fieldData = this.props.field;
    const currentKey = Object.keys(fieldData)[0];
    const title = currentKey.substr(currentKey.indexOf(' ') + 1);
    const cropDataArray = fieldData[currentKey];
    return(
      <div>
        <h4><b>{title}</b></h4>
        {cropDataArray.map((crop, index) => {
          return <div key={'item-crop-' + index}>
            <WaterBalanceBarComponent crop={crop}/>
          </div>
        })}
      </div>
    )
  }
}

export default WaterBalanceInfo
