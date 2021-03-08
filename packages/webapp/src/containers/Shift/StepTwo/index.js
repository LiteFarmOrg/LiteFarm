import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import styles from '../styles.scss';
import PageTitle from '../../../components/PageTitle';
import { durationSelector, selectedTasksSelector, startEndSelector } from './selectors';

import cropImg from '../../../assets/images/log/crop_white.svg';
import fieldImg from '../../../assets/images/log/field_white.svg';
import closeButton from '../../../assets/images/grey_close_button.png';
import Select from 'react-select';
import Popup from 'reactjs-popup';
import { Button, Col, Container, Row } from 'react-bootstrap';
import history from '../../../history';
import { toastr } from 'react-redux-toastr';
import { submitMultiShift, submitShift } from '../actions';
import { BsReplyFill } from 'react-icons/bs';
import { userFarmSelector } from '../../userFarmSlice';
import { fieldsSelector } from '../../fieldSlice';
import { useTranslation, withTranslation } from 'react-i18next';
import { currentFieldCropsSelector } from '../../fieldCropSlice';
import { numberOnKeyDown } from '../../../components/Form/Input';

class ShiftStepTwo extends Component {
  constructor(props) {
    super(props);
    const isRatingEnabled = this.isCurrentUserInShift();
    this.state = {
      cropOptions: [],
      fieldOptions: [],
      defaultCrops: {},
      defaultFields: {},
      availableDuration: 0,
      originalDuration: 0,
      finalForm: {},
      minBoxStyle: {
        position: 'fixed',
        border: '1px solid #FCF8E3',
        padding: '0.02em 16px',
        width: '90%',
        borderRadius: '16px',
        background: '#FCF8E3',
        zIndex: 2,
      },
      mood: isRatingEnabled ? 'happy' : 'na',
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
      usersObj: this.props.startEnd,
    };
    this.toggleCropOrField = this.toggleCropOrField.bind(this);
    this.toggleBack = this.toggleBack.bind(this);
    this.changeDuration = this.changeDuration.bind(this);
    this.submitShift = this.submitShift.bind(this);
    this.addAll = this.addAll.bind(this);
  }

  componentDidMount() {
    let crops = this.props.crops || [];
    let fields = this.props.fields;
    let selectedTasks = this.props.selectedTasks;
    let cropOptions = [],
      fieldOptions = [],
      addedCropID = [];
    let availableDuration = Number(
      parseInt(parseFloat(this.props.availableDuration).toFixed(2), 10),
    );
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
    for (let task of selectedTasks) {
      finalForm[task.task_id] = {
        is_field: false,
        val: [],
        duration: 0,
      };
    }
    this.setState({
      cropOptions,
      fieldOptions,
      availableDuration,
      finalForm,
      originalDuration: availableDuration,
    });
  }

  isCurrentUserInShift = () => {
    const { users, startEnd } = this.props;
    const { isMulti, shiftUserId } = startEnd;

    // Single user case
    const isCurrentUserInSingleShift = !isMulti && users.user_id === shiftUserId;
    // Multi users case
    let isCurrentUserInMultiShift = false;
    if (isMulti && Array.isArray(shiftUserId)) {
      const shiftUserIds = shiftUserId.map((id) => id.value);
      if (shiftUserIds.includes(users.user_id)) {
        isCurrentUserInMultiShift = true;
      }
    }

    return isCurrentUserInSingleShift || isCurrentUserInMultiShift;
  };

  closeEditModal = () => {
    this.setState({ showEdit: false });
  };

  openEditModal = () => {
    this.setState({ showEdit: true });
  };

  selectMood = (mood) => {
    this.setState({
      mood,
    });
  };

