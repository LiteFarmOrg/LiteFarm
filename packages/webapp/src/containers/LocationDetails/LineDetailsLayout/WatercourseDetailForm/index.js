import React from 'react';
import PureWatercourse from '../../../../components/LocationDetailLayout/LineDetailsLayout/Watercourse';
import { postWatercourseLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { locationInfoSelector } from '../../../mapSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { useLocationPageType } from '../../utils';

function WatercourseDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  const {
    line_points,
    length,
    width,
    width_display,
    buffer_width,
    buffer_width_display,
  } = useSelector(locationInfoSelector);

  const submitForm = (data) => {
    dispatch(postWatercourseLocation(data));
  };

  return (
    <PureWatercourse
      history={history}
      match={match}
      submitForm={submitForm}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isCreateLocationPage={isCreateLocationPage}
      isViewLocationPage={isViewLocationPage}
      isEditLocationPage={isEditLocationPage}
    />
  );
}

export default WatercourseDetailForm;
