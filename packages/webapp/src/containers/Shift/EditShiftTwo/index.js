import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import {
  durationSelector,
  selectedShiftSelector,
  selectedTasksSelector,
  startEndSelector,
} from './selectors';

import cropImg from '../../../assets/images/log/crop_white.svg';
import fieldImg from '../../../assets/images/log/field_white.svg';
import Select from 'react-select';
import { Button, Col, Container, Row } from 'react-bootstrap';
import closeButton from '../../../assets/images/grey_close_button.png';
import Popup from 'reactjs-popup';
import history from '../../../history';
import { toastr } from 'react-redux-toastr';
import { updateShift } from '../actions';
import { shiftRatings } from '../constants';
import { BsReplyFill } from 'react-icons/all';
import { userFarmSelector } from '../../userFarmSlice';
import { fieldsSelector } from '../../fieldSlice';
import { withTranslation } from 'react-i18next';
import { currentFieldCropsSelector } from '../../fieldCropSlice';

class EditShiftTwo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cropOptions: [],
      defaultCrops: {},
      fieldOptions: [],
      defaultFields: {},
      availableDuration: this.props.availableDuration,
      originalDuration: 0,
      finalForm: {},
      minBoxStyle: {
        position: 'fixed',
        border: '1px solid #FCF8E3',
        padding: '0.02em 16px',
        width: '90%',
        borderRadius: '16px',
        background: '#DFF0D8',
        zIndex: 2,
      },
      mood: 'happy',
      showEdit: false,
      moodSelected: {
        width: '50px',
        height: '50px',
        background: '#00756A',
        borderRadius: '50px',
        margin: '0 auto',
      },
      moodUnSelected: {
        width: '50px',
        height: '50px',
        background: '#7BCFA2',
        borderRadius: '50px',
        margin: '0 auto',
      },
      //cropDuration: { TASK_ID: [{DURATION: FLOAT, CROP_NAME: STRING, FIELD_CROP_ID: UUID}, ... ] ... }
      cropDurations: {},
    };
    this.toggleCropOrField = this.toggleCropOrField.bind(this);
    this.toggleBack = this.toggleBack.bind(this);
    this.changeDuration = this.changeDuration.bind(this);
    this.submitShift = this.submitShift.bind(this);
    this.restoreSelection = this.restoreSelection.bind(this);
    this.getFieldName = this.getFieldName.bind(this);
    this.getCropName = this.getCropName.bind(this);
  }

  getCropByFCID = (field_crop_id) => {
    const crops = this.props.crops;
    for (let crop of crops) {
      if (crop.field_crop_id === field_crop_id) {
        return crop;
      }
    }
  };

  componentDidMount() {
    const crops = this.props.crops || [];
    const fields = this.props.fields || [];
    const selectedShift = this.props.selectedShift;
    const selectedTasks = selectedShift.tasks;

    //fix time
    let taskArr = [];
    let chosenTasks = this.props.selectedTasks;
    for (let c of chosenTasks) {
      taskArr.push(c.task_id);
    }

    let cropOptions = [],
      fieldOptions = [],
      addedCropID = [];
    let originalDuration = this.props.availableDuration;
    for (let crop of crops) {
      if (!addedCropID.includes(crop.crop_id)) {
        cropOptions.push({
          label: this.props.t(`crop:${crop.crop_translation_key}`),
          value: crop.crop_id,
        });
        addedCropID.push(crop.crop_id);
      }
    }
    for (let field of fields) {
      fieldOptions.push({ label: field.field_name, value: field.field_id });
    }
    let finalForm = {};
    let defaultCrops = {},
      defaultFields = {};
    let addedCrops = [];
    for (let task of selectedTasks) {
      if (taskArr.indexOf(task.task_id) > -1) {
        let val = [];
        let duration = Math.round(task.duration);
        if (finalForm[task.task_id]) {
          val = finalForm[task.task_id].val;
          duration += finalForm[task.task_id].duration;
        }
        if (task.is_field) {
          val.push({ id: task.field_id });
          let fieldName = this.getFieldName(task.field_id);
          if (defaultFields[task.task_id]) {
            let ids = defaultFields[task.task_id];
            let canAdd = true;
            for (let obj of ids) {
              if (obj.value === task.field_id) {
                canAdd = false;
              }
            }
            if (canAdd) {
              defaultFields[task.task_id].push({
                value: task.field_id,
                label: fieldName,
              });
            }
          } else {
            defaultFields[task.task_id] = [{ value: task.field_id, label: fieldName }];
          }
        } else {
          let this_crop = this.getCropByFCID(task.field_crop_id);
          val.push({ id: this_crop.crop_id });
          let cropName = this.props.t(`crop:${this_crop.crop_translation_key}`);
          if (!addedCrops.includes(this_crop.crop_id)) {
            if (defaultCrops[task.task_id]) {
              defaultCrops[task.task_id].push({
                value: this_crop.crop_id,
                label: cropName,
              });
            } else {
              defaultCrops[task.task_id] = [{ value: this_crop.crop_id, label: cropName }];
            }
            addedCrops.push(this_crop.crop_id);
          }
        }
        finalForm[task.task_id] = {
          is_field: task.is_field,
          val: val,
          duration: duration,
        };
      }
    }
    for (let task of this.props.selectedTasks) {
      if (!finalForm[task.task_id]) {
        finalForm[task.task_id] = {
          is_field: false,
          val: [],
          duration: 0,
        };
      }
    }

    originalDuration = parseInt(parseFloat(originalDuration).toFixed(0), 10);
    this.setState({
      cropOptions,
      fieldOptions,
      availableDuration: originalDuration,
      finalForm,
      originalDuration: originalDuration,
      mood: selectedShift.mood,
      defaultFields,
      defaultCrops,
    });

    this.restoreSelection(selectedTasks);
  }

  isCurrentUserInShift = () => {
    const { users, selectedShift } = this.props;
    return users.user_id === selectedShift.user_id;
  };

  getFieldName(field_id) {
    for (let field of this.props.fields) {
      if (field.field_id === field_id) {
        return field.field_name;
      }
    }
    return 'no name';
  }

  getCropName(crop_id) {
    for (let crop of this.props.crops) {
      if (crop.crop_id === crop_id) {
        return this.props.t(`crop:${crop.crop_translation_key}`);
      }
    }
    return 'no name';
  }

  restoreSelection(tasks) {
    let toggledTask = [];
    let totalDuration = this.state.availableDuration;
    let cropDurations = [];
    for (let t of tasks) {
      let isField = t.is_field;
      if (!toggledTask.includes(t.task_id)) {
        let type = isField ? 'field' : 'crop';
        this.toggleCropOrField(t.task_id, type);
        toggledTask.push(t.task_id);
      }
      let id = t.task_id;
      if (isField) {
        let prefix = 'input-field-';
        let e = document.getElementById(prefix + id);
        if (e) {
          let duration = Number(t.duration);
          if (e.value) {
            e.value = Number(e.value) + duration;
          } else {
            e.value = duration;
          }
          totalDuration -= duration;
        }
      } else {
        let thisCrop = this.getCropByFCID(t.field_crop_id);
        if (cropDurations.hasOwnProperty(t.task_id)) {
          let hasFound = false;
          let i = 0;
          for (i = 0; i < cropDurations[t.task_id].length; i++) {
            let obj = cropDurations[t.task_id][i];
            if (obj.crop_id === thisCrop.crop_id) {
              obj.duration += Number(t.duration);
              cropDurations[t.task_id][i] = obj;
              hasFound = true;
              break;
            }
          }

          if (!hasFound) {
            cropDurations[t.task_id].push({
              duration: Number(t.duration),
              crop_id: thisCrop.crop_id,
              crop_name: this.props.t(`crop:${thisCrop.crop_translation_key}`),
            });
          }
        } else {
          cropDurations[t.task_id] = [];
          cropDurations[t.task_id].push({
            duration: Number(t.duration),
            crop_id: thisCrop.crop_id,
            crop_name: this.props.t(`crop:${thisCrop.crop_translation_key}`),
          });
        }
        totalDuration -= Number(t.duration);
      }
    }
    totalDuration = Number(parseInt(totalDuration, 10));
    this.setState({
      availableDuration: totalDuration,
      cropDurations,
    });
  }

  toggleCropOrField(task_id, type) {
    if (type === 'crop') {
      let containerDiv = document.getElementById(task_id);
      let cropDiv = document.getElementById('crop' + task_id);
      if (cropDiv) {
        if (containerDiv.style.display === 'block') {
          containerDiv.style.display = 'none';
          cropDiv.style.display = 'flex';
        }
      }
    } else {
      let containerDiv = document.getElementById(task_id);
      let fieldDiv = document.getElementById('field' + task_id);
      if (fieldDiv) {
        if (containerDiv.style.display === 'block') {
          containerDiv.style.display = 'none';
          fieldDiv.style.display = 'flex';
        }
      }
    }
  }

  resetCropDuration = (task_id) => {
    let { cropDurations } = this.state;
    let resetDurations = [];
    for (let cdObj of cropDurations[task_id]) {
      cdObj.duration = 0;
      resetDurations.push(cdObj);
    }
    cropDurations[task_id] = resetDurations;
    this.setState({ cropDurations });
  };

  toggleBack(task_id, type) {
    let containerDiv = document.getElementById(task_id);
    containerDiv.style.display = 'block';
    if (type === 'crop') {
      let cropDiv = document.getElementById('crop' + task_id);
      cropDiv.style.display = 'none';
    } else {
      let fieldDiv = document.getElementById('field' + task_id);
      fieldDiv.style.display = 'none';
    }

    let { availableDuration, cropDurations } = this.state;
    let updatedDuration = availableDuration;
    // reset available duration
    if (type === 'crop') {
      if (cropDurations.hasOwnProperty(task_id)) {
        let subTotal = 0;
        for (let cdObj of cropDurations[task_id]) {
          subTotal += Number(cdObj.duration);
        }
        updatedDuration = availableDuration + Number(subTotal);
        this.resetCropDuration(task_id);
      }
    } else {
      let inputName = 'input-field-';
      let input_element = document.getElementById(inputName + task_id);
      let value = input_element.value === '' ? 0 : input_element.value;
      updatedDuration = availableDuration + Number(value);
      input_element.value = 0;
    }

    this.setState({
      availableDuration: Number(updatedDuration),
    });
  }

  handleCropChange = (selectedOption, task_id) => {
    let { finalForm, cropDurations } = this.state; //originalDuration
    finalForm[task_id].is_field = false;
    finalForm[task_id].val = [];
    // for individual durations
    cropDurations[task_id] = [];

    for (let option of selectedOption) {
      finalForm[task_id].val.push({ id: option.value });
      cropDurations[task_id].push({
        crop_id: option.value,
        crop_name: option.label,
        duration: 0,
      });
    }

    this.setState({
      finalForm,
      cropDurations,
      //availableDuration: originalDuration,
    });
  };

  handleFieldChange = (selectedOption, task_id) => {
    let finalForm = this.state.finalForm;
    finalForm[task_id].is_field = true;
    finalForm[task_id].val = [];
    for (let option of selectedOption) {
      finalForm[task_id].val.push({ id: option.value });
    }
    this.setState({
      finalForm,
    });
    // console.log(this.state.finalForm)
  };

  changeDuration(event, task_id, is_crop, crop_id = null) {
    let value = event.target.value;
    let { availableDuration, cropDurations, finalForm, originalDuration } = this.state;
    let remainingDuration = originalDuration;

    if (is_crop) {
      for (let cdObj of cropDurations[task_id]) {
        if (cdObj.crop_id === crop_id) {
          cdObj.duration = value;
        }
      }
      this.setState({
        cropDurations,
      });
    } else {
      finalForm[task_id].duration = value;
      this.setState({
        finalForm,
      });
    }

    let keys = Object.keys(finalForm);

    for (let key of keys) {
      if (finalForm[key].is_field) {
        remainingDuration = remainingDuration - Number(finalForm[key].duration);
      } else {
        if (cropDurations.hasOwnProperty(key)) {
          for (let cdObj of cropDurations[key]) {
            remainingDuration = remainingDuration - Number(cdObj.duration);
          }
        }
      }
    }

    // change box color & set duration
    this.setState({
      availableDuration: remainingDuration,
      minBoxStyle: {
        position: 'fixed',
        border: availableDuration === 0 ? '1px solid #DFF0D8' : '1px solid #FCF8E3',
        padding: '0.02em 16px',
        width: '90%',
        borderRadius: '16px',
        background: availableDuration === 0 ? '#DFF0D8' : '#FCF8E3',
        zIndex: 2,
      },
    });
  }

  closeEditModal = () => {
    this.setState({ showEdit: false });
  };

  openEditModal = () => {
    this.setState({ showEdit: true });
  };

  selectMood = (mood) => {
    this.setState({ mood });
  };

  submitShift() {
    //console.log(this.state.availableDuration);
    if (this.state.availableDuration !== 0) {
      toastr.error('Please assign all your available work minutes');
      return;
    }

    const finalForm = this.state.finalForm;
    const startEndObj = this.props.startEnd;
    let b_duration =
      startEndObj.break === null || startEndObj.break === '' || startEndObj.break === undefined
        ? 0
        : startEndObj.break;
    let form = {
      start_time: startEndObj.start,
      end_time: startEndObj.end,
      break_duration: Number(parseInt(b_duration, 0)),
      mood: this.state.mood,
      tasks: [],
    };

    let keys = Object.keys(finalForm);
    // key here is task_id
    for (let key of keys) {
      let vals = finalForm[key].val;
      let is_field = finalForm[key].is_field;
      const val_num = vals.length;
      if (val_num === 0) {
        toastr.error('Please assign crops or fields for each task');
        return;
      }
      let valIterator = 0;
      for (let val of vals) {
        if (!Number.isInteger(Number(finalForm[key].duration))) {
          toastr.error('Please assign only integers to durations');
          return;
        }
        let duration = Number(parseFloat(Number(finalForm[key].duration) / val_num).toFixed(0));
        if (valIterator === val_num - 1) {
          if (duration * val_num !== Number(finalForm[key].duration)) {
            duration = Number(finalForm[key].duration) - duration * (val_num - 1);
          }
        }
        if (is_field) {
          // duration / # of crops on field
          let crop_num = 0;
          let crops_on_field = [];
          const crops = this.props.crops;
          for (let crop of crops) {
            if (crop.field_id === val.id) {
              crop_num++;
              crops_on_field.push(crop);
            }
          }
          if (crop_num === 0) {
            form.tasks.push({
              task_id: key,
              duration: Number(parseFloat(duration).toFixed(0)),
              is_field: true,
              field_id: val.id,
            });
          } else {
            duration = Number(parseFloat(duration).toFixed(0));
            let sub_duration = Math.round(Number(duration / crop_num));
            let i = 0;
            for (let crop of crops_on_field) {
              if (i === crop_num - 1) {
                if (sub_duration * crop_num !== duration) {
                  sub_duration = duration - sub_duration * (crop_num - 1);
                }
              }
              form.tasks.push({
                task_id: key,
                duration: sub_duration,
                is_field: true,
                field_id: val.id,
                field_crop_id: crop.field_crop_id,
              });
              i++;
            }
          }
        } else {
          let subDuration = 0;
          let { cropDurations } = this.state;
          if (cropDurations.hasOwnProperty(key)) {
            for (let cdObj of cropDurations[key]) {
              if (Number(cdObj.duration) === 0) {
                toastr.error('Please assign a duration for each crop.');
                return;
              }
              if (!Number.isInteger(Number(cdObj.duration))) {
                toastr.error('Please assign only integers to durations');
                return;
              }
              if (cdObj.crop_id === val.id) {
                subDuration = cdObj.duration;
              }
            }
          } else {
            toastr.error("Sumbit shift with crops failed. Litefarm's issue.");
            return;
          }
          let crops = this.props.crops;
          let crop_arr = [];
          for (let crop of crops) {
            if (crop.crop_id === val.id) {
              crop_arr.push(crop);
            }
          }
          subDuration = subDuration / crop_arr.length;

          for (let a_crop of crop_arr) {
            form.tasks.push({
              task_id: key,
              duration: Number(parseFloat(subDuration).toFixed(3)),
              is_field: false,
              field_crop_id: a_crop.field_crop_id,
              field_id: a_crop.field_id,
            });
          }
        }
        valIterator++;
      }
    }

    form.user_id = this.props.selectedShift.user_id;
    form.wage_at_moment = Number(this.props.startEnd.wage_at_moment);
    this.props.dispatch(updateShift(form, this.props.selectedShift.shift_id));
  }

  render() {
    const selectedTasks = this.props.selectedTasks;
    const isRatingEnabled = this.isCurrentUserInShift();
    let { cropDurations } = this.state;

    return (
      <div className={styles.logContainer}>
        <PageTitle
          backUrl="/edit_shift_one"
          title={this.props.t('SHIFT.EDIT_SHIFT.TITLE_2')}
          rightIcon={true}
          rightIconTitle={this.props.t('SHIFT.EDIT_SHIFT.TIME_ALLOCATION')}
          rightIconBody={this.props.t('SHIFT.EDIT_SHIFT.ALLOCATE_ACTIVITY')}
        />
        <div className={styles.taskTitle} style={{ paddingBottom: '1.2em' }}>
          <div style={this.state.minBoxStyle}>
            <strong>
              {' '}
              {this.props.t('SHIFT.EDIT_SHIFT.YOU_HAVE')}{' '}
              <span>
                {this.state.availableDuration} {this.props.t('SHIFT.EDIT_SHIFT.MINUTES')}
              </span>{' '}
              {this.props.t('SHIFT.EDIT_SHIFT.TO_ASSIGN')}
            </strong>
          </div>
        </div>
        <div>
          {selectedTasks.map((task) => {
            return (
              <div key={task.task_id} className={styles.taskBlock}>
                <div className={styles.taskTitle}>
                  <strong>{this.props.t(`task:${task.task_translation_key}`)}</strong>
                  <div>{this.props.t('SHIFT.EDIT_SHIFT.ASSIGN_TIME_TO_TASK')}</div>
                </div>
                <div id={task.task_id} style={{ display: 'block' }}>
                  <div
                    className={styles.cropFieldContainer}
                    onClick={() => this.toggleCropOrField(task.task_id, 'crop')}
                  >
                    <div className={styles.cropButton}>
                      <img src={cropImg} alt="" />
                      <div className={styles.whiteText}>
                        {this.props.t('SHIFT.EDIT_SHIFT.CROPS_ON_YOUR_FARM')}
                      </div>
                    </div>
                    <div
                      className={styles.fieldButton}
                      onClick={() => this.toggleCropOrField(task.task_id, 'field')}
                    >
                      <img src={fieldImg} alt="" />
                      <div className={styles.whiteText}>
                        {this.props.t('SHIFT.EDIT_SHIFT.FIELDS_ON_YOUR_FARM')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.selectContainer} id={'crop' + task.task_id}>
                  <div>
                    <strong>{this.props.t('SHIFT.EDIT_SHIFT.CROPS_ON_THIS_FARM')}</strong>
                    <div
                      className={styles.backContainer}
                      onClick={() => this.toggleBack(task.task_id, 'crop')}
                    >
                      <BsReplyFill style={{ transform: 'scaleX(-1)' }} />
                      {this.props.t('common:BACK')}
                    </div>
                  </div>
                  <div className={styles.selectInner}>
                    {this.state.defaultCrops[task.task_id] && (
                      <Select
                        defaultValue={this.state.defaultCrops[task.task_id]}
                        isMulti
                        isSearchable={false}
                        name="selectByCrops"
                        placeholder="Select Crops..."
                        options={this.state.cropOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOption) =>
                          this.handleCropChange(selectedOption, task.task_id)
                        }
                      />
                    )}
                    {!this.state.defaultCrops[task.task_id] && (
                      <Select
                        isMulti
                        isSearchable={false}
                        name="selectByCrops"
                        placeholder="Select Crops..."
                        options={this.state.cropOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOption) =>
                          this.handleCropChange(selectedOption, task.task_id)
                        }
                      />
                    )}
                  </div>
                  {cropDurations && cropDurations[task.task_id] && (
                    <div className={styles.cropDurationContainer} style={{ display: 'flex' }}>
                      {cropDurations[task.task_id].map((cd) => {
                        return (
                          <div className={styles.durationContainer} key={cd.crop_id}>
                            <div>{cd.crop_name}</div>
                            <div className={styles.durationInput}>
                              <input
                                type="number"
                                placeholder={0}
                                onChange={(event) =>
                                  this.changeDuration(event, task.task_id, true, cd.crop_id)
                                }
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className={styles.selectContainer} id={'field' + task.task_id}>
                  <div>
                    <strong>Fields on this farm</strong>
                    <div
                      className={styles.backContainer}
                      onClick={() => this.toggleBack(task.task_id, 'field')}
                    >
                      <BsReplyFill style={{ transform: 'scaleX(-1)' }} />
                      {this.props.t('common:BACK')}
                    </div>
                  </div>
                  <div className={styles.selectInner}>
                    {this.state.defaultFields && this.state.defaultFields[task.task_id] && (
                      <Select
                        defaultValue={this.state.defaultFields[task.task_id]}
                        isMulti
                        isSearchable={false}
                        name="selectByFields"
                        options={this.state.fieldOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOption) =>
                          this.handleFieldChange(selectedOption, task.task_id)
                        }
                      />
                    )}
                    {!this.state.defaultFields[task.task_id] && (
                      <Select
                        isSearchable={false}
                        isMulti
                        name="selectByFields"
                        options={this.state.fieldOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={(selectedOption) =>
                          this.handleFieldChange(selectedOption, task.task_id)
                        }
                      />
                    )}
                  </div>
                  <div className={styles.durationContainer}>
                    <div>{this.props.t('SHIFT.EDIT_SHIFT.DURATION')}</div>
                    <div className={styles.durationInput}>
                      <input
                        id={'input-field-' + task.task_id}
                        type="number"
                        onChange={(event) => this.changeDuration(event, task.task_id, false)}
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.bottomContainer}>
                  <div className={styles.cancelButton} onClick={() => history.push('/my_shift')}>
                    {this.props.t('common:CANCEL')}
                  </div>
                  {isRatingEnabled ? (
                    <button className="btn btn-primary" onClick={() => this.openEditModal()}>
                      {this.props.t('common:NEXT')}
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => this.submitShift()}>
                      {this.props.t('common:UPDATE')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <Popup
          // pop up for mood
          open={this.state.showEdit}
          closeOnDocumentClick
          onClose={this.closeEditModal}
          contentStyle={{
            display: 'flex',
            width: '100%',
            height: '100vh',
            padding: '0 5%',
          }}
          overlayStyle={{ zIndex: '1060', height: '100vh' }}
        >
          <div className={styles.modal}>
            <div className={styles.popupTitle}>
              <a className={styles.close} onClick={this.closeEditModal}>
                <img src={closeButton} alt="" />
              </a>
            </div>
            <h3>{this.props.t('SHIFT.EDIT_SHIFT.MOOD')}</h3>
            <Container
              fluid={true}
              style={{
                marginLeft: 0,
                marginRight: 0,
                padding: '0 3%',
                marginTop: '5%',
                width: '100%',
              }}
            >
              <Row className="show-grid">
                {shiftRatings.map((shiftRating) => {
                  const { key, icon, label } = shiftRating;
                  const { mood, moodSelected, moodUnSelected } = this.state;
                  return (
                    <Col xs={4} md={4}>
                      <div className={styles.moodContainer} onClick={() => this.selectMood(key)}>
                        <div style={mood === key ? moodSelected : moodUnSelected}>
                          <h2>{icon}</h2>
                        </div>
                        <p>{label}</p>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </Container>
            <div className={styles.buttonContainer}>
              <Button onClick={() => this.submitShift()}>{this.props.t('common:FINISH')}</Button>
            </div>
          </div>
        </Popup>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    availableDuration: durationSelector(state),
    selectedTasks: selectedTasksSelector(state),
    crops: currentFieldCropsSelector(state),
    fields: fieldsSelector(state),
    startEnd: startEndSelector(state),
    selectedShift: selectedShiftSelector(state),
    users: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(EditShiftTwo));
