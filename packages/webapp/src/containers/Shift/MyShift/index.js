import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { deleteShift } from '../actions';
import moment from 'moment';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import history from '../../../history';
import { selectedShiftSelector, taskTypeSelector } from './selectors';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';
import { withTranslation } from 'react-i18next';
import { fieldsSelector } from '../../fieldSlice';
import { getDurationString } from './../../../util/index';
import { currentFieldCropsSelector } from '../../fieldCropSlice';

class MyShift extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: {},
      showModal: false, // for confirming deleting a shift
    };
    this.getFieldName = this.getFieldName.bind(this);
    this.getTaskName = this.getTaskName.bind(this);
    this.getCropName = this.getCropName.bind(this);
    this.editShift = this.editShift.bind(this);
  }

  componentDidMount() {
    const shift = this.props.selectedShift;

    // const fields = this.props.fields;
    // const crops = this.props.crops;
    let tasks = shift.tasks;
    let newTasks = {};
    // let fieldTasks = {}s;
    let addedCrops = [],
      addedFields = [];
    for (let task of tasks) {
      let newTask = {
        taskName: '',
        aoiNames: [],
        duration: 0,
      };
      let duration = task.duration;
      if (task.is_field) {
        let field_name = this.getFieldName(task.field_id);
        if (!newTasks.hasOwnProperty(task.task_id)) {
          newTask.taskName = this.getTaskName(task.task_id);
          newTask.aoiNames.push({ name: field_name, is_field: true });
          newTask.duration += duration;

          newTasks[task.task_id] = newTask;
          addedFields.push(field_name);
        } else {
          newTasks[task.task_id].duration += duration;

          if (!addedFields.includes(field_name)) {
            newTasks[task.task_id].aoiNames.push({
              name: field_name,
              is_field: true,
            });
            addedFields.push(field_name);
          }
        }
      } else {
        let thisCrop = this.getCropName(task.field_crop_id);
        if (!newTasks.hasOwnProperty(task.task_id)) {
          newTask.taskName = this.getTaskName(task.task_id);
          newTask.aoiNames.push({
            name: this.props.t(`crop:${thisCrop.crop_translation_key}`),
            is_field: false,
          });
          newTask.duration = duration;

          newTasks[task.task_id] = newTask;
        } else {
          newTasks[task.task_id].duration += duration;
          if (!addedCrops.includes(thisCrop.crop_id)) {
            newTasks[task.task_id].aoiNames.push({
              name: this.props.t(`crop:${thisCrop.crop_translation_key}`),
              is_field: false,
            });
          }
        }

        addedCrops.push(thisCrop.crop_id);
      }
    }

    //set times from shift obj

    this.setState({
      tasks: newTasks,
      date: moment(shift.shift_date).format('YYYY-MM-DD'),
    });
  }

  getFieldName(field_id) {
    for (let field of this.props.fields) {
      if (field.field_id === field_id) {
        return field.field_name;
      }
    }
    return 'no name';
  }

  getTaskName(task_id) {
    for (let task of this.props.taskType) {
      if (task.task_id === task_id) {
        return this.props.t(`task:${task.task_translation_key}`);
      }
    }
    return 'no name';
  }

  // get crop now, not just name
  getCropName(field_crop_id) {
    const crops = this.props.crops || [];
    for (let crop of crops) {
      if (crop.field_crop_id === field_crop_id) {
        return crop;
      }
    }
    return { crop_common_name: 'no_name', crop_id: 999999999 };
  }

  editShift() {
    history.push('/edit_shift_one');
  }

  handleShiftDelete = () => {
    this.setState({ showModal: true });
  };

  render() {
    let taskArr = [];
    for (let taskId of Object.keys(this.state.tasks)) {
      taskArr.push(this.state.tasks[taskId]);
    }
    const { farm } = this.props;
    let dropDown = 0;
    return (
      <div className={styles.logContainer}>
        <PageTitle backUrl="/shift" title={this.props.t('SHIFT.MY_SHIFT.TITLE')} />
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>{`${this.props.selectedShift.first_name} ${this.props.selectedShift.last_name}`}</div>
            {(Number(farm.role_id) === 1 ||
              Number(farm.role_id) === 2 ||
              Number(farm.role_id) === 5) && (
              <DropdownButton
                style={{
                  background: '#EFEFEF',
                  color: '#4D4D4D',
                  border: 'none',
                }}
                title={'Action'}
                key={dropDown}
                id={`dropdown-basic-${dropDown}`}
              >
                {/*<MenuItem eventKey="0" onClick={()=>this.editShift()}>Edit</MenuItem>*/}
                <Dropdown.Item eventKey="1" onClick={() => this.handleShiftDelete()}>
                  {this.props.t('common:DELETE')}
                </Dropdown.Item>
              </DropdownButton>
            )}
          </div>
          {this.props.users.is_admin && (
            <div className={styles.innerInfo}>
              <div>{this.props.t('SHIFT.MY_SHIFT.SUBMITTED_FOR')}</div>
              <span>
                {this.props.selectedShift.first_name + ' ' + this.props.selectedShift.last_name}
              </span>
            </div>
          )}
          <div className={styles.innerInfo}>
            <div>{this.props.t('SHIFT.SHIFT_DATE')}</div>
            <span>{this.state.date}</span>
          </div>
        </div>
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <strong>{this.props.t('SHIFT.MY_SHIFT.TASK')}</strong>
            <strong>{this.props.t('SHIFT.MY_SHIFT.FIELD_CROPS')}</strong>
            <strong>{this.props.t('SHIFT.MY_SHIFT.DURATION')}</strong>
          </div>
          {taskArr.map((task) => {
            return (
              <div
                className={styles.innerInfo}
                style={{ padding: '0.5em 2.5% 0.5em 5%' }}
                key={task.taskName}
              >
                <div className={styles.innerTaskName}>
                  <p>{task.taskName}</p>
                </div>
                <div className={styles.innerTaskList}>
                  {task.aoiNames.map((obj) => {
                    if (obj.is_field) {
                      return (
                        <p className={styles.nameLabelField} key={obj.name}>
                          {obj.name}
                        </p>
                      );
                    } else {
                      return (
                        <p className={styles.nameLabel} key={obj.name}>
                          {obj.name}
                        </p>
                      );
                    }
                  })}
                </div>
                <div className={styles.innerTaskTime}>
                  <span>{getDurationString(task.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
        <ConfirmModal
          open={this.state.showModal}
          onClose={() => this.setState({ showModal: false })}
          onConfirm={() => {
            let shiftId = this.props.selectedShift.shift_id;
            this.props.dispatch(deleteShift(shiftId));
            this.setState({ showModal: false });
          }}
          message={this.props.t('SHIFT.MY_SHIFT.DELETE_CONFIRMATION')}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedShift: selectedShiftSelector(state),
    fields: fieldsSelector(state),
    crops: currentFieldCropsSelector(state),
    taskType: taskTypeSelector(state),
    users: userFarmSelector(state),
    farm: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(MyShift));
