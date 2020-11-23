import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { deleteShift } from '../actions'
import moment from 'moment';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import history from '../../../history';
import { selectedShiftSelector, taskTypeSelector } from './selectors';
import { cropSelector, fieldSelector } from '../../selector';
import ConfirmModal from '../../../components/Modals/Confirm';
import { userFarmSelector } from '../../userFarmSlice';

class MyShift extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: {},
      startTime: null,
      endTime: null,
      breakDuration: 0,
      showModal: false, // for confirming deleting a shift
    };
    this.getFieldName = this.getFieldName.bind(this);
    this.getTaskName = this.getTaskName.bind(this);
    this.getCropName = this.getCropName.bind(this);
    this.editShift = this.editShift.bind(this);
  }



  componentDidMount(){
    const shift = this.props.selectedShift;

    // const fields = this.props.fields;
    // const crops = this.props.crops;
    let tasks = shift.tasks;
    let newTasks = {};
    // let fieldTasks = {}s;
    let addedCrops = [], addedFields = [];
    for (let task of tasks){
      let newTask = {
        taskName: '',
        aoiNames: [],
        duration: 0,
      };
      let duration = task.duration;
      if(task.is_field){
        let field_name = this.getFieldName(task.field_id);
        if(!newTasks.hasOwnProperty(task.task_id)){
          newTask.taskName = this.getTaskName(task.task_id);
          newTask.aoiNames.push({name: field_name, is_field: true});
          newTask.duration += duration;

          newTasks[task.task_id] = newTask;
          addedFields.push(field_name);
        }else{
          newTasks[task.task_id].duration += duration;

          if(!addedFields.includes(field_name)){
            newTasks[task.task_id].aoiNames.push({name: field_name, is_field: true});
            addedFields.push(field_name);
          }
        }
      }else{
        let thisCrop = this.getCropName(task.field_crop_id);
        if(!newTasks.hasOwnProperty(task.task_id)){
          newTask.taskName = this.getTaskName(task.task_id);
          newTask.aoiNames.push({name: thisCrop.crop_common_name, is_field: false});
          newTask.duration = duration;

          newTasks[task.task_id] = newTask;
        }else{

          newTasks[task.task_id].duration += duration;
          if(!addedCrops.includes(thisCrop.crop_id)){
            newTasks[task.task_id].aoiNames.push({name: thisCrop.crop_common_name, is_field: false});
          }
        }

        addedCrops.push(thisCrop.crop_id);
      }
    }

    //set times from shift obj
    let startTime = moment(shift.start_time);
    let endTime = moment(shift.end_time);
    let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let date = months[startTime.month()] + ' ' +startTime.date().toString() + ', ' + startTime.year().toString();

    startTime = startTime.format('YYYY-MM-DD h:mm A').split(' ');
    endTime = endTime.format('YYYY-MM-DD h:mm A').split(' ');

    this.setState({
      tasks: newTasks,
      date: date,
      start: startTime[1] + ' ' + startTime[2],
      end: endTime[1] + ' ' + endTime[2],
      breakDuration: shift.break_duration,
    })
  }

  getFieldName(field_id){
    for(let field of this.props.fields){
      if(field.field_id === field_id){
        return field.field_name;
      }
    }
    return 'no name';
  }

  getTaskName(task_id){
    for(let task of this.props.taskType){
      if(task.task_id === task_id){
        return task.task_name;
      }
    }
    return 'no name';
  }

  // get crop now, not just name
  getCropName(field_crop_id){
    const crops = this.props.crops || [];
    for(let crop of crops){
      if(crop.field_crop_id === field_crop_id){
        return crop;
      }
    }
    return {crop_common_name: 'no_name', crop_id: 999999999};
  }

  editShift(){
    history.push('/edit_shift_one');
  }

  handleShiftDelete = () => {
    this.setState({showModal: true});
  }

  render(){
    let taskArr = [];
    for(let taskId of Object.keys(this.state.tasks)){
      taskArr.push(this.state.tasks[taskId]);
    }
    const { farm } = this.props;
    let dropDown = 0;
    return(
      <div className={styles.logContainer}>
        <PageTitle backUrl="/shift" title="My Shift"/>
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <div>
            {this.state.date}
            </div>
            {
              (Number(farm.role_id) === 1 || Number(farm.role_id) === 2 || Number(farm.role_id) === 5) &&
              <DropdownButton
                style={{background:'#EFEFEF', color:'#4D4D4D', border:'none'}}
                title={'Action'}
                key={dropDown}
                id={`dropdown-basic-${dropDown}`}
              >
                {/*<MenuItem eventKey="0" onClick={()=>this.editShift()}>Edit</MenuItem>*/}
                <Dropdown.Item eventKey="1" onClick={()=>this.handleShiftDelete()}>Delete</Dropdown.Item>
              </DropdownButton>
            }
          </div>
          {
            this.props.users.is_admin && <div className={styles.innerInfo}>
              <div>Submitted For</div><span>{this.props.selectedShift.first_name + ' ' + this.props.selectedShift.last_name}</span>
            </div>
          }
          <div className={styles.innerInfo}>
            <div>Start Time</div><span>{this.state.start}</span>
          </div>
          <div className={styles.innerInfo}>
            <div>End Time</div><span>{this.state.end}</span>
          </div>
          <div className={styles.innerInfo}>
            <div>Break Duration</div><span>{this.state.breakDuration} min</span>
          </div>
        </div>
        <div className={styles.infoBlock}>
          <div className={styles.innerInfo}>
            <strong>Task</strong>
            <strong>Fields/Crops</strong>
            <strong>Duration</strong>
          </div>
          {
            taskArr.map((task)=>{

              return (
              <div className={styles.innerInfo} style={{padding:'0.5em 2.5% 0.5em 5%'}} key={task.taskName}>
                <div className={styles.innerTaskName}><p>{task.taskName}</p></div>
                <div className={styles.innerTaskList} >
                {
                  task.aoiNames.map((obj)=>{
                    if(obj.is_field){
                      return(
                        <p className={styles.nameLabelField} key={obj.name}>{obj.name}</p>
                      )
                    }else{
                      return(
                        <p className={styles.nameLabel} key={obj.name}>{obj.name}</p>
                      )
                    }
                  })
                }
                </div>
                <div className={styles.innerTaskTime}>
                  <span>{(task.duration/60).toFixed(2)} hr</span>
                </div>
              </div>
              )
            })
          }
        </div>
        <ConfirmModal
            open={this.state.showModal}
            onClose={() => this.setState({showModal: false})}
            onConfirm={() => {
              let shiftId = this.props.selectedShift.shift_id;
              this.props.dispatch(deleteShift(shiftId));
              this.setState({showModal: false});
            }}
            message='Are you sure you want to delete this shift?'
          />
      </div>
    )
  }

}


const mapStateToProps = (state) => {
  return {
    selectedShift: selectedShiftSelector(state),
    fields: fieldSelector(state),
    crops: cropSelector(state),
    taskType: taskTypeSelector(state),
    users: userFarmSelector(state),
    farm: userFarmSelector(state),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(MyShift);
