import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import styles from './styles.module.scss';
import sharedStyles from '../shared.module.scss';
import { BsCaretDownFill } from 'react-icons/bs';
class BalanceBarComponent extends Component {
  render() {
    const { value, unit } = this.props;
    const dotStyle = {
      left: 48.5 + value + '%',
    };
    // const textStyle  = {
    //   textIndent: (45 + value) + '%'
    // };
    return (
      <div>
        <div>
          <div>
            <div>
              {value} {unit}
            </div>
            <BsCaretDownFill style={dotStyle} />
          </div>
          <ProgressBar className={styles.progress} />
        </div>
        <div>
          <div className={styles.leftText}>Deficit</div>
          <div className={styles.rightText}>Surplus</div>
          <div className={styles.centerText}>Good </div>
        </div>
      </div>
    );
  }
}

export default BalanceBarComponent;
