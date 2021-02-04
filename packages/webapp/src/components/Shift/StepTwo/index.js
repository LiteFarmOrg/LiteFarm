import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { BsReplyFill } from 'react-icons/bs';
import Button from '../../Form/Button';
import TitleLayout from '../../Layout/TitleLayout';
import styles from '../../../containers/Shift/styles.scss';
import styles2 from './styles.scss';
import cropImg from '../../../assets/images/log/crop_white.svg';
import fieldImg from '../../../assets/images/log/field_white.svg';
import closeButton from '../../../assets/images/grey_close_button.png';
import Checkbox from '../../Form/Checkbox';
import { Label } from '../../Typography';
import { integerOnKeyDown } from '../../Form/Input';

function PureStepTwo({
  onGoBack,
  onNext,
  isCurrentShiftUser,
  finalForm,
  setFinalForm,
  cropDurations,
  setCropDurations,
  mood,
  setMood,
  crops,
  fields,
  selectedTasks,
  isEO,
}) {
  const { t } = useTranslation();
  let [cropOptions, setCropOptions] = useState([]);
  let [fieldOptions, setFieldOptions] = useState([]);
  const [defaultCrops, setDefaultCrops] = useState({});
  const [defaultFields, setDefaultFields] = useState({});
  const [showEdit, setShowEdit] = useState(false);
  const [nextEnabled, setNextEnabled] = useState(false);

  useEffect(() => {
    let addedCropID = [];
    let availableCropOptions = [];
    let availableFieldOptions = [];
    for (let crop of crops) {
      if (!addedCropID.includes(crop.crop_id)) {
        availableCropOptions.push({
          label: t(`crop:${crop.crop_translation_key}`),
          value: crop.crop_id,
        });
        addedCropID.push(crop.crop_id);
      }
    }
    for (let field of fields) {
      availableFieldOptions.push({ label: field.field_name, value: field.field_id });
    }
    setFieldOptions(availableFieldOptions);
    setCropOptions(availableCropOptions);
  }, []);

  useEffect(() => {
    const keys = Object.keys(finalForm);
    const cropsHaveValidDurations = keys.reduce((cond, k) => {
      if (finalForm[k].is_field) {
        return cond;
      }
      return (
        cond &&
        !!cropDurations[k] &&
        Object.keys(finalForm[k]).length > 0 &&
        cropDurations[k].reduce((innerCond, crop) => innerCond && Number(crop.duration) > 0, true)
      );
    }, true);

    const fieldsAndTasksAreValid = keys.reduce(
      (cond, k) =>
        cond &&
        Object.keys(finalForm[k]).length > 0 &&
        finalForm[k].val.length > 0 &&
        ((finalForm[k].is_field && finalForm[k].duration > 0) || !finalForm[k].is_field),
      true,
    );

    setNextEnabled(fieldsAndTasksAreValid && cropsHaveValidDurations);
  }, [cropDurations, finalForm]);
  const changeDuration = (event, task_id, is_crop, crop_id = null, setDuration = () => {}) => {
    let value = event.target.value;
    let duration = 0;
    const mutatingCropDurations = { ...cropDurations };
    if (is_crop) {
      for (let cdObj of mutatingCropDurations[task_id]) {
        if (cdObj.crop_id === crop_id) {
          cdObj.duration = Number(value);
        }
        duration += cdObj.duration;
      }
      setDuration(duration);
      setCropDurations(mutatingCropDurations);
    } else {
      setFinalForm({ ...finalForm, [task_id]: { ...finalForm[task_id], duration: value } });
    }
  };

  const resetCropDuration = (task_id) => {
    let resetDurations = [];
    if (cropDurations?.hasOwnProperty(task_id)) {
      for (let cdObj of cropDurations[task_id]) {
        cdObj.duration = '';
        resetDurations.push(cdObj);
      }
      setCropDurations({ ...cropDurations, [task_id]: resetDurations });
    }
    if (finalForm?.hasOwnProperty(task_id)) {
      setFinalForm({ ...finalForm, [task_id]: { ...finalForm[task_id], duration: 0 } });
    }
  };

  const handleCropChange = (selectedOption, duration, task_id) => {
    const options = selectedOption || [];
    const mutatingCropDuration = { ...cropDurations };
    const mutatingFinalForm = { ...finalForm };
    mutatingFinalForm[task_id].is_field = false;
    mutatingFinalForm[task_id].val = [];
    // for individual durations
    mutatingCropDuration[task_id] = [];

    let totalTimeInput = document.getElementById('total_crop_input-' + task_id);
    if (totalTimeInput) {
      totalTimeInput.value = 0;
    }

    for (let option of options) {
      mutatingFinalForm[task_id].val.push({ id: option.value });
      mutatingCropDuration[task_id].push({
        crop_id: option.value,
        crop_name: option.label,
        duration: duration / selectedOption.length,
      });
    }
    setCropDurations(mutatingCropDuration);
    setFinalForm(mutatingFinalForm);
  };

  const handleFieldChange = (selectedOption, task_id) => {
    let mutatingFinalForm = { ...finalForm };
    mutatingFinalForm[task_id].is_field = true;
    mutatingFinalForm[task_id].val = [];
    for (let option of selectedOption) {
      mutatingFinalForm[task_id].val.push({ id: option.value });
    }
    setFinalForm(mutatingFinalForm);
  };

  const addAll = (task_id, type, duration = 0) => {
    if (type === 'crop') {
      let mutatingDefaultCrops = { ...defaultCrops };
      mutatingDefaultCrops[task_id] = [];
      let cropOptions = [];
      let addedCropID = [];
      for (let c of crops) {
        if (!addedCropID.includes(c.crop_id)) {
          mutatingDefaultCrops[task_id].push({
            value: c.crop_id,
            label: t(`crop:${c.crop_translation_key}`),
          });
          cropOptions.push({
            value: c.crop_id,
            label: t(`crop:${c.crop_translation_key}`),
          });
          addedCropID.push(c.crop_id);
        }
      }
      handleCropChange(cropOptions, duration, task_id);
      setDefaultCrops(mutatingDefaultCrops);
    } else {
      let mutatingDefaultFields = defaultFields;
      mutatingDefaultFields[task_id] = [];
      for (let f of fields) {
        mutatingDefaultFields[task_id].push({ value: f.field_id, label: f.field_name });
        handleFieldChange([{ value: f.field_id }], task_id);
      }
      setDefaultFields(mutatingDefaultFields);
    }
  };

  const toggleCropOrField = (task_id, type) => {
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
  };

  const toggleBack = (task_id, type) => {
    let containerDiv = document.getElementById(task_id);
    containerDiv.style.display = 'block';
    if (type === 'crop') {
      let cropDiv = document.getElementById('crop' + task_id);
      cropDiv.style.display = 'none';
    } else {
      let fieldDiv = document.getElementById('field' + task_id);
      fieldDiv.style.display = 'none';
    }
    let mutatingFinalForm = { ...finalForm };

    const mutatingCropDurations = { ...cropDurations };
    if (mutatingFinalForm && mutatingFinalForm[task_id]) {
      mutatingFinalForm[task_id] = {};
    }
    if (mutatingCropDurations && mutatingCropDurations[task_id]) {
      mutatingCropDurations[task_id] = [];
    }
    const mutatedDefaultCrops = { ...defaultCrops };
    mutatedDefaultCrops[task_id] = [];
    setDefaultCrops(mutatedDefaultCrops);
    setCropDurations(mutatingCropDurations);
    setFinalForm(mutatingFinalForm);
  };

  const toggleCropTimeMethod = (task_id, is_total, total = 0) => {
    let cropTotalTimeDiv = document.getElementById('allduration-' + task_id);
    let cropIndyTimeDiv = document.getElementById('singleduration-' + task_id);

    if (!is_total) {
      cropTotalTimeDiv.style.display = 'flex';
      cropIndyTimeDiv.style.display = 'none';
    } else {
      cropTotalTimeDiv.style.display = 'none';
      cropIndyTimeDiv.style.display = 'flex';
    }

    changeTotalIndyBtnColor(task_id, is_total);
  };

  const changeTotalIndyBtnColor = (task_id, is_total) => {
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

  const cropTotalTimeAssign = (duration, task_id) => {
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
        changeDuration({ target: { value: indyTime } }, task_id, true, cdObj.crop_id);
        i++;
      }
    }
  };

  const openEditModal = () => {
    setShowEdit(true);
  };

  const finishOrIndicateMood = () => {
    if (isCurrentShiftUser || isEO) {
      openEditModal();
    } else {
      onNext();
    }
  };

  return (
    <TitleLayout
      onGoBack={onGoBack}
      title={t('SHIFT.NEW_SHIFT.STEP_TWO')}
      buttonGroup={
        <>
          <Button onClick={onGoBack} color={'secondary'} fullLength>
            {t('common:BACK')}
          </Button>
          <Button type={'submit'} fullLength disabled={!nextEnabled} onClick={finishOrIndicateMood}>
            {isCurrentShiftUser || isEO ? t('common:NEXT') : t('common:FINISH')}
          </Button>
        </>
      }
    >
      {selectedTasks?.map((task) => (
        <InputDuration
          key={task.task_id}
          addAll={addAll}
          changeDuration={changeDuration}
          cropDurations={cropDurations}
          handleCropChange={handleCropChange}
          handleFieldChange={handleFieldChange}
          toggleCropOrField={toggleCropOrField}
          task={task}
          state={{ defaultFields, cropOptions, fieldOptions }}
          defaultCrops={defaultCrops}
          toggleBack={toggleBack}
          toggleCropTimeMethod={toggleCropTimeMethod}
          cropTotalTimeAssign={cropTotalTimeAssign}
          resetCropDuration={resetCropDuration}
        />
      ))}
      <MoodPopup
        showEditModal={showEdit}
        closeEditModal={() => setShowEdit(false)}
        finish={onNext}
        setMood={setMood}
        mood={mood}
        isCurrentShiftUser={isCurrentShiftUser}
        isEO={isEO}
      />
    </TitleLayout>
  );
}

