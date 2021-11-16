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
import Button from '../../components/Form/Button';
import history from '../../history';
import moment from 'moment';
import { taskTypeSelector } from './StepOne/selectors';
import { shiftsSelector, shiftStartEndDateSelector, shiftTypeFilterSelector } from './selectors';
import {
  getAllShifts,
  getTaskTypes,
  resetShiftFilter,
  setSelectedShift,
  setShiftEndDate,
  setShiftStartDate,
  setShiftType,
} from './actions';
import DropDown from '../../components/Inputs/DropDown';
import { LocalForm } from 'react-redux-form';
import { FromToDateContainer } from '../../components/Inputs/DateContainer';
import { BsCaretRight } from 'react-icons/bs';
import { userFarmSelector } from '../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { getLocations, getManagementPlans } from '../saga';
import { getDuration } from '../../util';
import Table from '../../components/Table';
import { Semibold, Title, Underlined } from '../../components/Typography';
import { colors } from '../../assets/theme';

class Shift extends Component {
  constructor(props) {
    super(props);
    this.filterShifts = this.filterShifts.bind(this);
    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
  }

  componentDidMount() {
    const { dispatch, users } = this.props;
    dispatch(getManagementPlans());
    dispatch(getLocations());
    dispatch(getTaskTypes());
    dispatch(getAllShifts());
    //TODO: fix getShiftByUserEndPoint

    // if (users.role_id === 1 || users.role_id === 2 || users.role_id === 5) {
    //   dispatch(getAllShifts());
    // } else {
    //   dispatch(getShifts());
    // }
  }

  checkFilter = (l = [], attribute, constraint) => {
    return l[attribute] === constraint || constraint === 'all' || !constraint;
  };

  filterShifts() {
    const shifts = this.props.shifts || [];
    const { startDate, endDate } = this.props.dates;
    const { shiftType } = this.props;
    const nameFilter = shiftType?.value ?? 'all';
    return shifts
      ?.filter(
        (shift) =>
          moment(startDate).isSameOrBefore(shift.shift_date, 'day') &&
          moment(endDate).isSameOrAfter(shift.shift_date, 'day') &&
          this.checkFilter(shift, 'user_id', nameFilter),
      )
      .map((shift) => ({
        ...shift,
        shift_date: moment(shift.shift_date).utc(),
      }));
  }
  onStartDateChange(date) {
    this.props.dispatch(setShiftStartDate(date));
  }
  onEndDateChange(date) {
    this.props.dispatch(setShiftEndDate(date));
  }

  render() {
    let shifts = this.props.shifts || [];
    const { users } = this.props;
    const columns = [
      {
        id: 'date',
        Header: this.props.t('common:DATE'),
        Cell: (d) => <span>{moment(d.value).format('YYYY-MM-DD')}</span>,
        accessor: (d) => d.shift_date,
        minWidth: 60,
      },
      {
        id: 'hour_worked',
        Header: this.props.t('common:HOURS'),
        accessor: (d) => {
          let mins = 0;
          for (let task of d.tasks) {
            mins += task.duration;
          }
          return getDuration(parseInt(mins)).durationString;
        },
        minWidth: 40,
      },
      {
        id: 'arrow-icon',
        Header: '',
        accessor: () => {
          return <BsCaretRight />;
        },
        minWidth: 20,
      },
    ];
    const nameOptions = [];
    if (users.role_id === 1 || users.role_id === 2 || users.role_id === 5) {
      columns.splice(1, 0, {
        id: 'name',
        Header: this.props.t('common:NAME'),
        accessor: (d) => {
          return d.first_name + ' ' + d.last_name;
        },
        minWidth: 60,
      });

      let dict = {};
      for (let shift of shifts) {
        if (!dict.hasOwnProperty(shift.user_id)) {
          dict[shift.user_id] = {
            value: shift.user_id,
            label: shift.first_name + ' ' + shift.last_name,
          };
        }
      }
      for (let k of Object.keys(dict)) {
        nameOptions.push(dict[k]);
      }
      nameOptions.unshift({ value: 'all', label: this.props.t('common:ALL') });
    }

    let { startDate, endDate } = this.props.dates;
    startDate = moment(startDate);
    endDate = moment(endDate);
    return (
      <div className={styles.logContainer}>
        <Title>{this.props.t('SHIFT.TITLE')}</Title>

        <hr />

        <Semibold>{this.props.t('SHIFT.ACTION')}</Semibold>

        <div className={styles.buttonContainer}>
          <Button
            onClick={() => {
              history.push('/shift_step_one');
            }}
          >
            {this.props.t('SHIFT.ADD_NEW')}
          </Button>
        </div>
        <hr />

        <Semibold style={{ marginBottom: '16px' }}>{this.props.t('SHIFT.SHIFT_HISTORY')}</Semibold>

        {(users.role_id === 1 || users.role_id === 2 || users.role_id === 5) && (
          <div>
            <div className={styles.filterContainer}>
              <DropDown
                label={this.props.t('SHIFT.NAME')}
                style={{ marginBottom: '16px' }}
                value={
                  this.props.shiftType ?? {
                    value: 'all',
                    label: this.props.t('common:ALL'),
                  }
                }
                options={nameOptions}
                onChange={(option) => this.props.dispatch(setShiftType(option))}
                isSearchable={false}
              />
            </div>
          </div>
        )}
        <div>
          <LocalForm model="logDates">
            {' '}
            <FromToDateContainer
              onEndDateChange={this.onEndDateChange}
              onStartDateChange={this.onStartDateChange}
              startDate={startDate}
              endDate={endDate}
            />
          </LocalForm>
        </div>

        <Underlined
          style={{ color: colors.brown700 }}
          onClick={() => this.props.dispatch(resetShiftFilter())}
        >
          {this.props.t('common:CLEAR_ALL_FILTERS')}
        </Underlined>

        <div className={styles.table}>
          <Table
            columns={columns}
            data={this.filterShifts()}
            showPagination={true}
            pageSizeOptions={[10, 20, 50]}
            defaultPageSize={10}
            minRows={5}
            className="-striped -highlight"
            defaultSorted={[
              {
                id: 'date',
                desc: false,
              },
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
    taskTypes: taskTypeSelector(state),
    shifts: shiftsSelector(state),
    users: userFarmSelector(state),
    dates: shiftStartEndDateSelector(state),

    shiftType: shiftTypeFilterSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Shift));
