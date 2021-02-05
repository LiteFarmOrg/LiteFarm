import React, { Component } from 'react';
import styles from './styles.scss';
import sharedStyles from '../shared.scss';
import { ProgressBar } from 'react-bootstrap';
import { Main } from '../../Typography';

class LabourHappinessTask extends Component {
  render() {
    let title = this.props.title;
    let mood = this.props.rating;
    let percent = (mood / 5) * 100;

    return (
      <div>
        <div className={sharedStyles.infoTextLine}>
          <Main>{title}</Main>
          <Main className={sharedStyles.rightText}>{`${mood} / 5`}</Main>
        </div>
        <ProgressBar className={sharedStyles.progress} now={percent} />
      </div>
    );
  }
}

export default LabourHappinessTask;
