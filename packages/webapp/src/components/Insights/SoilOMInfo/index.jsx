import React, { Component } from 'react';
import styles from './styles.module.scss';
import loadingBar from '../../../assets/images/insights/loading_dot.svg';
import { LinearProgress } from '@material-ui/core';
import { Info } from '../../Typography';

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
          <div style={{ display: 'inline-flex', gap: '8px' }}>
            <div style={{ flexGrow: 1 }}>
              <LinearProgress value={percentage} variant="determinate" />
            </div>
            <Info>{percentage}</Info>
          </div>
        </div>
      </div>
    );
  }
}

export default SoilOMInfo;
