import React, { Component } from 'react';
import sharedStyles from '../shared.module.scss';
import { Main } from '../../Typography';
import { LinearProgress } from '@material-ui/core';

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
        <LinearProgress value={percent} variant="determinate" />
      </div>
    );
  }
}

export default LabourHappinessTask;
