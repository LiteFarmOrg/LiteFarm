import React, {Component} from "react";
import insightStyles from '../../../containers/Insights/styles.scss';
import BarBalanceComponent from '../BalanceBarComponent';

class NitrogenBalanceInfo extends Component {
  render() {
    const currentField = this.props.field;
    const currentKey = Object.keys(currentField)[0];
    const title = currentKey.substr(currentKey.indexOf(' ') + 1);
    const value = currentField[currentKey];

    return(
      <div>
        <h4><b>{title}</b></h4>
        <hr className={insightStyles.defaultLine} />
        <BarBalanceComponent value={value} unit={'kg'}/>
        <hr />
      </div>
    )
  }
}

export default NitrogenBalanceInfo
