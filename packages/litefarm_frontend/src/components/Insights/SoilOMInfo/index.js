import React, { Component } from 'react';
import sharedStyles from '../shared.scss';
import styles from './styles.scss';
import { ProgressBar } from 'react-bootstrap';
import loadingBar from '../../../assets/images/insights/loading_dot.svg';

class SoilOMInfo extends Component {
  render() {
    let title = this.props.title;
    let percentage = this.props.percentage;
    let loadingButtonStyle = {};
    if (percentage > 100) {
      percentage = 100;
    }
    if (window.innerWidth <= 414 && window.innerHeight <= 812) {
      loadingButtonStyle = {
        marginLeft: percentage - 10 + '%',
        marginTop: '1em',
      };
    } else {
      loadingButtonStyle = {
        marginTop: '1em',
        marginLeft: percentage - 4 + '%',
      };
    }

    return (
      <div>
        <div className={'soilOMTitle'}>
          <h4>
            <b>{title}</b>
          </h4>
        </div>
        <hr className={styles.defaultLine} />
        <div>
          <div style={{ float: 'left' }}>0 %</div>
          <div style={{ float: 'right' }}>10 %</div>
          <img style={loadingButtonStyle} src={loadingBar} alt="not found" />
          <ProgressBar className={styles.progress} now={percentage} label={percentage} />
        </div>
      </div>
    );
  }
}

export default SoilOMInfo;
