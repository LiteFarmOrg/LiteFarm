/* eslint-disable */
/*
 *  Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 *  This file (index.js) is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './styles.module.scss';
import history from '../../history';
import { LocalForm } from 'react-redux-form';
import { FromToDateContainer } from '../../components/Inputs/DateContainer';
import moment from 'moment';
import { getLogs, setEndDate, setSelectedLog, setStartDate } from './actions';
import { getFieldCropsByDate, getLocations } from '../saga';
import { logSelector, startEndDateSelector } from './selectors';
import DropDown from '../../components/Inputs/DropDown';
import Table from '../../components/Table';
import { getDiseases, getPesticides } from './PestControlLog/actions';
import { getFertilizers } from './FertilizingLog/actions';
import InfoBoxComponent from '../../components/InfoBoxComponent';
import { BsCaretRight } from 'react-icons/all';
import { isAdminSelector, userFarmSelector } from '../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../fieldSlice';
import { currentAndPlannedFieldCropsSelector } from '../fieldCropSlice';
import { Label, Semibold, Title } from '../../components/Typography';
import Button from '../../components/Form/Button';

class Log extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activityFilter: 'all',
      cropFilter: 'all',
      fieldFilter: 'all',
    };
    this.filterLogs = this.filterLogs.bind(this);
    this.getEditURL = this.getEditURL.bind(this);
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    const { dispatch } = this.props;
    dispatch(getFieldCropsByDate());
    dispatch(getLocations());
    dispatch(getLogs());
    //TODO fatch userFarm
    dispatch(getPesticides());
    dispatch(getDiseases());
    dispatch(getFertilizers());
  }

  // filter logs in table if an option is chosen from dropdown or date
  filterLogs(logs) {
    const { user } = this.props;
    const { activityFilter, cropFilter, fieldFilter } = this.state;
    let { startDate, endDate } = this.props.dates;
    startDate = moment(startDate);
    endDate = moment(endDate);
    if (logs && logs.length && Object.keys(logs[0]).length > 0 && user && this.props.isAdmin) {
      const checkFilter = (l = [], attribute, constraint) =>
        l[attribute] === constraint || constraint === 'all' || !constraint;
      return logs.filter(
        (l) =>
          checkFilter(l, 'activity_kind', activityFilter) &&
          checkFilter(l.fieldCrop[0], 'crop_id', cropFilter) &&
          checkFilter(l.location[0], 'location_id', fieldFilter) &&
          startDate.isBefore(l.date) &&
          (endDate.isAfter(l.date) || endDate.isSame(l.date, 'day')),
      );
    } else if (
      logs &&
      logs.length &&
      Object.keys(logs[0]).length > 0 &&
      user &&
      !this.props.isAdmin
    ) {
      const checkFilter = (l = [], attribute, constraint) =>
        l[attribute] === constraint || constraint === 'all' || !constraint;
      return logs.filter(
        (l) =>
          checkFilter(l, 'activity_kind', activityFilter) &&
          checkFilter(l.fieldCrop[0], 'crop_id', cropFilter) &&
          checkFilter(l.field[0], 'location_id', fieldFilter) &&
          l.user_id === user.user_id &&
          startDate.isBefore(l.date) &&
          (endDate.isAfter(l.date) || endDate.isSame(l.date, 'day')),
      );
    }
  }
  onStartDateChange(date) {
    this.props.dispatch(setStartDate(date));
  }
  onEndDateChange(date) {
    this.props.dispatch(setEndDate(date));
  }

  getEditURL(activityKind) {
    switch (activityKind) {
      case 'fertilizing':
        return 'fertilizing_log';
      case 'pestControl':
        return 'pest_control_log';
      case 'harvest':
        return 'harvest_log';
      case 'seeding':
        return 'seeding_log';
      case 'fieldWork':
        return 'field_work_log';
      case 'soilData':
        return 'soil_data_log';
      case 'irrigation':
        return 'irrigation_log';
      case 'scouting':
        return 'scouting_log';
      case 'other':
      default:
        return 'other_log';
    }
  }

  render() {
    let { crops, fields, logs } = this.props;

    // data needed to populate dropdowns and tables
    let cropOptions = (crops &&
      crops.map((c) => {
        return { label: this.props.t(`crop:${c.crop_translation_key}`), value: c.crop_id };
      })) || [{ value: '', label: '' }];
    cropOptions.unshift({ value: 'all', label: this.props.t('LOG_COMMON.LOG_ALL_CROPS') });
    let fieldOptions = (fields &&
      fields.map((f) => {
        return { label: f.name, value: f.location_id };
      })) || [{ value: '', label: '' }];
    fieldOptions.unshift({ value: 'all', label: this.props.t('LOG_COMMON.LOG_ALL_FIELDS') });

    const logTypes = [
      { value: 'all', label: this.props.t('LOG_COMMON.ALL') },
      { value: 'fertilizing', label: this.props.t('LOG_COMMON.FERTILIZING') },
      { value: 'pestControl', label: this.props.t('LOG_COMMON.PEST') },
      { value: 'harvest', label: this.props.t('LOG_COMMON.HARVEST') },
      { value: 'seeding', label: this.props.t('LOG_COMMON.SEEDING') },
      { value: 'fieldWork', label: this.props.t('LOG_COMMON.FIELD_WORK') },
      { value: 'soilData', label: this.props.t('LOG_COMMON.SOIL_DATA') },
      { value: 'irrigation', label: this.props.t('LOG_COMMON.IRRIGATION') },
      { value: 'scouting', label: this.props.t('LOG_COMMON.SCOUTING') },
      { value: 'other', label: this.props.t('LOG_COMMON.OTHER') },
    ];

    const logLabels = {
      fertilizing: this.props.t('LOG_COMMON.FERTILIZING'),
      pestControl: this.props.t('LOG_COMMON.PEST'),
      harvest: this.props.t('LOG_COMMON.HARVEST'),
      seeding: this.props.t('LOG_COMMON.SEEDING'),
      fieldWork: this.props.t('LOG_COMMON.FIELD_WORK'),
      soilData: this.props.t('LOG_COMMON.SOIL_DATA'),
      irrigation: this.props.t('LOG_COMMON.IRRIGATION'),
      scouting: this.props.t('LOG_COMMON.SCOUTING'),
      other: this.props.t('LOG_COMMON.OTHER'),
    };

    // columns config for react-table
    const columns = [
      {
        id: 'date',
        Header: this.props.t('LOG_COMMON.DATE'),
        accessor: (d) => moment(d.date).format('YYYY-MM-DD'),
        minWidth: 85,
      },
      {
        id: 'activity_kind',
        Header: this.props.t('LOG_COMMON.ACTIVITY'),
        accessor: (d) => logLabels[d.activity_kind],
        minWidth: 70,
      },
      {
        id: 'crop',
        Header: this.props.t('LOG_COMMON.CROP'),
        accessor: (d) => {
          if (!d.fieldCrop.length) {
            return 'None';
          }
          if (d.fieldCrop.length > 1) {
            return 'Multiple';
          } else {
            return d.fieldCrop.map((fc) => this.props.t(`crop:${fc.crop.crop_translation_key}`));
          }
        },
        minWidth: 70,
      },
      {
        id: 'field',
        Header: this.props.t('common:FIELD'),
        accessor: (d) => {
          if (!d.location.length) {
            return 'None';
          }
          if (d.location.length > 1) {
            return 'Multiple';
          } else {
            return d.location.map((f) => f.name);
          }
        },
        minWidth: 70,
      },
      {
        id: 'arrow-icon',
        Header: '',
        accessor: () => {
          return <BsCaretRight />;
        },
        minWidth: 25,
      },
    ];

    let { startDate, endDate } = this.props.dates;
    startDate = moment(startDate);
    endDate = moment(endDate);

    return (
      <div className={styles.logContainer}>
        <Title>{this.props.t('LOG_COMMON.FARM_LOG')}</Title>
        <hr />
        <Semibold>{this.props.t('LOG_COMMON.ACTION')}</Semibold>
        <div className={styles.buttonContainer}>
          <Button
            onClick={() => {
              history.push('/new_log');
            }}
          >
            {this.props.t('LOG_COMMON.ADD_NEW_LOG')}
          </Button>
        </div>
        <hr />
        <div style={{ marginBottom: '8px' }}>
          <InfoBoxComponent
            customStyle={{ float: 'right', position: 'relative', right: 0 }}
            title={this.props.t('LOG_COMMON.LOG_HELP')}
            body={this.props.t('LOG_COMMON.LOG_HELP_EXPLANATION')}
          />
          <Semibold>{this.props.t('LOG_COMMON.LOG_HISTORY')}</Semibold>
        </div>
        <div>
          <Label>{this.props.t('LOG_COMMON.SEARCH_BY_ACTIVITY')}</Label>
          <DropDown
            defaultValue={{
              value: 'all',
              label: this.props.t('LOG_COMMON.ALL'),
            }}
            options={logTypes}
            onChange={(option) => this.setState({ activityFilter: option.value })}
            isSearchable={false}
            style={{ marginBottom: '24px' }}
          />
          <div style={{ display: 'flex', marginBottom: '16px' }}>
            <DropDown
              className={styles.pullLeft}
              options={cropOptions}
              defaultValue={{
                value: 'all',
                label: this.props.t('LOG_COMMON.ALL_CROPS'),
              }}
              placeholder="Select Crop"
              onChange={(option) => this.setState({ cropFilter: option.value })}
              isSearchable={false}
              style={{ flexBasis: '50%', marginRight: '24px' }}
            />
            <DropDown
              className={styles.pullRight}
              options={fieldOptions}
              defaultValue={{
                value: 'all',
                label: this.props.t('LOG_COMMON.ALL_FIELDS'),
              }}
              placeholder="Select Field"
              onChange={(option) => this.setState({ fieldFilter: option.value })}
              isSearchable={false}
              style={{ flexBasis: '50%' }}
            />
          </div>
          <LocalForm model="logDates">
            <FromToDateContainer
              onEndDateChange={this.onEndDateChange}
              onStartDateChange={this.onStartDateChange}
              startDate={startDate}
              endDate={endDate}
            />
          </LocalForm>
        </div>
        <div className={styles.table}>
          <Table
            columns={columns}
            data={this.filterLogs(logs)}
            showPagination={true}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={10}
            minRows={5}
            className="-striped -highlight"
            defaultSorted={[
              {
                id: 'date',
                desc: true,
              },
            ]}
            getTdProps={(state, rowInfo, column, instance) => {
              return {
                onClick: (e, handleOriginal) => {
                  if (rowInfo && rowInfo.original) {
                    const activityKind = rowInfo.original && rowInfo.original.activity_kind;
                    this.props.dispatch(setSelectedLog(rowInfo.original));
                    const url = this.getEditURL(activityKind);
                    history.push(`/log_detail`);
                  }
                  // IMPORTANT! React-Table uses onClick internally to trigger
                  // events like expanding SubComponents and pivots.
                  // By default a custom 'onClick' handler will override this functionality.
                  // If you want to fire the original onClick handler, call the
                  // 'handleOriginal' function.
                  if (handleOriginal) {
                    handleOriginal();
                  }
                },
              };
            }}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    crops: currentAndPlannedFieldCropsSelector(state),
    fields: fieldsSelector(state),
    logs: logSelector(state),
    user: userFarmSelector(state),
    dates: startEndDateSelector(state),
    isAdmin: isAdminSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Log));