function InputDuration({
  task,
  cropDurations,
  toggleCropOrField,
  addAll,
  toggleBack,
  handleCropChange,
  toggleCropTimeMethod,
  changeDuration,
  handleFieldChange,
  state,
  cropTotalTimeAssign,
  resetCropDuration,
  defaultCrops,
}) {
  const [duration, _setDuration] = useState({ hours: 0, minutes: 0 });
  const [selectedCrops, setSelectedCrops] = useState();
  const [selectedFields, setSelectedFields] = useState();
  const [innerCropDurations, setCropDurations] = useState({
    [task.task_id]: { hours: '', minutes: '' },
  });
  const [fieldDuration, setFieldDuration] = useState({ hours: '', minutes: '' });
  const { t } = useTranslation();
  const setDuration = (value) => {
    _setDuration(value > 0 ? value : '');
  };

  const onDurationChange = (duration, task_id) => {
    setDuration(duration);
    cropTotalTimeAssign(duration, task_id);
  };

  const resetCrops = () => {
    setCropDurations({
      [task.task_id]: {
        hours: '',
        minutes: '',
        ...defaultCrops[task.task_id]?.reduce(
          (obj, opt) => ({ [opt.value]: { hours: '', minutes: '' }, ...obj }),
          {},
        ),
      },
    });
  };

  useEffect(() => {
    resetCrops();
  }, []);

  useEffect(() => {
    setSelectedCrops(defaultCrops[task.task_id]);
    resetCrops();
  }, [defaultCrops]);

  const checkAndGetNumber = (val) => (!!val ? parseInt(val) : 0);

  const getHoursAndMinutes = (hourValue, minuteValue) => {
    const hours = checkAndGetNumber(hourValue);
    const minutes = checkAndGetNumber(minuteValue);
    return { hours, minutes };
  };

  const onFieldChangeDuration = ({ hours, minutes }) => {
    const durationInMinutes = minutes + hours * 60;
    setFieldDuration({ hours, minutes });
    changeDuration({ target: { value: durationInMinutes } }, task.task_id, false);
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
              <Button
                onClick={() => {
                  addAll(task.task_id, 'crop', duration);
                }}
                sm={true}
              >
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
          <Select
            isMulti
            isSearchable={false}
            name="selectByCrops"
            placeholder="Select Crops..."
            options={state.cropOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            value={selectedCrops}
            onChange={(selectedOption) => {
              defaultCrops[task.task_id] && setSelectedCrops(selectedOption);
              handleCropChange(selectedOption, 0, task.task_id);
              setCropDurations({
                [task.task_id]: {
                  hours: '',
                  minutes: '',
                  ...selectedOption?.reduce(
                    (obj, opt) => ({ [opt.value]: { hours: '', minutes: '' }, ...obj }),
                    {},
                  ),
                },
              });
            }}
          />
        </div>
        {cropDurations && cropDurations[task.task_id] && (
          <div>
            <div className={styles.cropDurationType}>
              <button
                className="duration-btn-selected"
                onClick={() => {
                  toggleCropTimeMethod(task.task_id, true);
                }}
                id={'all-crop-' + task.task_id}
              >
                {t('SHIFT.EDIT_SHIFT.ALL_CROPS')}
              </button>
              <button
                className="duration-btn-unselected"
                onClick={() => {
                  resetCropDuration(task.task_id);
                  toggleCropTimeMethod(task.task_id, false);
                  setDuration(0);
                }}
                id={'indy-crop-' + task.task_id}
              >
                {t('SHIFT.EDIT_SHIFT.INDIVIDUAL_CROPS')}
              </button>
            </div>
            <div className={styles.cropDurationContainer} id={'allduration-' + task.task_id}>
              {cropDurations[task.task_id]?.map((cd) => {
                return (
                  innerCropDurations[task.task_id][cd.crop_id] && (
                    <div className={styles.durationContainer} key={cd.crop_id}>
                      <div>{cd.crop_name}</div>
                      <div className={styles.durationInput}>
                        <div style={{ flexGrow: 2, order: 1 }}>
                          <input
                            type="number"
                            value={innerCropDurations[task.task_id][cd.crop_id].hours}
                            onKeyDown={integerOnKeyDown}
                            onChange={(event) => {
                              const { hours, minutes } = getHoursAndMinutes(
                                event.target.value,
                                innerCropDurations[task.task_id][cd.crop_id].minutes,
                              );
                              const durationInMinutes = hours * 60 + minutes;
                              setCropDurations({
                                [task.task_id]: {
                                  ...innerCropDurations[task.task_id],
                                  [cd.crop_id]: {
                                    ...innerCropDurations[task.task_id][cd.crop_id],
                                    hours,
                                  },
                                },
                              });
                              changeDuration(
                                { target: { value: durationInMinutes } },
                                task.task_id,
                                true,
                                cd.crop_id,
                                setDuration,
                              );
                            }}
                          />
                        </div>
                        <div
                          style={{ flexGrow: 1, order: 2, marginLeft: '5px', marginRight: '5px' }}
                        >
                          <Label style={{ marginTop: '12px' }}>hr</Label>
                        </div>
                        <div style={{ flexGrow: 2, order: 3 }}>
                          <input
                            type="number"
                            onKeyDown={integerOnKeyDown}
                            value={innerCropDurations[task.task_id][cd.crop_id].minutes}
                            onChange={(event) => {
                              const { hours, minutes } = getHoursAndMinutes(
                                innerCropDurations[task.task_id][cd.crop_id].hours,
                                event.target.value,
                              );
                              const durationInMinutes = minutes + hours * 60;
                              setCropDurations({
                                [task.task_id]: {
                                  ...innerCropDurations[task.task_id],
                                  [cd.crop_id]: {
                                    ...innerCropDurations[task.task_id][cd.crop_id],
                                    minutes,
                                  },
                                },
                              });
                              changeDuration(
                                { target: { value: durationInMinutes } },
                                task.task_id,
                                true,
                                cd.crop_id,
                                setDuration,
                              );
                            }}
                          />
                        </div>
                        <div
                          style={{ flexGrow: 1, order: 4, marginLeft: '5px', marginRight: '5px' }}
                        >
                          <Label style={{ marginTop: '12px' }}>mins</Label>
                        </div>
                      </div>
                    </div>
                  )
                );
              })}
            </div>
            <div id={'singleduration-' + task.task_id}>
              <div className={styles.durationContainer}>
                <div>Total</div>
                <div className={styles.durationInput}>
                  <div style={{ flexGrow: 2, order: 1 }}>
                    <input
                      id={'total_crop_input-1' + task.task_id}
                      value={innerCropDurations[task.task_id].hours}
                      type="number"
                      placeholder={0}
                      onKeyDown={integerOnKeyDown}
                      onChange={(event) => {
                        const { hours, minutes } = getHoursAndMinutes(
                          event.target.value,
                          innerCropDurations[task.task_id].minutes,
                        );
                        const durationInMinutes = hours * 60 + minutes;
                        setCropDurations({
                          [task.task_id]: { ...innerCropDurations[task.task_id], hours },
                        });
                        onDurationChange(durationInMinutes, task.task_id);
                      }}
                    />
                  </div>
                  <div style={{ flexGrow: 1, order: 2, marginLeft: '5px', marginRight: '5px' }}>
                    <Label style={{ marginTop: '12px' }}>hr</Label>
                  </div>
                  <div style={{ flexGrow: 2, order: 3 }}>
                    <input
                      id={'total_crop_input-' + task.task_id}
                      value={innerCropDurations[task.task_id].minutes}
                      type="number"
                      placeholder={0}
                      onKeyDown={integerOnKeyDown}
                      onChange={(event) => {
                        const { hours, minutes } = getHoursAndMinutes(
                          innerCropDurations[task.task_id].hours,
                          event.target.value,
                        );
                        const durationInMinutes = hours * 60 + minutes;
                        setCropDurations({
                          [task.task_id]: { ...innerCropDurations[task.task_id], minutes },
                        });
                        onDurationChange(durationInMinutes, task.task_id);
                      }}
                    />
                  </div>
                  <div style={{ flexGrow: 1, order: 4, marginLeft: '5px', marginRight: '5px' }}>
                    <Label style={{ marginTop: '12px' }}>mins</Label>
                  </div>
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
              <Button sm onClick={() => addAll(task.task_id, 'field')}>
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
            <div style={{ flexGrow: 3, order: 1 }}>
              <input
                id={'input-field-1' + task.task_id}
                type="number"
                onKeyDown={integerOnKeyDown}
                value={fieldDuration.hours}
                onChange={(event) => {
                  onFieldChangeDuration(
                    getHoursAndMinutes(event.target.value, fieldDuration.minutes),
                  );
                }}
              />
            </div>
            <div style={{ flexGrow: 1, order: 2, marginLeft: '5px', marginRight: '5px' }}>
              <Label style={{ marginTop: '12px' }}>hr</Label>
            </div>
            <div style={{ flexGrow: 3, order: 3 }}>
              <input
                id={'input-field-' + task.task_id}
                type="number"
                onKeyDown={integerOnKeyDown}
                value={fieldDuration.minutes}
                onChange={(event) => {
                  onFieldChangeDuration(
                    getHoursAndMinutes(fieldDuration.hours, event.target.value),
                  );
                }}
              />
            </div>
            <div style={{ flexGrow: 1, order: 4, marginLeft: '5px', marginRight: '5px' }}>
              <Label style={{ marginTop: '12px' }}>min</Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MoodPopup({
  closeEditModal,
  showEditModal,
  mood,
  setMood,
  finish,
  isCurrentShiftUser,
  isEO,
}) {
  const { t } = useTranslation();
  const setNotProvided = (event) => {
    setMood(event.currentTarget.checked ? 'no answer' : null);
  };
  return (
    <Popup
      open={showEditModal}
      closeOnDocumentClick
      onClose={closeEditModal}
      contentStyle={{
        display: 'flex',
        width: '100%',
        height: '100vh',
        overflowY: 'auto',
        padding: '0 5%',
      }}
      overlayStyle={{ zIndex: '1060', height: '100vh' }}
    >
      <div className={styles.modal}>
        <div className={styles.popupTitle}>
          <a className={styles.close} onClick={closeEditModal}>
            <img src={closeButton} alt="" />
          </a>
        </div>
        <h3>
          {!isCurrentShiftUser && isEO
            ? t('SHIFT.EDIT_SHIFT.WORKER_MOOD')
            : t('SHIFT.EDIT_SHIFT.MOOD')}
        </h3>

        <div
          style={{
            marginLeft: 0,
            marginRight: 0,
            padding: '0 3%',
            marginTop: '5%',
            width: '100%',
          }}
        >
          <div className={styles2.matrixContainer}>
            <MoodFace
              currentMood={mood}
              face={'😃'}
              mood={'happy'}
              setMood={() => setMood('happy')}
            >
              {t('SHIFT.EDIT_SHIFT.HAPPY')}
            </MoodFace>
            <MoodFace
              currentMood={mood}
              face={'😆'}
              mood={'very happy'}
              setMood={() => setMood('very happy')}
            >
              {t('SHIFT.EDIT_SHIFT.VERY_HAPPY')}
            </MoodFace>
            <MoodFace
              currentMood={mood}
              face={'😕'}
              mood={'neutral'}
              setMood={() => setMood('neutral')}
            >
              {t('SHIFT.EDIT_SHIFT.NEUTRAL')}
            </MoodFace>
            <MoodFace currentMood={mood} face={'😢'} mood={'sad'} setMood={() => setMood('sad')}>
              {t('SHIFT.EDIT_SHIFT.SAD')}
            </MoodFace>
            <MoodFace
              currentMood={mood}
              face={'😭'}
              mood={'very sad'}
              setMood={() => setMood('very sad')}
            >
              {t('SHIFT.EDIT_SHIFT.VERY_SAD')}
            </MoodFace>
            <MoodFace currentMood={mood} face={'🤭'} mood={'na'} setMood={() => setMood('na')}>
              {t('SHIFT.EDIT_SHIFT.RATHER_NOT_SAY')}
            </MoodFace>
          </div>
        </div>
        {!isCurrentShiftUser && isEO && (
          <div className={styles.buttonContainer}>
            <Checkbox
              checked={mood === 'no answer'}
              onChange={setNotProvided}
              label={t('SHIFT.EDIT_SHIFT.DID_NOT_PROVIDE_ANSWER')}
            />
          </div>
        )}
        <div className={styles.buttonContainer}>
          <Button onClick={() => finish()} disabled={mood === null}>
            {t('common:FINISH')}
          </Button>
        </div>
      </div>
    </Popup>
  );
}

function MoodFace({ mood, currentMood, face, setMood, children }) {
  return (
    <div className={styles2.matrixItem} onClick={setMood}>
      <div className={styles.moodContainer}>
        <div className={clsx(styles2.moodUnSelected, currentMood === mood && styles2.moodSelected)}>
          <h2>{face}</h2>
        </div>
      </div>
      <p>{children}</p>
    </div>
  );
}

export default PureStepTwo;
