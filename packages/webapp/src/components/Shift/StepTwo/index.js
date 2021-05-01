import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import Button from '../../Form/Button';
import TitleLayout from '../../Layout/TitleLayout';
import styles from '../../../containers/Shift/styles.module.scss';
import styles2 from './styles.module.scss';
import cropImg from '../../../assets/images/log/crop_white.svg';
import fieldImg from '../../../assets/images/log/field_white.svg';
import Checkbox from '../../Form/Checkbox';
import { Label } from '../../Typography';
import TimeSlider from '../../Form/Slider/TimeSlider';
import MuiFullPagePopup from '../../MuiFullPagePopup';
import PageTitle from '../../PageTitle/v2';

function PureStepTwo({
  onGoBack,
  onNext,
  onCancel,
  isCurrentShiftUser,
  finalForm,
  setFinalForm,
  cropDurations,
  setCropDurations,
  mood,
  setMood,
  crops,
  locations,
  selectedTasks,
  isEO,
}) {
  const { t } = useTranslation(['translation', 'crop', 'common', 'task']);
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

    for (let location of locations) {
      availableFieldOptions.push({ label: location.name, value: location.location_id });
    }
    setFieldOptions(availableFieldOptions);
    setCropOptions(availableCropOptions);
  }, []);

  useEffect(() => {
    const keys = Object.keys(finalForm);
    const cropsHaveValidDurations = keys.reduce((cond, k) => {
      if (finalForm[k].is_location) {
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
        ((finalForm[k].is_location && finalForm[k].duration > 0) || !finalForm[k].is_location),
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
    mutatingFinalForm[task_id].is_location = false;
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
    let mutatingFinalForm = JSON.parse(JSON.stringify(finalForm));
    mutatingFinalForm[task_id].is_location = true;
    mutatingFinalForm[task_id].val = [];
    if (selectedOption) {
      for (let option of selectedOption) {
        mutatingFinalForm[task_id].val.push({ id: option.value });
      }
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
      mutatingDefaultFields[task_id] = locations.map(({ location_id, name }) => ({
        value: location_id,
        label: name,
      }));
      handleFieldChange(
        mutatingDefaultFields[task_id].map(({ value }) => ({ value })),
        task_id,
      );
      setDefaultFields({ ...mutatingDefaultFields });
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
    let mutatingFinalForm = JSON.parse(JSON.stringify(finalForm));

    const mutatingCropDurations = JSON.parse(JSON.stringify(cropDurations));
    if (mutatingFinalForm && mutatingFinalForm[task_id]) {
      mutatingFinalForm[task_id] = {};
    }
    if (mutatingCropDurations && mutatingCropDurations[task_id]) {
      mutatingCropDurations[task_id] = [];
    }
    const mutatedDefaultCrops = JSON.parse(JSON.stringify(defaultCrops));
    mutatedDefaultCrops[task_id] = [];
    setDefaultCrops(mutatedDefaultCrops);
    setCropDurations(mutatingCropDurations);
    setFinalForm(mutatingFinalForm);
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
      onCancel={onCancel}
      title={t('SHIFT.NEW_SHIFT.STEP_TWO')}
      buttonGroup={
        <>
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
          state={{ cropOptions, fieldOptions }}
          defaultCrops={defaultCrops}
          defaultFields={defaultFields}
          toggleBack={toggleBack}
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
  changeDuration,
  handleFieldChange,
  state,
  cropTotalTimeAssign,
  resetCropDuration,
  defaultCrops,
  defaultFields,
}) {
  const [duration, _setDuration] = useState({ hours: 0, minutes: 0 });
  const [selectedCrops, setSelectedCrops] = useState();
  const [selectedFields, setSelectedFields] = useState();
  const [innerCropDurations, setCropDurations] = useState({
    [task.task_id]: { hours: '', minutes: '' },
  });
  const [allCropsEnabled, setAllCropsEnabled] = useState(true);
  const { t } = useTranslation(['translation', 'crop', 'common', 'task']);
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

  useEffect(() => {
    setSelectedFields(defaultFields[task.task_id]);
  }, [defaultFields]);

  const onFieldChangeDuration = (durationInMinutes) => {
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
            <div className={styles.whiteText}>{t('SHIFT.EDIT_SHIFT.CROPS')}</div>
          </div>
          <div
            className={styles.fieldButton}
            onClick={() => toggleCropOrField(task.task_id, 'field')}
          >
            <img src={fieldImg} alt="" />
            <div className={styles.whiteText}>{t('SHIFT.EDIT_SHIFT.LOCATIONS')}</div>
          </div>
        </div>
      </div>
      <div className={styles.selectContainer} id={'crop' + task.task_id}>
        <div>
          <div className={styles.funcButtons}>
            <div className={styles.allButton}>
              <Button
                onClick={() => {
                  addAll(task.task_id, 'crop', duration);
                }}
                sm={true}
              >
                {t('SHIFT.EDIT_SHIFT.SELECT_ALL')}
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
              ←{t('common:BACK')}
            </div>
          </div>
        </div>
        <Label>{t('SHIFT.EDIT_SHIFT.CROPS_LABEL')}</Label>
        <div className={styles.selectInner}>
          <Select
            isMulti
            isSearchable={false}
            name="selectByCrops"
            placeholder={t('SHIFT.EDIT_SHIFT.SELECT_CROPS')}
            options={state.cropOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            value={selectedCrops}
            onChange={(selectedOption) => {
              defaultCrops[task.task_id] && setSelectedCrops(selectedOption);
              handleCropChange(selectedOption, 0, task.task_id);
            }}
          />
        </div>
        {cropDurations && cropDurations[task.task_id] && (
          <div>
            <div className={styles.cropDurationType}>
              <Button
                sm
                style={{ flex: '1', padding: '4px' }}
                onClick={() => {
                  setAllCropsEnabled(true);
                }}
              >
                {t('SHIFT.EDIT_SHIFT.ALL_CROPS')}
              </Button>
              <div style={{ flex: '0 0 2%' }} />
              <Button
                sm
                style={{ flex: '1', padding: '4px' }}
                onClick={() => {
                  resetCropDuration(task.task_id);
                  setAllCropsEnabled(false);
                  setDuration(0);
                }}
              >
                {t('SHIFT.EDIT_SHIFT.INDIVIDUAL_CROPS')}
              </Button>
            </div>
            {!allCropsEnabled && (
              <div className={styles.cropDurationContainer}>
                {cropDurations[task.task_id]?.map((cd) => {
                  return (
                    <div className={styles.durationContainer} key={cd.crop_id}>
                      <div className={styles.durationInput}>
                        <TimeSlider
                          label={cd.crop_name}
                          initialTime={120}
                          setValue={(durationInMinutes) => {
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
                    </div>
                  );
                })}
              </div>
            )}
            {allCropsEnabled && (
              <div>
                <div className={styles.durationContainer}>
                  <div className={styles.durationInput}>
                    <TimeSlider
                      initialTime={120}
                      label={t('SHIFT.TIME_TOTAL')}
                      setValue={(durationInMinutes) => {
                        onDurationChange(durationInMinutes, task.task_id);
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.selectContainer} id={'field' + task.task_id}>
        <div>
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
              ←{t('common:BACK')}
            </div>
          </div>
        </div>
        <Label>{t('SHIFT.EDIT_SHIFT.LOCATIONS_LABEL')}</Label>
        <div className={styles.selectInner}>
          <Select
            isMulti
            isSearchable={false}
            name="selectByFields"
            placeholder={t('SHIFT.EDIT_SHIFT.SELECT_FIELDS')}
            options={state.fieldOptions}
            className="basic-multi-select"
            classNamePrefix="select"
            value={selectedFields}
            onChange={(selectedOption) => {
              setSelectedFields(selectedOption);
              handleFieldChange(selectedOption, task.task_id);
            }}
          />
        </div>
        {selectedFields?.length ? (
          <div className={styles.durationContainer}>
            <div className={styles.durationInput}>
              <TimeSlider
                initialTime={120}
                label={t('SHIFT.MY_SHIFT.DURATION')}
                setValue={onFieldChangeDuration}
              />
            </div>
          </div>
        ) : null}
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
  const { t } = useTranslation(['translation', 'crop', 'common', 'task']);
  const setNotProvided = (event) => {
    setMood(event.currentTarget.checked ? 'no answer' : null);
  };
  return (
    <MuiFullPagePopup open={showEditModal} onClose={closeEditModal}>
      <div className={styles.modal}>
        <div style={{ width: '90%', padding: '0 16px', margin: '0 5%' }}>
          <PageTitle
            title={
              !isCurrentShiftUser && isEO
                ? t('SHIFT.EDIT_SHIFT.WORKER_MOOD')
                : t('SHIFT.EDIT_SHIFT.MOOD')
            }
            onGoBack={closeEditModal}
          />
        </div>

        <div
          style={{
            marginLeft: 0,
            marginRight: 0,
            padding: '0',
            marginTop: '5%',
            width: '100%',
          }}
        >
          <div className={styles2.matrixContainer}>
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
              face={'😃'}
              mood={'happy'}
              setMood={() => setMood('happy')}
            >
              {t('SHIFT.EDIT_SHIFT.HAPPY')}
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
        <div className={styles.buttonContainer} style={{ paddingTop: '24px' }}>
          <Button onClick={() => finish()} disabled={mood === null}>
            {t('common:FINISH')}
          </Button>
        </div>
      </div>
    </MuiFullPagePopup>
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
