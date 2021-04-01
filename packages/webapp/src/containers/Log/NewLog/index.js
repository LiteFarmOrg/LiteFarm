import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import PageTitle from '../../../components/PageTitle';
import fertImg from '../../../assets/images/log/fertilizing.png';
import fieldImg from '../../../assets/images/log/field_work.png';
import harvestImg from '../../../assets/images/log/harvest.png';
import pestImg from '../../../assets/images/log/pest.png';
import seedImg from '../../../assets/images/log/seeding.png';
import soilImg from '../../../assets/images/log/soil.png';
import otherImg from '../../../assets/images/log/other.png';
import irrigationImg from '../../../assets/images/log/irrigation.svg';
import history from '../../../history';
import scoutImg from '../../../assets/images/log/scout.svg';
import { withTranslation } from 'react-i18next';
import {
  saveHarvestAllocationWip,
  setDefaultDate,
  setFormData,
  setSelectedUseTypes,
} from '../actions';
import { canEdit, resetHarvestLog } from '../Utility/logSlice';
import { Grid } from '@material-ui/core';

class NewLog extends Component {
  componentDidMount() {
    this.props.dispatch(setDefaultDate(''));
    this.props.dispatch(setFormData({ notes: '', field: {}, crop: {}, quantity_kg: null }));
    this.props.dispatch(setSelectedUseTypes([]));
    this.props.dispatch(saveHarvestAllocationWip({}));
    this.props.dispatch(resetHarvestLog());
    this.props.dispatch(canEdit(false));
  }
  render() {
    return (
      <div className={styles.logContainer}>
        <PageTitle title={this.props.t('LOG_COMMON.NEW_LOG')} backUrl="/log" />
        <h4>{this.props.t('LOG_COMMON.WHAT_LOG')}</h4>
        <Grid
          container
          spacing={3}
          style={{
            marginLeft: 0,
            marginRight: 0,
            marginTop: '24px',
          }}
        >
          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/fertilizing_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={fertImg} alt="" />
              <div>{this.props.t('LOG_COMMON.FERTILIZING')}</div>
            </div>
          </Grid>
          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/pest_control_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={pestImg} alt="" />
              <div>{this.props.t('LOG_COMMON.PEST')}</div>
            </div>
          </Grid>
          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/harvest_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={harvestImg} alt="" />
              <div>{this.props.t('LOG_COMMON.HARVEST')}</div>
            </div>
          </Grid>
          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/seeding_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={seedImg} alt="" />
              <div>{this.props.t('LOG_COMMON.SEEDING')}</div>
            </div>
          </Grid>

          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/field_work_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={fieldImg} alt="" />
              <div>{this.props.t('LOG_COMMON.FIELD_WORK')}</div>
            </div>
          </Grid>
          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/soil_data_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={soilImg} alt="" />
              <div>{this.props.t('LOG_COMMON.SOIL_DATA')}</div>
            </div>
          </Grid>
          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/irrigation_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={irrigationImg} alt="" />
              <div>{this.props.t('LOG_COMMON.IRRIGATION')}</div>
            </div>
          </Grid>
          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/scouting_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={scoutImg} alt="" />
              <div>{this.props.t('LOG_COMMON.SCOUTING')}</div>
            </div>
          </Grid>

          <Grid
            item
            xs={6}
            md={3}
            className={styles.col}
            onClick={() => {
              history.push('/other_log');
            }}
          >
            <div className={styles.typeContainer}>
              <img src={otherImg} alt="" />
              <div>{this.props.t('LOG_COMMON.OTHER')}</div>
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(null, mapDispatchToProps)(withTranslation()(NewLog));
