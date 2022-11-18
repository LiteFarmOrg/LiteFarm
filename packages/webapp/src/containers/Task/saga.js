import { all, call, put, select, takeLatest, takeLeading } from 'redux-saga/effects';
import { createAction } from '@reduxjs/toolkit';
import apiConfig from '../../apiConfig';
import { axios, getHeader, getPlantingManagementPlansSuccessSaga, onReqSuccessSaga } from '../saga';
import i18n from '../../locales/i18n';
import { loginSelector } from '../userFarmSlice';
import history from '../../history';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../Snackbar/snackbarSlice';
import { addManyTasksFromGetReq, putTasksSuccess, putTaskSuccess } from '../taskSlice';
import { getProductsSuccess, onLoadingProductFail, onLoadingProductStart } from '../productSlice';
import {
  deleteTaskTypeSuccess,
  getTaskTypesSuccess,
  taskTypeEntitiesSelector,
  taskTypeSelector,
} from '../taskTypeSlice';
import { pick } from '../../util/pick';
import produce from 'immer';
import { getObjectInnerValues } from '../../util';
import {
  getCleaningTasksSuccess,
  onLoadingCleaningTaskFail,
  onLoadingCleaningTaskStart,
} from '../slice/taskSlice/cleaningTaskSlice';
import {
  getFieldWorkTasksSuccess,
  onLoadingFieldWorkTaskFail,
  onLoadingFieldWorkTaskStart,
} from '../slice/taskSlice/fieldWorkTaskSlice';
import {
  getPestControlTasksSuccess,
  onLoadingPestControlTaskFail,
  onLoadingPestControlTaskStart,
} from '../slice/taskSlice/pestControlTaskSlice';
import {
  getSoilAmendmentTasksSuccess,
  onLoadingSoilAmendmentTaskFail,
  onLoadingSoilAmendmentTaskStart,
} from '../slice/taskSlice/soilAmendmentTaskSlice';
import {
  getHarvestTasksSuccess,
  onLoadingHarvestTaskFail,
  onLoadingHarvestTaskStart,
} from '../slice/taskSlice/harvestTaskSlice';
import {
  getPlantTasksSuccess,
  onLoadingPlantTaskFail,
  onLoadingPlantTaskStart,
} from '../slice/taskSlice/plantTaskSlice';
import {
  getTransplantTasksSuccess,
  onLoadingTransplantTaskFail,
  onLoadingTransplantTaskStart,
} from '../slice/taskSlice/transplantTaskSlice';
import { getPlantingMethodReqBody } from '../Crop/AddManagementPlan/ManagementPlanName/getManagementPlanReqBody';

import {
  getHarvestUseTypesSuccess,
  onLoadingHarvestUseTypeFail,
  onLoadingHarvestUseTypeStart,
} from '../harvestUseTypeSlice';
import { managementPlanWithCurrentLocationEntitiesSelector } from './TaskCrops/managementPlansWithLocationSelector';

const taskTypeEndpoint = [
  'cleaning_task',
  'field_work_task',
  'pest_control_task',
  'soil_amendment_task',
  'harvest_tasks',
];

export const getProducts = createAction('getProductsSaga');

export function* getProductsSaga() {
  const { productsUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingProductStart());
    const result = yield call(axios.get, `${productsUrl}/farm/${farm_id}`, header);
    yield put(getProductsSuccess(result.data));
  } catch (e) {
    yield put(onLoadingProductFail());
    console.log('failed to fetch field crops by date');
  }
}

export const assignTask = createAction('assignTaskSaga');

