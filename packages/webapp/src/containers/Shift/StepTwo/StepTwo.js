import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userFarmSelector } from "../../userFarmSlice";
import { stepOneSelector } from "../../shiftSlice";
import PureStepTwo from "../../../components/Shift/StepTwo";
import { toastr } from "react-redux-toastr";
import history from "../../../history";
import { submitShift } from "../actions";
import { currentFieldCropsSelector } from "../../fieldCropSlice";
import { useTranslation } from "react-i18next";
import { fieldsSelector } from "../../fieldSlice";
import PureStepOne from "../../../components/Shift/StepOne";

function StepTwo() {
  const { t } = useTranslation();
  const [allowedToSetMood, allowMoodChange] = useState(false);
  const [finalForm, setFinalForm] = useState({});
  const [cropDurations, setCropDurations] = useState({});
  const [mood, setMood] = useState(null);
  const crops = useSelector(currentFieldCropsSelector);
  const users = useSelector(userFarmSelector);
  const fields = useSelector(fieldsSelector);

  const dispatch = useDispatch();

  const { selectedTasks, worker, shift_date } = useSelector(stepOneSelector);


  useEffect(() => {
    let mutateFinalForm = {};
    for (let task of selectedTasks) {
      mutateFinalForm[task.task_id] = {
        is_field: false,
        val: [],
        duration: 0,
      };
    }
    setFinalForm(mutateFinalForm);
    isCurrentUserInShift();
  }, [])

  const finishShift = () => {
    let mutatingFinalForm = { ...finalForm };
    let usersObj = { ...worker };
    let form = {
      user_id: usersObj.user_id,
      wage_at_moment: Number(usersObj.wage.amount),
      mood: mood || 'na',
      shift_date,
      tasks: [],
    };


    let keys = Object.keys(mutatingFinalForm);
    // key here is task_id
    // keys.map()
    for (let key of keys) {
      let vals = mutatingFinalForm[key].val;
      let is_field = mutatingFinalForm[key].is_field;
      let val_num = vals.length;
      if (val_num === 0) {
        toastr.error(t('message:SHIFT.ERROR.CROP_FIELDS_EACH'));
        return;
      }
      let valIterator = 0;
      for (let val of vals) {
        if (is_field) {
          if (!Number.isInteger(Number(mutatingFinalForm[key].duration))) {
            toastr.error(t('message:SHIFT.ERROR.ONLY_INTEGERS_DURATIONS'));
            return;
          }

          let duration = Number(parseFloat(Number(mutatingFinalForm[key].duration) / val_num).toFixed(3));
          if (valIterator === val_num - 1) {
            if (duration * val_num !== Number(mutatingFinalForm[key].duration)) {
              duration = Number(mutatingFinalForm[key].duration) - duration * (val_num - 1);
            }
          }
          // duration / # of crops on field
          let crop_num = 0;
          let crops_on_field = [];
          let cropsCopy = [...crops] ;
          for (let crop of cropsCopy) {
            if (crop.field_id === val.id) {
              crop_num++;
              crops_on_field.push(crop);
            }
          }

          if (crop_num === 0) {
            form.tasks.push({
              task_id: Number(key),
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
                task_id: Number(key),
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
          if (cropDurations.hasOwnProperty(key)) {
            for (let cdObj of cropDurations[key]) {
              if (Number(cdObj.duration) === 0) {
                toastr.error(t('message:SHIFT.ERROR.DURATION_FOR_CROPS'));
                return;
              }
              if (!Number.isInteger(Number(cdObj.duration))) {
                toastr.error(t('message:SHIFT.ERROR.ONLY_INTEGERS_DURATIONS'));
                return;
              }
              if (cdObj.crop_id === val.id) {
                subDuration = cdObj.duration;
              }
            }
          } else {
            toastr.error(t('message:SHIFT.ERROR.SUBMIT_SHIFT'));
            return;
          }

          let cropsCopy = [...crops ];
          let crop_arr = [];
          for (let crop of cropsCopy) {
            if (crop.crop_id === val.id) {
              crop_arr.push(crop);
            }
          }
          subDuration = subDuration / crop_arr.length;

          for (let a_crop of crop_arr) {
            form.tasks.push({
              task_id: Number(key),
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

    dispatch(submitShift(form));
  }

  const isCurrentUserInShift = () => {
    allowMoodChange(users.role_id === 5 || worker.user_id === users.user_id);
  };

  return (
    <PureStepTwo indicateMood={allowedToSetMood} cropDurations={cropDurations} setCropDurations={setCropDurations} mood={mood} setMood={setMood}
                 finalForm={finalForm} setFinalForm={setFinalForm} crops={crops} fields={fields} selectedTasks={selectedTasks}
                 onNext={finishShift} onGoBack={() => history.push('/shift_step_one')}  />
  )
}

export default StepTwo;