  addAll(task_id, type, duration = 0) {
    const { crops, fields } = this.props;
    if (type === 'crop') {
      let defaultCrops = this.state.defaultCrops;
      defaultCrops[task_id] = [];
      let cropOptions = [],
        addedCropID = [];
      for (let c of crops) {
        if (!addedCropID.includes(c.crop_id)) {
          defaultCrops[task_id].push({
            value: c.crop_id,
            label: this.props.t(`crop:${c.crop_translation_key}`),
          });
          cropOptions.push({
            value: c.crop_id,
            label: this.props.t(`crop:${c.crop_translation_key}`),
          });
          addedCropID.push(c.crop_id);
        }
      }
      this.handleCropChange(cropOptions, duration, task_id);
      this.setState({
        defaultCrops,
      });
    } else {
      let defaultFields = this.state.defaultFields;
      defaultFields[task_id] = [];
      for (let f of fields) {
        defaultFields[task_id].push({ value: f.field_id, label: f.field_name });
        this.handleFieldChange([{ value: f.field_id }], task_id);
      }
      this.setState({
        defaultFields,
      });
    }
  }

  toggleCropOrField(task_id, type) {
    if (type === 'crop') {
      let containerDiv = document.getElementById(task_id);
      let cropDiv = document.getElementById('crop' + task_id);
      if (containerDiv.style.display === 'block') {
        containerDiv.style.display = 'none';
        cropDiv.style.display = 'flex';
      }
    } else {
      let containerDiv = document.getElementById(task_id);
      let fieldDiv = document.getElementById('field' + task_id);
      if (containerDiv.style.display === 'block') {
        containerDiv.style.display = 'none';
        fieldDiv.style.display = 'flex';
      }
    }
  }

  resetCropDuration = (task_id) => {
    let { cropDurations, finalForm } = this.state;
    let resetDurations = [];
    if (cropDurations?.hasOwnProperty(task_id)) {
      for (let cdObj of cropDurations[task_id]) {
        cdObj.duration = '';
        resetDurations.push(cdObj);
      }
      cropDurations[task_id] = resetDurations;
    }
    if (finalForm?.hasOwnProperty(task_id)) {
      finalForm[task_id].duration = 0;
    }
    let availableDuration = this.getRemainingDuration();
    this.setState({ cropDurations, availableDuration, finalForm });
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
    let { cropDurations, finalForm } = this.state;
    if (finalForm && finalForm[task_id]) {
      finalForm[task_id] = {};
    }
    if (cropDurations && cropDurations[task_id]) {
      cropDurations[task_id] = [];
    }
    let availableDuration = this.getRemainingDuration();
    this.setState({ cropDurations, availableDuration, finalForm });
  }

  handleCropChange = (selectedOptions, duration, task_id) => {
    let options = selectedOptions || [];
    let { finalForm, cropDurations } = this.state;
    finalForm[task_id].is_field = false;
    finalForm[task_id].val = [];
    // for individual durations
    cropDurations[task_id] = [];

    let totalTimeInput = document.getElementById('total_crop_input-' + task_id);
    if (totalTimeInput) {
      totalTimeInput.value = 0;
    }

    for (let option of options) {
      finalForm[task_id].val.push({ id: option.value });
      cropDurations[task_id].push({
        crop_id: option.value,
        crop_name: option.label,
        duration: duration / options.length,
      });
    }

    this.setState({
      finalForm,
      cropDurations,
    });
  };

  handleFieldChange = (selectedOptions, task_id) => {
    const options = selectedOptions || [];
    let finalForm = this.state.finalForm;
    finalForm[task_id].is_field = true;
    finalForm[task_id].val = [];
    for (let option of options) {
      finalForm[task_id].val.push({ id: option.value });
    }
    this.setState({
      finalForm,
    });
  };

  changeTotalIndyBtnColor = (task_id, is_total) => {
    let all_id_btn = document.getElementById('all-crop-' + task_id);
    let indy_id_btn = document.getElementById('indy-crop-' + task_id);

    if (is_total) {
      all_id_btn.className = 'duration-btn-selected';
      indy_id_btn.className = 'duration-btn-unselected';
    } else {
      indy_id_btn.className = 'duration-btn-selected';
      all_id_btn.className = 'duration-btn-unselected';
    }
  };

