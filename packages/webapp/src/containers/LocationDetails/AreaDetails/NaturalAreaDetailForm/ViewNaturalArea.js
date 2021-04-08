import React, { useEffect } from 'react';
import PureNaturalArea from '../../../../components/LocationDetailLayout/AreaDetails/NaturalArea';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { naturalAreaSelector } from '../../../naturalAreaSlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData } from '../../utils';

function ViewNaturalAreaDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const naturalArea = useSelector(naturalAreaSelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(naturalArea)));
  }, []);

  return (
    <PureNaturalArea
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewNaturalAreaDetailForm;
