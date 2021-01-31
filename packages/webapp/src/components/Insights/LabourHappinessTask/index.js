import React, { Component } from 'react';
import styles from './styles.scss';
import sharedStyles from '../shared.scss';
import { ProgressBar } from 'react-bootstrap';

class LabourHappinessTask extends Component {
  render() {
    let title = this.props.title;
    let mood = this.props.rating;
    let percent = (mood / 5) * 100;

    return (
      <div>
        <div>
          <div className={sharedStyles.leftText}>{title}</div>
          <div className={sharedStyles.rightText}>{mood} / 5</div>
        </div>
        <ProgressBar
          className={sharedStyles.progress}
          bsPrefix={styles.bar + ' progress-bar'}
          now={percent}
        />
      </div>
    );
  }
}

export default LabourHappinessTask;