  toggleCropTimeMethod = (task_id, is_total, total = 0) => {
    let cropTotalTimeDiv = document.getElementById('allduration-' + task_id);
    let cropIndyTimeDiv = document.getElementById('singleduration-' + task_id);

    if (!is_total) {
      cropTotalTimeDiv.style.display = 'flex';
      cropIndyTimeDiv.style.display = 'none';
    } else {
      cropTotalTimeDiv.style.display = 'none';
      cropIndyTimeDiv.style.display = 'flex';
    }

    this.changeTotalIndyBtnColor(task_id, is_total);
  };

  cropTotalTimeAssign = (duration, task_id) => {
    let { cropDurations } = this.state;
    if (cropDurations.hasOwnProperty(task_id)) {
      let cropNum = cropDurations[task_id].length;
      let totalTime = duration;
      let indyTime = Math.round(Number(totalTime) / cropNum);
      let i = 0;
      for (let cdObj of cropDurations[task_id]) {
        if (i === cropNum - 1) {
          if (indyTime * cropNum !== Number(totalTime)) {
            indyTime = Number(totalTime) - indyTime * (cropNum - 1);
          }
        }
        this.changeDuration({ target: { value: indyTime } }, task_id, true, cdObj.crop_id);
        i++;
      }
    }
  };

