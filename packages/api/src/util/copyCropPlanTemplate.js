// This file creates a template of what whould be omitted and what
// should be edited in the Management plan UPSERT GRAPH for the purpose of
// copying crop plans.

// TODO consider combining omit and edit
// OMIT: Should NOT be set on creation UPSERT GRAPH
// EDIT: Some or all should be provided on creation UPSERT GRAPH

// MANAGEMENT PLANS
export const omitKeysFromManagementPlan = [
  'management_plan_id',
  'complete_date',
  'abandon_date',
  'complete_notes',
  'rating',
  'abandon_reason',
];

export const editKeysFromManagementPlan = [
  'crop_management_plan',
  'notes',
  'name',
  'group_id',
  'repetition_number',
];

export const omitKeysFromCropManagementPlan = ['management_plan_id'];

export const editKeysFromCropManagementPlan = [
  'seed_date',
  'plant_date',
  'germination_date',
  'transplant_date',
  'harvest_date',
  'termination_date',
  'planting_management_plans',
];

export const omitKeysFromPlantingManagementPlan = ['management_plan_id'];

export const editKeysFromPlantingManagementPlan = [
  'planting_management_plan_id', //pre-generated due to transplant_task
  'location_id',
  'management_tasks',
  'plant_task',
  'transplant_task',
  'bed_method',
  'container_method',
  'broadcast_method',
  'row_method',
];

//TASKS
// Used on transplant task as well
export const omitKeysFromPlantTask = ['task_id'];

export const editKeysFromPlantTask = [
  'task',
  'planting_management_plan_id', //pre-generated due to transplant_task
];

export const omitKeysFromTransplantTask = omitKeysFromPlantTask;

export const editKeysFromTransplantTask = [
  'prev_planting_management_plan_id', //pre-generated due to transplant_task
  ...editKeysFromPlantTask,
];

export const omitKeysFromManagementTask = [
  'task_id',
  'planting_management_plan_id', //pre-generated due to transplant_task
];

export const editKeysFromManagementTask = ['task'];

export const omitKeysFromTasks = [
  'task_id',
  'assignee_user_id',
  'duration',
  'wage_at_moment',
  'happiness',
  'completion_notes',
  'complete_date',
  'late_time',
  'for_review_time',
  'abandon_date',
  'abandonment_reason',
  'other_abandonment_reason',
  'abandonment_notes',
  'override_hourly_wage',
  'taskType',
  'photo', //not defined in model
  'action_needed', //not defined in model
];

export const editKeysFromTasks = [
  'due_date',
  'coordinates',
  'pest_control_task',
  'irrigation_task',
  'scouting_task',
  'soil_task',
  'field_work_task',
  'harvest_task',
  'cleaning_task',
];

//other tasks

//planting management plans methods
export const editKeysFromPlantingMethods = [
  'planting_management_plan_id', //pre-generated due to transplant_task
];
