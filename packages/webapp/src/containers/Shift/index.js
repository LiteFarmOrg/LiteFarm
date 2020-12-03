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
import moment from 'moment';
import { taskTypeSelector } from './StepOne/selectors'
import { shiftsSelector } from './selectors';
import { getAllShifts, getShifts, getTaskTypes, setSelectedShift } from './actions'
import { getFieldCrops as getCrops, getFields } from '../actions';
import ReactTable from 'react-table';
import DropDown from '../../components/Inputs/DropDown';
import { LocalForm } from 'react-redux-form';
import DateContainer from '../../components/Inputs/DateContainer';
import { BsCaretRight } from 'react-icons/bs';
import { userFarmSelector } from '../userFarmSlice';
import {withTranslation} from "react-i18next";

class Shift extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: moment().startOf('year'),
      endDate:  moment().endOf('year'),
      nameFilter: 'all',
    };
    this.filterShifts = this.filterShifts.bind(this);
  }

  componentDidMount() {
    const {dispatch, users} = this.props;
    dispatch(getCrops());
    dispatch(getFields());
    dispatch(getTaskTypes());
    if(users.role_id === 1 || users.role_id === 2 || users.role_id === 5){
      dispatch(getAllShifts());
    }else{
      dispatch(getShifts());
    }
  }

  checkFilter = (l = [], attribute, constraint) => {
    return l[attribute] === constraint || constraint === 'all' || !constraint;
  };

  filterShifts() {
    let shifts = this.props.shifts || [];
    if(shifts !== null && Object.keys(shifts[0]).length>0){
      const { startDate, endDate, nameFilter } = this.state;
      // eslint-disable-next-line
      return shifts.filter((l) => this.checkFilter(l, 'user_id', nameFilter)
          && startDate.isBefore(l.start_time)
        // eslint-disable-next-line
          && (endDate.isAfter(l.start_time) || endDate.isSame(l.start_time, 'day'))  || l.test_shift // only present on test shifts in cypress/fixtures/shifts.json
      );
    }
  }

  render() {
    let shifts = this.props.shifts || [];
    const {users} = this.props;
    let columns = [];
    let nameOptions = [];
    if(shifts && shifts.length > 0 && (users.role_id === 1 || users.role_id === 2 || users.role_id === 5)){
      columns.push(
        {
          id: 'name',
          Header: 'Name',
          accessor: d => {
            return d.first_name + ' ' + d.last_name
          },
          minWidth: 60
        },
      );

      let dict = {};
      for(let shift of shifts){
        if(!dict.hasOwnProperty(shift.user_id)){
          dict[shift.user_id] = {
            value: shift.user_id,
            label: shift.first_name + ' ' + shift.last_name,
          }
        }
      }
      for( let k of Object.keys(dict)){
        nameOptions.push(dict[k]);
      }
      nameOptions.unshift({ value: 'all', label: 'All'});
    }
    if(shifts && shifts.length > 0){
      columns = columns.concat([{
        id: 'date',
        Header: 'Date(Y-M-D)',
        accessor: d => moment(d.start_time).format('YYYY-MM-DD'),
        minWidth: 60
      },
        {
          id: 'hour_worked',
          Header: 'Hours',
          accessor: d => {
            let mins = 0;
            for (let task of d.tasks) {
              mins += task.duration
            }
            return (mins / 60).toFixed(2)
          },
          minWidth: 40
        },
        {
          id: 'arrow-icon',
          Header: '',
          accessor: () => {
            return <BsCaretRight />
          },
          minWidth: 25
        }
      ]);
    }


    return (
      <div className={styles.logContainer}>
        <h4>
          <strong>{this.props.t('SHIFT.TITLE')}</strong>
        </h4>
        <hr/>
        <h4><b>{this.props.t('SHIFT.ACTION')}</b></h4>
        <div className={styles.buttonContainer}>
          <Button onClick={() => {
            history.push('/shift_step_one')
          }}>{this.props.t('SHIFT.ADD_NEW')}</Button>
        </div>
        <hr/>
        <div>
          <h4><b>{this.props.t('SHIFT.SHIFT_HISTORY')}</b></h4>
        </div>
        {
          (users.role_id === 1 || users.role_id === 2 || users.role_id === 5)  && <div>
            <div className={styles.filterContainer}>
              <div className={styles.nameFilter}>
                <label>{this.props.t('SHIFT.NAME')}</label>
                <DropDown
                  defaultValue={{ value: 'all', label: 'All' }}
                  options={nameOptions}
                  onChange={(option) => this.setState({ nameFilter: option.value })}
                  isSearchable={false}
                />
              </div>
              <LocalForm model='logDates'>
              <span className={styles.pullLeft}>
                <label>{this.props.t('SHIFT.FROM')}</label>
                <DateContainer style={styles.date} custom={true} date={this.state.startDate}
                               onDateChange={(date) => {this.setState({ startDate: date }); this.filterShifts()}}/>
              </span>
                <span className={styles.pullRight} >
                <label>{this.props.t('SHIFT.TO')}</label>
                <DateContainer style={styles.date} custom={true} date={this.state.endDate}
                               onDateChange={(date) =>  {this.setState({ endDate: date }); this.filterShifts()}}/>
              </span>
              </LocalForm>
            </div>
          </div>
        }

        <div className={styles.table}>
          {
           shifts && (shifts.length > 0) &&
            <ReactTable
              sortByID="date"
              columns={columns}
              data={this.filterShifts()}
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
                    if (rowInfo && rowInfo.original) {
                      this.props.dispatch(setSelectedShift(rowInfo.original));
                      history.push('/my_shift');
                    }
                    if (handleOriginal) {
                      handleOriginal();
                    }
                  }
                };
              }}
            />
          }


        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    taskTypes: taskTypeSelector(state),
    shifts: shiftsSelector(state),
    users: userFarmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Shift));