  changeDuration(event, task_id, is_crop, crop_id = null, setDuration = () => {}) {
    let value = event.target.value;
    let { availableDuration, cropDurations, finalForm } = this.state;
    let duration = 0;
    if (is_crop) {
      for (let cdObj of cropDurations[task_id]) {
        if (cdObj.crop_id === crop_id) {
          cdObj.duration = Number(value);
        }
        duration += cdObj.duration;
      }
      setDuration(duration);
      this.setState({
        cropDurations,
      });
    } else {
      finalForm[task_id].duration = value;
      this.setState({
        finalForm,
      });
    }

    let remainingDuration = this.getRemainingDuration();
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

  getRemainingDuration() {
    let { cropDurations, finalForm, originalDuration } = this.state;
    let keys = Object.keys(finalForm);
    let remainingDuration = originalDuration;
    for (let key of keys) {
      if (finalForm[key].is_field) {
        remainingDuration = remainingDuration - Number(finalForm[key].duration);
      } else {
        if (cropDurations?.hasOwnProperty(key)) {
          for (let cdObj of cropDurations[key]) {
            remainingDuration = remainingDuration - Number(cdObj.duration);
          }
        }
      }
    }
    return Number(parseInt(remainingDuration, 10));
  }

  submitShift() {
    if (this.state.availableDuration !== 0) {
      toastr.error(this.props.t('message:SHIFT.ERROR.ASSIGN_ALL_MINUTES'));
      return;
    }
    let finalForm = this.state.finalForm;
    let usersObj = this.state.usersObj;
    let form;
    let b_duration =
      usersObj.break === null || usersObj.break === '' || usersObj.break === undefined
        ? 0
        : usersObj.break;
    if (usersObj.isMulti) {
      const { mood } = this.state;
      const { users } = this.props;
      const { shiftUserId, start, end } = usersObj;
      const shift_users = shiftUserId.map((shiftUser) => {
        if (shiftUser.value === users.user_id) {
          // update the current user's mood only
          // (other shift users' mood should remain 'na')
          shiftUser.mood = mood;
        }
        return shiftUser;
      });
      form = {
        shift_users,
        start_time: start,
        end_time: end,
        break_duration: Number(parseInt(b_duration, 0)),
        tasks: [],
      };
    } else {
      form = {
        user_id: usersObj.shiftUserId,
        wage_at_moment: Number(usersObj.wage),
        start_time: usersObj.start,
        end_time: usersObj.end,
        break_duration: Number(parseInt(b_duration, 0)),
        mood: this.state.mood,
        tasks: [],
      };
    }

    let keys = Object.keys(finalForm);
    // key here is task_id
    for (let key of keys) {
      let vals = finalForm[key].val;
      let is_field = finalForm[key].is_field;
      let val_num = vals.length;
      if (val_num === 0) {
        toastr.error(this.props.t('message:SHIFT.ERROR.CROP_FIELDS_EACH'));
        return;
      }
      let valIterator = 0;
      for (let val of vals) {
        if (is_field) {
          if (!Number.isInteger(Number(finalForm[key].duration))) {
            toastr.error(this.props.t('message:SHIFT.ERROR.ONLY_INTEGERS_DURATIONS'));
            return;
          }

          let duration = Number(parseFloat(Number(finalForm[key].duration) / val_num).toFixed(3));
          if (valIterator === val_num - 1) {
            if (duration * val_num !== Number(finalForm[key].duration)) {
              duration = Number(finalForm[key].duration) - duration * (val_num - 1);
            }
          }
          // duration / # of crops on field
          let crop_num = 0;
          let crops_on_field = [];
          let crops = this.props.crops;
          for (let crop of crops) {
            if (crop.field_id === val.id) {
              crop_num++;
              crops_on_field.push(crop);
            }
          }

          if (crop_num === 0) {
            form.tasks.push({
              task_id: key,
              duration: Number(parseFloat(duration).toFixed(3)),
              is_field: true,
              field_id: val.id,
            });
          } else {
            duration = Number(parseFloat(duration).toFixed(3));
            let sub_duration = Number(duration / crop_num);
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
        }
        // crop
        else {
          let subDuration = 0;
          let { cropDurations } = this.state;
          if (cropDurations.hasOwnProperty(key)) {
            for (let cdObj of cropDurations[key]) {
              if (Number(cdObj.duration) === 0) {
                toastr.error(this.props.t('message:SHIFT.ERROR.DURATION_FOR_CROPS'));
                return;
              }
              if (!Number.isInteger(Number(cdObj.duration))) {
                toastr.error(this.props.t('message:SHIFT.ERROR.ONLY_INTEGERS_DURATIONS'));
                return;
              }
              if (cdObj.crop_id === val.id) {
                subDuration = cdObj.duration;
              }
            }
          } else {
            toastr.error(this.props.t('message:SHIFT.ERROR.SUBMIT_SHIFT'));
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
    if (usersObj.isMulti) {
      this.props.dispatch(submitMultiShift(form));
    } else {
      this.props.dispatch(submitShift(form));
    }
  }

  render() {
    const { selectedTasks } = this.props;
    const { cropDurations } = this.state;
    const isRatingEnabled = this.isCurrentUserInShift();

    return (
      <div className={styles.logContainer}>
        <PageTitle
          backUrl="/shift_step_one"
          title={this.props.t('SHIFT.EDIT_SHIFT.NEW_SHIFT_TITLE_2')}
          rightIcon={true}
          rightIconTitle={this.props.t('SHIFT.EDIT_SHIFT.TIME_ALLOCATION')}
          rightIconBody={this.props.t('SHIFT.EDIT_SHIFT.ALLOCATE_ACTIVITY')}
        />
        <div className={styles.taskTitle} style={{ paddingBottom: '1.2em' }}>
          <div style={this.state.minBoxStyle}>
            <strong>
              {' '}
              {this.props.t('SHIFT.EDIT_SHIFT.YOU_HAVE')}
              <span>
                {this.state.availableDuration} {this.props.t('SHIFT.EDIT_SHIFT.MINUTES')}
              </span>{' '}
              {this.props.t('SHIFT.EDIT_SHIFT.TO_ASSIGN')}
            </strong>
          </div>
        </div>
        <div>
          {selectedTasks.map((task) => (
            <InputDuration
              key={task.task_id}
              addAll={this.addAll}
              changeDuration={this.changeDuration}
              cropDurations={cropDurations}
              handleCropChange={this.handleCropChange}
              handleFieldChange={this.handleFieldChange}
              state={this.state}
              isRatingEnabled={isRatingEnabled}
              openEditModal={this.openEditModal}
              toggleCropOrField={this.toggleCropOrField}
              task={task}
              toggleBack={this.toggleBack}
              toggleCropTimeMethod={this.toggleCropTimeMethod}
              cropTotalTimeAssign={this.cropTotalTimeAssign}
              resetCropDuration={this.resetCropDuration}
            />
          ))}
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
                <Col xs={4} md={4}>
                  <div className={styles.moodContainer} onClick={() => this.selectMood('happy')}>
                    <div
                      style={
                        this.state.mood === 'happy'
                          ? this.state.moodSelected
                          : this.state.moodUnSelected
                      }
                    >
                      {/*<img src={happyImg} alt=""/>*/}
                      <h2>😃</h2>
                    </div>
                    <p>{this.props.t('SHIFT.EDIT_SHIFT.HAPPY')}</p>
                  </div>
                </Col>
                <Col xs={4} md={4}>
                  <div
                    className={styles.moodContainer}
                    onClick={() => this.selectMood('very happy')}
                  >
                    <div
                      style={
                        this.state.mood === 'very happy'
                          ? this.state.moodSelected
                          : this.state.moodUnSelected
                      }
                    >
                      {/*<img src={vHappyImg} alt=""/>*/}
                      <h2>😆</h2>
                    </div>
                    <p>{this.props.t('SHIFT.EDIT_SHIFT.VERY_HAPPY')}</p>
                  </div>
                </Col>
                <Col xs={4} md={4}>
                  <div className={styles.moodContainer} onClick={() => this.selectMood('neutral')}>
                    <div
                      style={
                        this.state.mood === 'neutral'
                          ? this.state.moodSelected
                          : this.state.moodUnSelected
                      }
                    >
                      {/*<img src={neutralImg} alt=""/>*/}
                      <h2>😕</h2>
                    </div>
                    <p>{this.props.t('SHIFT.EDIT_SHIFT.NEUTRAL')}</p>
                  </div>
                </Col>
                <Col xs={4} md={4}>
                  <div className={styles.moodContainer} onClick={() => this.selectMood('sad')}>
                    <div
                      style={
                        this.state.mood === 'sad'
                          ? this.state.moodSelected
                          : this.state.moodUnSelected
                      }
                    >
                      {/*<img src={sadImg} alt=""/>*/}
                      <h2>😢</h2>
                    </div>
                    <p>{this.props.t('SHIFT.EDIT_SHIFT.SAD')}</p>
                  </div>
                </Col>
                <Col xs={4} md={4}>
                  <div className={styles.moodContainer} onClick={() => this.selectMood('very sad')}>
                    <div
                      style={
                        this.state.mood === 'very sad'
                          ? this.state.moodSelected
                          : this.state.moodUnSelected
                      }
                    >
                      {/*<img src={depressionImg} alt=""/>*/}
                      <h2>😭</h2>
                    </div>
                    <p>{this.props.t('SHIFT.EDIT_SHIFT.VERY_SAD')}</p>
                  </div>
                </Col>
                <Col xs={4} md={4}>
                  <div className={styles.moodContainer} onClick={() => this.selectMood('na')}>
                    <div
                      style={
                        this.state.mood === 'na'
                          ? this.state.moodSelected
                          : this.state.moodUnSelected
                      }
                    >
                      {/*<img src={depressionImg} alt=""/>*/}
                      <h2>🤭</h2>
                    </div>
                    <p>{this.props.t('SHIFT.EDIT_SHIFT.RATHER_NOT_SAY')}</p>
                  </div>
                </Col>
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

// TODO rewrite the component
function InputDuration({
  task,
  cropDurations,
  isRatingEnabled,
  toggleCropOrField,
  addAll,
  toggleBack,
  handleCropChange,
  toggleCropTimeMethod,
  changeDuration,
  handleFieldChange,
  openEditModal,
  state,
  cropTotalTimeAssign,
  resetCropDuration,
}) {
  const [duration, _setDuration] = useState('');
  const [selectedCrops, setSelectedCrops] = useState();
  const [selectedFields, setSelectedFields] = useState();
  const { t } = useTranslation();
  const setDuration = (value) => {
    _setDuration(value > 0 ? value : '');
  };
  const onDurationChange = (duration, task_id) => {
    setDuration(duration);
    cropTotalTimeAssign(duration, task_id);
  };
  return (
    <div key={task.task_id} className={styles.taskBlock}>
      <div className={styles.taskTitle}>
        <strong>{t(`task:${task.task_translation_key}`)}</strong>
        <div>{t('SHIFT.EDIT_SHIFT.ASSIGN_TIME_TO_TASK')}</div>
      </div>
      <div id={task.task_id} style={{ display: 'block' }}>
        <div
          className={styles.cropFieldContainer}
          onClick={() => toggleCropOrField(task.task_id, 'crop')}
        >
          <div className={styles.cropButton}>
            <img src={cropImg} alt="" />
            <div className={styles.whiteText}>{t('SHIFT.EDIT_SHIFT.CROPS_ON_YOUR_FARM')}</div>
          </div>
          <div
            className={styles.fieldButton}
            onClick={() => toggleCropOrField(task.task_id, 'field')}
          >
            <img src={fieldImg} alt="" />
            <div className={styles.whiteText}>{t('SHIFT.EDIT_SHIFT.FIELDS_ON_YOUR_FARM')}</div>
          </div>
        </div>
      </div>
      <div className={styles.selectContainer} id={'crop' + task.task_id}>
        <div>
          <strong>{t('SHIFT.EDIT_SHIFT.CROPS_ON_THIS_FARM')}</strong>
          <div className={styles.funcButtons}>
            <div className={styles.allButton}>
              <Button onClick={() => addAll(task.task_id, 'crop', duration)}>
                {t('SHIFT.EDIT_SHIFT.ALL')}
              </Button>
            </div>
            <div
              className={styles.backContainer}
              onClick={() => {
                setDuration(0);
                setSelectedCrops(null);
                toggleBack(task.task_id, 'crop');
              }}
            >
              <BsReplyFill style={{ transform: 'scaleX(-1)' }} />
              {t('common:BACK')}
            </div>
          </div>
        </div>
        <div className={styles.selectInner}>
          {state.defaultCrops[task.task_id] && (
            <Select
              defaultValue={state.defaultCrops[task.task_id]}
              isMulti
              isSearchable={false}
              name="selectByCrops"
              placeholder="Select Crops..."
              options={state.cropOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={selectedCrops}
              onChange={(selectedOption) => {
                setSelectedCrops(selectedOption);
                handleCropChange(selectedOption, duration, task.task_id);
              }}
            />
          )}
          {!state.defaultCrops[task.task_id] && (
            <Select
              isMulti
              isSearchable={false}
              name="selectByCrops"
              placeholder="Select Crops..."
              options={state.cropOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selectedOption) =>
                handleCropChange(selectedOption, duration, task.task_id)
              }
            />
          )}
        </div>
        {cropDurations && cropDurations[task.task_id] && (
          <div>
            <div className={styles.cropDurationType}>
              <button
                className="duration-btn-selected"
                onClick={() => toggleCropTimeMethod(task.task_id, true)}
                id={'all-crop-' + task.task_id}
              >
                {t('SHIFT.EDIT_SHIFT.ALL_CROPS')}
              </button>
              <button
                className="duration-btn-unselected"
                onClick={() => {
                  setDuration(0);
                  resetCropDuration(task.task_id);
                  toggleCropTimeMethod(task.task_id, false);
                }}
                id={'indy-crop-' + task.task_id}
              >
                {t('SHIFT.EDIT_SHIFT.INDIVIDUAL_CROPS')}
              </button>
            </div>
            <div className={styles.cropDurationContainer} id={'allduration-' + task.task_id}>
              {cropDurations[task.task_id].map((cd) => {
                return (
                  <div className={styles.durationContainer} key={cd.crop_id}>
                    <div>{cd.crop_name}</div>
                    <div className={styles.durationInput}>
                      <input
                        type="number"
                        onKeyDown={numberOnKeyDown}
                        value={cd.duration}
                        onChange={(event) =>
                          changeDuration(event, task.task_id, true, cd.crop_id, setDuration)
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div id={'singleduration-' + task.task_id}>
              <div className={styles.durationContainer}>
                <div>Total</div>
                <div className={styles.durationInput}>
                  <input
                    id={'total_crop_input-' + task.task_id}
                    value={duration}
                    type="number"
                    onKeyDown={numberOnKeyDown}
                    placeholder={0}
                    onChange={(event) => {
                      onDurationChange(event.target.value, task.task_id);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className={styles.selectContainer} id={'field' + task.task_id}>
        <div>
          <strong>Fields on this farm</strong>
          <div className={styles.funcButtons}>
            <div className={styles.allButton}>
              <Button onClick={() => addAll(task.task_id, 'field')}>
                {t('SHIFT.EDIT_SHIFT.ALL')}
              </Button>
            </div>
            <div
              className={styles.backContainer}
              onClick={() => {
                setDuration(0);
                setSelectedFields(null);
                toggleBack(task.task_id, 'field');
              }}
            >
              <BsReplyFill style={{ transform: 'scaleX(-1)' }} />
              {t('common:BACK')}
            </div>
          </div>
        </div>
        <div className={styles.selectInner}>
          {state.defaultFields[task.task_id] && (
            <Select
              defaultValue={state.defaultFields[task.task_id]}
              isMulti
              isSearchable={false}
              name="selectByFields"
              placeholder="Select Fields..."
              options={state.fieldOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              value={selectedFields}
              onChange={(selectedOption) => {
                setSelectedFields(selectedOption);
                handleFieldChange(selectedOption, task.task_id);
              }}
            />
          )}
          {!state.defaultFields[task.task_id] && (
            <Select
              isMulti
              isSearchable={false}
              name="selectByFields"
              placeholder="Select Fields..."
              options={state.fieldOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={(selectedOption) => handleFieldChange(selectedOption, task.task_id)}
            />
          )}
        </div>
        <div className={styles.durationContainer}>
          <div>{t('SHIFT.MY_SHIFT.DURATION')}</div>
          <div className={styles.durationInput}>
            <input
              id={'input-field-' + task.task_id}
              type="number"
              onKeyDown={numberOnKeyDown}
              value={duration}
              onChange={(event) => {
                setDuration(event.target.value);
                changeDuration(event, task.task_id, false);
              }}
            />
          </div>
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.cancelButton} onClick={() => history.push('/shift')}>
          {t('common:CANCEL')}
        </div>
        {isRatingEnabled ? (
          <button className="btn btn-primary" onClick={() => openEditModal()}>
            {t('common:NEXT')}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => submitShift()}>
            {t('common:FINISH')}
          </button>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    availableDuration: durationSelector(state),
    selectedTasks: selectedTasksSelector(state),
    crops: currentFieldCropsSelector(state),
    fields: fieldsSelector(state),
    startEnd: startEndSelector(state),
    farm: userFarmSelector(state),
    users: userFarmSelector(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(ShiftStepTwo));
