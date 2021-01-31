import React, { Component } from 'react';
import sharedStyles from '../shared.scss';
import { ProgressBar } from 'react-bootstrap';

class BiodiversitySpecies extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const currSpecies = this.props.species;
    const currCount = this.props.count;
    const percent = this.props.percent;
    return (
      <div>
        <div className={sharedStyles.leftText}>{currSpecies}</div>
        <div className={sharedStyles.rightText}>{currCount} species</div>
        <ProgressBar
          className={sharedStyles.progress}
          bsPrefix={sharedStyles.bar + ' progress-bar'}
          now={percent}
        />
      </div>
    );
  }
}

export default BiodiversitySpecies;
