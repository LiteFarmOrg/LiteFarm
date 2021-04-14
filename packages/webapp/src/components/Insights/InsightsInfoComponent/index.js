import React, { Component } from 'react';
import sharedStyles from '../shared.module.scss';
import { Main } from '../../Typography';
import { LinearProgress } from '@material-ui/core';

class InsightsInfoComponent extends Component {
  render() {
    const { title, value, valueLabel, percent } = this.props;

    return (
      <div className={'peopleFedItem'}>
        <div className={sharedStyles.infoTextLine}>
          <Main>{title}</Main>
          <Main className={sharedStyles.rightText}>
            {value} {valueLabel}
          </Main>
        </div>

        <LinearProgress value={percent} variant="determinate" />
      </div>
    );
  }
}

export default InsightsInfoComponent;
