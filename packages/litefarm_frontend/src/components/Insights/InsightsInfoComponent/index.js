import React, { Component } from 'react';
import sharedStyles from '../shared.scss';
import { ProgressBar } from 'react-bootstrap';
import { Main } from '../../Typography';

class InsightsInfoComponent extends Component {
  render() {
    const { title, value, valueLabel, percent } = this.props;

    return (
      <div className={'peopleFedItem'}>
        <div className={sharedStyles.infoTextLine}>
          <Main>{title}</Main>
          <Main className={sharedStyles.rightText}>{value} {valueLabel}</Main>
        </div>
        <ProgressBar className={sharedStyles.progress} now={percent} />
      </div>
    );
  }
}

export default InsightsInfoComponent;