export function* assignTaskSaga({ payload: { task_id, assignee_user_id } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/assign/${task_id}`,
      { assignee_user_id: assignee_user_id },
      header,
    );
    yield put(putTaskSuccess({ assignee_user_id, task_id }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const assignTasksOnDate = createAction('assignTaskOnDateSaga');

export function* assignTaskOnDateSaga({ payload: { task_id, date, assignee_user_id } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/assign_all_tasks_on_date/${task_id}`,
      { assignee_user_id: assignee_user_id, date: date },
      header,
    );
    let modified_tasks = [];
    for (let i = 0; i < result.data.length; i++) {
      modified_tasks.push({
        id: result.data[i].task_id,
        changes: { assignee_user_id },
      });
    }
    yield put(putTasksSuccess(modified_tasks));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const changeTaskDate = createAction('changeTaskDateSaga');

export function* changeTaskDateSaga({ payload: { task_id, due_date } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/patch_due_date/${task_id}`,
      { due_date },
      header,
    );

    yield put(putTaskSuccess({ due_date, task_id }));
    yield put(enqueueSuccessSnackbar(i18n.t('message:ASSIGN_TASK.SUCCESS')));
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:ASSIGN_TASK.ERROR')));
  }
}

export const getPlantingTasksAndPlantingManagementPlansSuccess = createAction(
  'getPlantingTasksAndPlantingManagementPlansSuccessSaga',
);

export function* getPlantingTasksAndPlantingManagementPlansSuccessSaga({ payload: tasks }) {
  yield put(
    getPlantTasksSuccess(
      tasks.map((task) => ({
        ...task,
        planting_management_plan_id:
          task.planting_management_plan_id ||
          task.planting_management_plan.planting_management_plan_id,
      })),
    ),
  );
  yield all([
    getPlantingManagementPlansSuccessSaga({
      payload: tasks
        .map((task) => task.planting_management_plan)
        .filter((planting_management_plan) => planting_management_plan),
    }),
  ]);
}

export const getTransplantTasksAndPlantingManagementPlansSuccess = createAction(
  'getTransplantTasksAndPlantingManagementPlansSuccessSaga',
);

export function* getTransplantTasksAndPlantingManagementPlansSuccessSaga({ payload: tasks }) {
  yield put(
    getTransplantTasksSuccess(
      tasks.map((task) => ({
        ...task,
        planting_management_plan_id:
          task.planting_management_plan_id ||
          task.planting_management_plan.planting_management_plan_id,
      })),
    ),
  );
  yield call(getPlantingManagementPlansSuccessSaga, {
    payload: tasks
      .map((task) => task.planting_management_plan)
      .filter((planting_management_plan) => planting_management_plan),
  });
}

// TODO: fix call(getTransplantTasksAndPlantingManagementPlansSuccessSaga) racing condition walk around
const taskTypeActionMap = {
  CLEANING_TASK: {
    success: (tasks) => put(getCleaningTasksSuccess(tasks)),
    fail: onLoadingCleaningTaskFail,
  },
  FIELD_WORK_TASK: {
    success: (tasks) => put(getFieldWorkTasksSuccess(tasks)),
    fail: onLoadingFieldWorkTaskFail,
  },
  PEST_CONTROL_TASK: {
    success: (tasks) => put(getPestControlTasksSuccess(tasks)),
    fail: onLoadingPestControlTaskFail,
  },
  SOIL_AMENDMENT_TASK: {
    success: (tasks) => put(getSoilAmendmentTasksSuccess(tasks)),
    fail: onLoadingSoilAmendmentTaskFail,
  },
  HARVEST_TASK: {
    success: (tasks) => put(getHarvestTasksSuccess(tasks)),
    fail: onLoadingHarvestTaskFail,
  },
  PLANT_TASK: {
    success: (tasks) =>
      call(getPlantingTasksAndPlantingManagementPlansSuccessSaga, { payload: tasks }),
    fail: onLoadingPlantTaskFail,
  },
  TRANSPLANT_TASK: {
    success: (tasks) =>
      call(getTransplantTasksAndPlantingManagementPlansSuccessSaga, { payload: tasks }),
    fail: onLoadingTransplantTaskFail,
  },
};

export const onLoadingTaskStart = createAction('onLoadingTaskStartSaga');

export function* onLoadingTaskStartSaga() {
  yield put(onLoadingCleaningTaskStart());
  yield put(onLoadingFieldWorkTaskStart());
  yield put(onLoadingPestControlTaskStart());
  yield put(onLoadingSoilAmendmentTaskStart());
  yield put(onLoadingHarvestTaskStart());
  yield put(onLoadingPlantTaskStart());
  yield put(onLoadingTransplantTaskStart());
}

export function* getTasksSuccessSaga({ payload: tasks }) {
  const taskTypeEntities = yield select(taskTypeEntitiesSelector);
  const tasksByTranslationKeyDefault = Object.keys(taskTypeActionMap).reduce(
    (tasksByTranslationKeyDefault, task_translation_key) => {
      tasksByTranslationKeyDefault[task_translation_key] = [];
      return tasksByTranslationKeyDefault;
    },
    {},
  );
  const tasksByTranslationKey = tasks.reduce((tasksByTranslationKey, task) => {
    const { task_translation_key } = taskTypeEntities[task.task_type_id];
    if (taskTypeActionMap[task_translation_key]) {
      tasksByTranslationKey[task_translation_key].push(task[task_translation_key.toLowerCase()]);
    }
    return tasksByTranslationKey;
  }, tasksByTranslationKeyDefault);
  for (const task_translation_key in taskTypeActionMap) {
    try {
      yield taskTypeActionMap[task_translation_key].success(
        tasksByTranslationKey[task_translation_key],
      );
    } catch (e) {
      yield put(taskTypeActionMap[task_translation_key].fail(e));
      console.log(e);
    }
  }
  yield put(addManyTasksFromGetReq(tasks));
}

export const getTasks = createAction('getTasksSaga');

export function* getTasksSaga() {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    yield put(onLoadingTaskStart());
    const result = yield call(axios.get, `${taskUrl}/${farm_id}`, header);
    yield call(getTasksSuccessSaga, { payload: result.data });
  } catch (e) {
    console.log(e);
  }
}

const getPostTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  return getObjectInnerValues(
    produce(data, (data) => {
      const propertiesToRemove = taskTypeEndpoint.filter((taskType) => taskType !== endpoint);
      for (const key of propertiesToRemove) {
        delete data[key];
      }
      data.wage_at_moment = data.override_hourly_wage ? data.wage_at_moment : null;
      data.managementPlans = data.managementPlans?.map(({ management_plan_id }) => ({
        planting_management_plan_id:
          managementPlanWithCurrentLocationEntities[management_plan_id].planting_management_plan
            .planting_management_plan_id,
      }));
      delete data['show_wild_crop'];
    }),
  );
};

const getPostHarvestTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  return data.harvest_tasks.map((harvest_task) => {
    const { location_id, management_plan_id } = harvest_task;
    return getObjectInnerValues({
      harvest_task: {
        ...harvest_task,
        location_id: undefined,
        management_plan_id: undefined,
        id: undefined,
        notes: undefined,
      },
      ...pick(
        data,
        Object.keys(data).filter(
          (key) => ![...taskTypeEndpoint, 'override_hourly_wage'].includes(key),
        ),
      ),
      wage_at_moment: data.override_hourly_wage ? data.wage_at_moment : undefined,
      locations: location_id === 'PIN_LOCATION' ? undefined : [{ location_id }],
      managementPlans: [
        {
          planting_management_plan_id:
            managementPlanWithCurrentLocationEntities[management_plan_id].planting_management_plan
              .planting_management_plan_id,
        },
      ],
      notes: harvest_task.notes,
      show_wild_crop: undefined,
    });
  });
};

const getTransplantTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  const management_plan_id = data.managementPlans[0].management_plan_id;
  return produce(
    getPostTaskBody(data, 'transplant_task', managementPlanWithCurrentLocationEntities),
    (data) => {
      data.transplant_task.planting_management_plan.location_id = data.locations[0].location_id;
      data.transplant_task.prev_planting_management_plan_id =
        managementPlanWithCurrentLocationEntities[
          management_plan_id
        ].planting_management_plan.planting_management_plan_id;
      data.transplant_task.planting_management_plan = getPlantingMethodReqBody(
        data.transplant_task.planting_management_plan,
        { management_plan_id },
      );
      delete data.crop_management_plan;
      delete data.managementPlans;
      delete data.locations;
    },
  );
};

const getIrrigationTaskBody = (data, endpoint, managementPlanWithCurrentLocationEntities) => {
  const managementPlans = data.managementPlans.map(
    (managementPlan) => managementPlan.management_plan_id,
  );
  const irrigation_task_type =
    data.irrigation_task_type.value !== 'OTHER'
      ? data.irrigation_task_type.value
      : data.irrigation_task_type_other;
  const set_default_irrigation_task_location = data.set_default_irrigation_task_type_location;
  const set_default_irrigation_task_type_measurement =
    data.set_default_irrigation_task_type_measurement;
  const default_flow_rate = data.default_location_flow_rate;
  const flow_rate = data.estimated_flow_rate;
  const flow_rate_unit = data.estimated_flow_rate_unit;
  const default_application_depth = data.default_location_application_depth;
  const application_depth = data.application_depth;
  const application_depth_unit = data.application_depth_unit;
  return produce(
    getPostTaskBody(data, 'irrigation_task', managementPlanWithCurrentLocationEntities),
    (data) => {
      data.managementPlans = managementPlans?.map((management_plan_id) => ({
        planting_management_plan_id:
          managementPlanWithCurrentLocationEntities[management_plan_id].planting_management_plan
            .planting_management_plan_id,
      }));
      data.irrigation_task = {
        type: irrigation_task_type,
        default_measuring_type:
          set_default_irrigation_task_type_measurement === true ? data.measurement_type : null,
      };
      data.location = {
        location_id: data.locations[0].location_id,
        irrigation_task_type,
        flow_rate,
        flow_rate_unit,
        application_depth,
        application_depth_unit,
        default_application_depth,
        default_flow_rate,
      };
      delete data.irrigation_task_type_other;
      delete data.crop_management_plan;
      delete data.locations;
      delete data.irrigation_task_type;
      delete data.set_default_irrigation_task_type_measurement;
      delete data.set_default_irrigation_task_type_location;
      delete data.set_default_location_flow_rate;
      delete data.irrigated_area;
      delete data.irrigated_area_unit;
      delete data.percentage_location_irrigated;
      delete data.percentage_location_irrigated_unit;
      delete data.estimated_irrigation_duration;
      delete data.estimated_irrigation_duration_unit;
      delete data.default_location_flow_rate;
      delete data.estimated_flow_rate;
      delete data.estimated_flow_rate_unit;
      delete data.application_depth_unit;
      delete data.application_depth;
      delete data.default_location_application_depth;
      delete data.location_size_unit;
    },
  );
};

const taskTypeGetPostTaskBodyFunctionMap = {
  CLEANING_TASK: getPostTaskBody,
  FIELD_WORK_TASK: getPostTaskBody,
  PEST_CONTROL_TASK: getPostTaskBody,
  SOIL_AMENDMENT_TASK: getPostTaskBody,
  HARVEST_TASK: getPostHarvestTaskBody,
  TRANSPLANT_TASK: getTransplantTaskBody,
  IRRIGATION_TASK: getIrrigationTaskBody,
};

const getPostTaskReqBody = (
  data,
  endpoint,
  task_translation_key,
  isCustomTask,
  managementPlanWithCurrentLocationEntities,
) => {
  if (isCustomTask)
    return getPostTaskBody(data, endpoint, managementPlanWithCurrentLocationEntities);
  return taskTypeGetPostTaskBodyFunctionMap[task_translation_key](
    data,
    endpoint,
    managementPlanWithCurrentLocationEntities,
  );
};

export const createTask = createAction('createTaskSaga');

export function* createTaskSaga({ payload }) {
  const { returnPath, ...data } = payload;

  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key, farm_id: task_farm_id } = yield select(
    taskTypeSelector(data.task_type_id),
  );

  const header = getHeader(user_id, farm_id);
  const isCustomTask = !!task_farm_id;
  const isHarvest = task_translation_key === 'HARVEST_TASK';
  const endpoint = isCustomTask
    ? 'custom_task'
    : isHarvest
    ? 'harvest_tasks'
    : task_translation_key.toLowerCase();
  try {
    const managementPlanWithCurrentLocationEntities = yield select(
      managementPlanWithCurrentLocationEntitiesSelector,
    );
    const result = yield call(
      axios.post,
      `${taskUrl}/${endpoint}`,
      getPostTaskReqBody(
        data,
        endpoint,
        task_translation_key,
        isCustomTask,
        managementPlanWithCurrentLocationEntities,
      ),
      header,
    );
    if (result) {
      yield call(getTasksSuccessSaga, { payload: isHarvest ? result.data : [result.data] });
      yield call(onReqSuccessSaga, {
        message: i18n.t('message:TASK.CREATE.SUCCESS'),
        pathname: returnPath ?? '/tasks',
      });
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.CREATE.FAILED')));
  }
}

//TODO: change req shape to {...task, harvestUses}
const getCompleteHarvestTaskBody = (data) => {
  let taskData = {};
  taskData.task = data.taskData;
  let harvest_uses = [];
  data.harvest_uses.forEach((harvest_use) => {
    harvest_uses.push({
      ...getObjectInnerValues(harvest_use),
    });
  });
  taskData.harvest_uses = harvest_uses;
  return taskData;
};

const getCompletePlantingTaskBody = (task_translation_key) => (data) => {
  return produce(data, (data) => {
    const taskType = task_translation_key.toLowerCase();
    const planting_management_plan = data?.taskData?.[taskType]?.planting_management_plan;
    if (planting_management_plan) {
      data.taskData[taskType].planting_management_plan =
        getPlantingMethodReqBody(planting_management_plan);
      data.taskData[taskType].planting_management_plan.planting_management_plan_id =
        data.taskData[taskType].planting_management_plan_id;
      delete data.taskData[taskType].planting_management_plan_id;
      delete data.taskData[taskType].prev_planting_management_plan;
    }
  }).taskData;
};

const taskTypeGetCompleteTaskBodyFunctionMap = {
  HARVEST_TASK: getCompleteHarvestTaskBody,
  TRANSPLANT_TASK: getCompletePlantingTaskBody('TRANSPLANT_TASK'),
  PLANT_TASK: getCompletePlantingTaskBody('PLANT_TASK'),
};

export const completeTask = createAction('completeTaskSaga');

export function* completeTaskSaga({ payload: { task_id, data, returnPath } }) {
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_translation_key, isCustomTaskType } = data;
  const header = getHeader(user_id, farm_id);
  const endpoint = isCustomTaskType ? 'custom_task' : task_translation_key.toLowerCase();
  const taskData = taskTypeGetCompleteTaskBodyFunctionMap[task_translation_key]
    ? taskTypeGetCompleteTaskBodyFunctionMap[task_translation_key](data)
    : data.taskData;
  try {
    const result = yield call(
      axios.patch,
      `${taskUrl}/complete/${endpoint}/${task_id}`,
      taskData,
      header,
    );
    if (result) {
      yield put(putTaskSuccess(result.data));
      yield call(onReqSuccessSaga, {
        message: i18n.t('message:TASK.COMPLETE.SUCCESS'),
        pathname: returnPath ?? '/tasks',
      });
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.COMPLETE.FAILED')));
  }
}

export const abandonTask = createAction('abandonTaskSaga');

export function* abandonTaskSaga({ payload: data }) {
  console.log(data);
  const { taskUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const { task_id, patchData, returnPath } = data;
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.patch, `${taskUrl}/abandon/${task_id}`, patchData, header);
    if (result) {
      yield put(putTaskSuccess(result.data));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK.ABANDON.SUCCESS')));
      history.push(returnPath ?? '/tasks');
    }
  } catch (e) {
    console.log(e);
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK.ABANDON.FAILED')));
  }
}

export const addCustomTaskType = createAction('addTaskTypeSaga');

export function* addTaskTypeSaga({ payload: data }) {
  const { taskTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  let { task_name } = data;
  const body = {
    task_name,
    farm_id: farm_id,
  };

  try {
    const result = yield call(axios.post, taskTypeUrl, body, header);
    if (result) {
      yield put(getTaskTypes());
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK_TYPE.CREATE.SUCCESS')));
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK_TYPE.CREATE.FAILED')));
  }
}

export const getTaskTypes = createAction('getTaskTypesSaga');

export function* getTaskTypesSaga() {
  const { taskTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(axios.get, `${taskTypeUrl}/farm/${farm_id}`, header);
    if (result) {
      yield put(getTaskTypesSuccess(result.data));
    }
  } catch (e) {
    console.log('failed to fetch task types from database');
  }
}

export const deleteTaskType = createAction('deleteTaskTypeSaga');

export function* deleteTaskTypeSaga({ payload: id }) {
  const { taskTypeUrl } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);
  try {
    const result = yield call(axios.delete, `${taskTypeUrl}/${id}`, header);
    if (result) {
      yield put(deleteTaskTypeSuccess(id));
      yield put(enqueueSuccessSnackbar(i18n.t('message:TASK_TYPE.DELETE.SUCCESS')));
      history.back();
    }
  } catch (e) {
    yield put(enqueueErrorSnackbar(i18n.t('message:TASK_TYPE.DELETE.FAILED')));
  }
}

export const getHarvestUseTypes = createAction('getHarvestUseTypesSaga');

export function* getHarvestUseTypesSaga() {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    yield put(onLoadingHarvestUseTypeStart());
    const result = yield call(axios.get, logURL + `/harvest_use_types/farm/${farm_id}`, header);
    if (result) {
      yield put(getHarvestUseTypesSuccess(result.data));
    }
  } catch (e) {
    console.log('failed to get harvest use types');
    yield put(onLoadingHarvestUseTypeFail());
    yield put(enqueueErrorSnackbar(i18n.t('message:LOG_HARVEST.ERROR.GET_TYPES')));
  }
}

export const addCustomHarvestUse = createAction('addCustomHarvestUseSaga');

export function* addCustomHarvestUseSaga({ payload: data }) {
  const { logURL } = apiConfig;
  let { user_id, farm_id } = yield select(loginSelector);
  const header = getHeader(user_id, farm_id);

  try {
    const result = yield call(
      axios.post,
      logURL + `/harvest_use_types/farm/${farm_id}`,
      data,
      header,
    );
    if (result) {
      // TODO - add postHarvestUseTypeSuccess
      yield put(getHarvestUseTypes());
      yield put(enqueueSuccessSnackbar(i18n.t('message:LOG_HARVEST.SUCCESS.ADD_USE_TYPE')));
    }
  } catch (e) {
    console.log('failed to add custom harvest use type');
    yield put(enqueueErrorSnackbar(i18n.t('message:LOG_HARVEST.ERROR.ADD_USE_TYPE')));
  }
}

export default function* taskSaga() {
  yield takeLeading(addCustomTaskType.type, addTaskTypeSaga);
  yield takeLeading(assignTask.type, assignTaskSaga);
  yield takeLeading(changeTaskDate.type, changeTaskDateSaga);
  yield takeLeading(createTask.type, createTaskSaga);
  yield takeLatest(getTaskTypes.type, getTaskTypesSaga);
  yield takeLeading(assignTasksOnDate.type, assignTaskOnDateSaga);
  yield takeLatest(getTasks.type, getTasksSaga);
  yield takeLeading(onLoadingTaskStart.type, onLoadingTaskStartSaga);
  yield takeLatest(getProducts.type, getProductsSaga);
  yield takeLeading(completeTask.type, completeTaskSaga);
  yield takeLeading(abandonTask.type, abandonTaskSaga);
  yield takeLeading(deleteTaskType.type, deleteTaskTypeSaga);
  yield takeLatest(getHarvestUseTypes.type, getHarvestUseTypesSaga);
  yield takeLeading(addCustomHarvestUse.type, addCustomHarvestUseSaga);
  yield takeLatest(
    getTransplantTasksAndPlantingManagementPlansSuccess.type,
    getTransplantTasksAndPlantingManagementPlansSuccessSaga,
  );
  yield takeLatest(
    getPlantingTasksAndPlantingManagementPlansSuccess.type,
    getPlantingTasksAndPlantingManagementPlansSuccessSaga,
  );
}
