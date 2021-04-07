import React, { useEffect } from 'react';
import PureCeremonial from '../../../../components/LocationDetailLayout/AreaDetails/CeremonialArea';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { ceremonialSelector } from '../../../ceremonialSlice';
import { setAreaDetailFormData } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';

function ViewCeremonialDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const ceremonial = useSelector(ceremonialSelector(match.params.location_id));
  useEffect(() => {
    dispatch(setAreaDetailFormData(ceremonial));
  }, []);

  return (
    <PureCeremonial
      history={history}
      match={match}
      system={system}
      useHookFormPersist={useHookFormPersist}
      isViewLocationPage
    />
  );
}

export default ViewCeremonialDetailForm;
