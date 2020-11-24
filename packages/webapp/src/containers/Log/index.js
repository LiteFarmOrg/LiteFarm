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
import styles from './styles.scss';
import { Button } from 'react-bootstrap';
import history from '../../history';
import { LocalForm } from 'react-redux-form';
import DateContainer from '../../components/Inputs/DateContainer';
import moment from 'moment';
import { getLogs, setSelectedLog } from './actions';
import { getFieldCropsByDate } from '../actions';
import { logSelector } from './selectors';
import { cropSelector, } from '../selector';
import DropDown from '../../components/Inputs/DropDown';
import Table from '../../components/Table';
import { getDiseases, getPesticides } from './PestControlLog/actions';
import { getFertilizers } from './FertilizingLog/actions';
import InfoBoxComponent from '../../components/InfoBoxComponent';
import { BsCaretRight } from 'react-icons/all';
import { userFarmSelector } from '../userFarmSlice';
import { getFields } from '../saga';
import { fieldsSelector } from '../fieldSlice';


class Log extends Component{
  constructor(props) {
    super(props);
    this.state = {
      activityFilter: 'all',
      cropFilter: 'all',
      fieldFilter: 'all',
      startDate: moment().startOf('year'),
      endDate: moment().endOf('year'),
    };
    this.filterLogs = this.filterLogs.bind(this);
    this.getEditURL = this.getEditURL.bind(this);
    const { dispatch } = this.props;
    dispatch(getFieldCropsByDate());
    dispatch(getFields());
    dispatch(getLogs());
    //TODO fatch userFarm
    dispatch(getPesticides());
    dispatch(getDiseases());
    dispatch(getFertilizers());
  }

