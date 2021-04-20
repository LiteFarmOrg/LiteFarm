import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import PageTitle from '../../../components/PageTitle';
import history from '../../../history';
import { ReactComponent as Fertilize } from '../../../assets/images/log/v2/Fertilize.svg';
import { ReactComponent as FieldWork } from '../../../assets/images/log/v2/FieldWork.svg';
import { ReactComponent as PestControl } from '../../../assets/images/log/v2/PestControl.svg';
import { ReactComponent as Harvest } from '../../../assets/images/log/v2/Harvest.svg';
import { ReactComponent as Seeding } from '../../../assets/images/log/v2/Seeding.svg';
import { ReactComponent as SoilSample } from '../../../assets/images/log/v2/SoilSample.svg';
import { ReactComponent as Irrigate } from '../../../assets/images/log/v2/Irrigate.svg';
import { ReactComponent as Scout } from '../../../assets/images/log/v2/Scout.svg';
import { ReactComponent as Other } from '../../../assets/images/log/v2/Other.svg';
import { withTranslation } from 'react-i18next';
import {
  saveHarvestAllocationWip,
  setDefaultDate,
  setFormData,
  setSelectedUseTypes,
} from '../actions';
import { canEdit, resetHarvestLog } from '../Utility/logSlice';
import { div } from '@material-ui/core';
import { Main } from '../../../components/Typography';

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
        <PageTitle title={this.props.t('LOG_COMMON.ADD_A_LOG')} backUrl="/log" />
        <Main style={{ paddingBottom: '16px' }}>{this.props.t('LOG_COMMON.SELECT_TASK')}</Main>
        <div className={styles.tileContainer}>
          <div
            className={styles.col}
            onClick={() => {
              history.push('/fertilizing_log');
            }}
          >
            <div className={styles.typeContainer}>
              <Fertilize />
              <div>{this.props.t('LOG_COMMON.FERTILIZING')}</div>
            </div>
          </div>
          <div
            className={styles.col}
            onClick={() => {
              history.push('/pest_control_log');
            }}
          >
            <div className={styles.typeContainer}>
              <PestControl />
              <div>{this.props.t('LOG_COMMON.PEST')}</div>
            </div>
          </div>
          <div
            className={styles.col}
            onClick={() => {
              history.push('/harvest_log');
            }}
          >
            <div className={styles.typeContainer}>
              <Harvest />
              <div>{this.props.t('LOG_COMMON.HARVEST')}</div>
            </div>
          </div>
          <div
            className={styles.col}
            onClick={() => {
              history.push('/seeding_log');
            }}
          >
            <div className={styles.typeContainer}>
              <Seeding />
              <div>{this.props.t('LOG_COMMON.SEEDING')}</div>
            </div>
          </div>

          <div
            className={styles.col}
            onClick={() => {
              history.push('/field_work_log');
            }}
          >
            <div className={styles.typeContainer}>
              <FieldWork />
              <div>{this.props.t('LOG_COMMON.FIELD_WORK')}</div>
            </div>
          </div>
          <div
            className={styles.col}
            onClick={() => {
              history.push('/soil_data_log');
            }}
          >
            <div className={styles.typeContainer}>
              <SoilSample />
              <div>{this.props.t('LOG_COMMON.SOIL_DATA')}</div>
            </div>
          </div>
          <div
            className={styles.col}
            onClick={() => {
              history.push('/irrigation_log');
            }}
          >
            <div className={styles.typeContainer}>
              <Irrigate />
              <div>{this.props.t('LOG_COMMON.IRRIGATION')}</div>
            </div>
          </div>
          <div
            className={styles.col}
            onClick={() => {
              history.push('/scouting_log');
            }}
          >
            <div className={styles.typeContainer}>
              <Scout />
              <div>{this.props.t('LOG_COMMON.SCOUTING')}</div>
            </div>
          </div>

          <div
            className={styles.col}
            onClick={() => {
              history.push('/other_log');
            }}
          >
            <div className={styles.typeContainer}>
              <Other />
              <div>{this.props.t('LOG_COMMON.OTHER')}</div>
            </div>
          </div>
        </div>
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
