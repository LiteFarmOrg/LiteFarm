import React, { Component } from 'react';
import sharedStyles from '../shared.scss';
import { ProgressBar } from 'react-bootstrap';

class InsightsInfoComponent extends Component {
  render() {
    let title = this.props.title;
    let value = this.props.value;
    let valueLabel = this.props.valueLabel;
    let percent = this.props.percent;

    return (
      <div className={'peopleFedItem'}>
        <div>
          <div className={sharedStyles.leftText}>{title}</div>
          <div className={'meals ' + sharedStyles.rightText}>
            {value} {valueLabel}
          </div>
        </div>
        <ProgressBar
          className={sharedStyles.progress}
          bsPrefix={sharedStyles.bar + ' progress-bar'}
          now={percent}
        />
      </div>
    );
  }
}

export default InsightsInfoComponent;