  // filter logs in table if an option is chosen from dropdown or date
  filterLogs(logs) {
    const {user} = this.props;
    if(logs && logs.length && Object.keys(logs[0]).length>0 && user && user.is_admin){
      const { activityFilter, cropFilter, fieldFilter, startDate, endDate } = this.state;
      const checkFilter = (l = [], attribute, constraint) => l[attribute] === constraint || constraint === 'all' || !constraint;
      return logs.filter((l) => checkFilter(l, 'activity_kind', activityFilter) && checkFilter(l.fieldCrop[0], 'crop_id', cropFilter) && checkFilter(l.field[0], 'field_id', fieldFilter)
        && startDate.isBefore(l.date) && (endDate.isAfter(l.date) || endDate.isSame(l.date, 'day')));
    }else if (logs && logs.length && Object.keys(logs[0]).length>0 && user && !user.is_admin){
      const { activityFilter, cropFilter, fieldFilter, startDate, endDate } = this.state;
      const checkFilter = (l = [], attribute, constraint) => l[attribute] === constraint || constraint === 'all' || !constraint;
      return logs.filter((l) => checkFilter(l, 'activity_kind', activityFilter) && checkFilter(l.fieldCrop[0], 'crop_id', cropFilter) && checkFilter(l.field[0], 'field_id', fieldFilter)
        && l.user_id === user.user_id
        && startDate.isBefore(l.date) && (endDate.isAfter(l.date) || endDate.isSame(l.date, 'day')));
    }
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

  render(){
    let { crops, fields, logs } = this.props;

    // data needed to populate dropdowns and tables
    let cropOptions = (crops && crops.map((c) => { return { label: c.crop_common_name, value: c.crop_id }} )) || [{ value: '', label: ''}];
    cropOptions.unshift({ value: 'all', label: 'All Crops'});
    let fieldOptions = (fields && fields.map((f) => { return { label: f.field_name, value: f.field_id }} )) || [{ value: '', label: ''}];
    fieldOptions.unshift({ value: 'all', label: 'All Fields'});

    const logTypes = [
      { value: 'all', label: 'All' },
      { value: 'fertilizing', label: 'Fertilizing' },
      { value: 'pestControl', label: 'Pest Control' },
      { value: 'harvest', label: 'Harvest' },
      { value: 'seeding', label: 'Seeding' },
      { value: 'fieldWork', label: 'Field Work' },
      { value: 'soilData', label: 'Soil Data' },
      { value: 'irrigation', label: 'Irrigation' },
      { value: 'scouting', label: 'Scouting' },
      { value: 'other', label: 'Other' }
    ];

    const logLabels = {
      'fertilizing': 'Fertilizing',
      'pestControl': 'Pest Control',
      'harvest': 'Harvest',
      'seeding': 'Seeding',
      'fieldWork': 'Field Work',
      'soilData': 'Soil Data',
      'irrigation': 'Irrigation',
      'scouting': 'Scouting',
      'other': 'Other'
    };

    // columns config for react-table
    const columns = [{
      id: 'date',
      Header: 'Date',
      accessor: d => moment(d.date).format('YYYY-MM-DD'),
      minWidth: 85
    }, {
      id: 'activity_kind',
      Header: 'Activity',
      accessor: d => logLabels[d.activity_kind],
      minWidth: 70
    }, {
      id: 'crop',
      Header: 'Crop',
      accessor: d => {
        if (!d.fieldCrop.length) {
          return 'None'
        }
        if (d.fieldCrop.length > 1) {
          return 'Multiple'
        } else {
          return d.fieldCrop.map((fc) => fc.crop.crop_common_name);
        }
      },
        minWidth: 70,
    }, {
      id: 'field',
      Header: 'Field',
      accessor: d => {
        if (!d.field.length) {
          return 'None'
        }
        if (d.field.length > 1) {
          return 'Multiple';
        } else {
          return d.field.map((f) => f.field_name)
        }
      },
      minWidth: 70
    }, {
      id: 'arrow-icon',
      Header: '',
      accessor: () => {
          return <BsCaretRight />
      },
      minWidth: 25
    }];

    return(
      <div className={styles.logContainer}>
        <h4>
          <strong>FARM LOG</strong>
        </h4>
        <hr/>
        <h4><b>Action</b></h4>
        <div className={styles.buttonContainer}>
          <Button onClick={()=>{history.push('/new_log')}}>Add New Log</Button>
        </div>
        <hr/>
        <div>
          <InfoBoxComponent customStyle={{float: 'right'}} title={'Log Help'} body={'Use the filters below to search your log history. Useful for keeping records of inputs and other farm activities for your team and certifiers.'}/>
          <h4><b>Log History</b></h4>
        </div>
        <div>
          <h5>Search Log By Activity</h5>
          <DropDown
            defaultValue={{ value: 'all', label: 'All' }}
            options={logTypes}
            onChange={(option) => this.setState({ activityFilter: option.value })}
            isSearchable={false}
          />
          <div>
            <DropDown
              className={styles.pullLeft}
              options={cropOptions}
              defaultValue={{ value: 'all', label: 'All Crops' }}
              placeholder='Select Crop'
              onChange={(option) => this.setState({ cropFilter: option.value })}
              isSearchable={false}
            />
            <DropDown
              className={styles.pullRight}
              options={fieldOptions}
              defaultValue={{ value: 'all', label: 'All Fields' }}
              placeholder='Select Field'
              onChange={(option) => this.setState({ fieldFilter: option.value })}
              isSearchable={false}
            />
          </div>
          <div>
            <LocalForm model='logDates'>
              <span className={styles.pullLeft}>
                <label>From</label>
                <DateContainer style={styles.date} custom={true} date={this.state.startDate} onDateChange={(date) => this.setState({ startDate: date })}/>
              </span>
              <span className={styles.pullRight} >
                <label>To</label>
                <DateContainer style={styles.date} custom={true} date={this.state.endDate} onDateChange={(date) => this.setState({ endDate: date })}/>
              </span>
            </LocalForm>
          </div>
        </div>
        <div className={styles.table}>
          <Table
            columns={columns}
            data={this.filterLogs(logs)}
            showPagination={false}
            minRows={5}
            className="-striped -highlight"
            defaultSorted={[
              {
                id: "date",
                desc: true
              }
            ]}
            getTdProps={(state, rowInfo, column, instance) => {
              return {
                onClick: (e, handleOriginal) => {
                  if(rowInfo && rowInfo.original) {
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
                }
              };
            }}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    crops: cropSelector(state),
    fields: fieldsSelector(state),
    logs: logSelector(state),
    user: userFarmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Log);
