import { setPersistedPaths } from '../hooks/useHookFormPersist/hookFormPersistSlice';

/**
 *
 * @param dispatch
 * @param history
 * @param state
 * @return {(function(): void)|*}
 */
export const onAddTask = (dispatch, history, state) => () => {
  //TODO: remove all persistedPath in add task flow
  dispatch(
    setPersistedPaths([
      '/add_task/irrigation_method',
      '/add_task/task_type_selection',
      '/add_task/task_assignment',
      '/add_task/task_crops',
      '/add_task/manage_custom_tasks',
      '/add_task/add_custom_task',
      '/add_task/edit_custom_task',
      '/add_task/edit_custom_task_update',
      '/add_task/task_details',
      '/add_task/task_locations',
      '/add_task/task_date',
      '/add_task/planting_method',
      '/add_task/container_method',
      '/add_task/bed_method',
      '/add_task/bed_guidance',
      '/add_task/row_method',
      '/add_task/row_guidance',
    ]),
  );
  history.push('/add_task/task_type_selection', state);
};
