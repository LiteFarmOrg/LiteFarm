import React, {Component} from 'react';
import { ProgressBar} from "react-bootstrap";
import styles from "./styles.scss";
import sharedStyles from "../shared.scss";

class BalanceBarComponent extends Component {
  render() {

    const {value, unit} = this.props;
    const dotStyle = {
      left: (48.5 + value) + '%'
    };
    // const textStyle  = {
    //   textIndent: (45 + value) + '%'
    // };
    return (
      <div>
        <div>
          <div>
            <div>{value} {unit}</div>
            {/*<Glyphicon style={dotStyle} glyph={'glyphicon glyphicon-triangle-bottom'} />*/}
          </div>
          <ProgressBar className={styles.progress} bsPrefix={sharedStyles.bar + ' progress-bar'}/>
        </div>
        <div>
          <div className={styles.leftText}>Deficit</div>
          <div className={styles.rightText}>Surplus</div>
          <div className={styles.centerText}>Good </div>
        </div>
      </div>
    )
  }
}

export default BalanceBarComponent
