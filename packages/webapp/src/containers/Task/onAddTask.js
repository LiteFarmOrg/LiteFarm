import { setPersistedPaths, setEntryPath } from '../hooks/useHookFormPersist/hookFormPersistSlice';

/**
 *
 * @param dispatch
 * @param history
 * @return {(function(): void)|*}
 */
export const onAddTask = (dispatch, history, entryPath) => () => {
  //TODO: remove all persistedPath in add task flow
  dispatch(
    setPersistedPaths([
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
  dispatch(setEntryPath(entryPath));
  history.push('/add_task/task_type_selection');
};
