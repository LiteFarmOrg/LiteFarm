import React, { useEffect } from 'react';
import PureWatercourse from '../../../../components/LocationDetailLayout/LineDetails/Watercourse';
import { editWatercourseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { watercourseSelector } from '../../../watercourseSlice';
import {
  hookFormPersistSelector,
  setLineDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';

function EditWatercourseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(
        editWatercourseLocation({
          ...data,
          ...match.params,
          figure_id: watercourse.figure_id,
        }),
      );
  };
  const watercourse = useSelector(watercourseSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setLineDetailFormData(getFormData(watercourse)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  return (
    <PureWatercourse
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isEditLocationPage={isEditLocationPage}
      isViewLocationPage={isViewLocationPage}
    />
  );
}

export default EditWatercourseDetailForm;
