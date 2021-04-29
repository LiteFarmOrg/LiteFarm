import React, { useEffect, useState } from 'react';
import PureSurfaceWater from '../../../../components/LocationDetailLayout/AreaDetails/SurfaceWater';
import { deleteSurfaceWaterLocation, editSurfaceWaterLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { surfaceWaterSelector } from '../../../surfaceWaterSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';
import {
  currentFieldCropsByLocationIdSelector,
  plannedFieldCropsByLocationIdSelector,
} from '../../../fieldCropSlice';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';
import RetireConfirmationModal from '../../../../components/Modals/RetireConfirmationModal';
import { shiftsSelector } from '../../../Shift/selectors';
import { findShiftLocationMatch } from '../../../Shift/shiftUtil';

function EditSurfaceWaterDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(
        editSurfaceWaterLocation({
          ...data,
          ...match.params,
          figure_id: surfaceWater.figure_id,
        }),
      );
  };
  const surfaceWater = useSelector(surfaceWaterSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(surfaceWater)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );

  const [showCannotRetireModal, setShowCannotRetireModal] = useState(false);
  const [showConfirmRetireModal, setShowConfirmRetireModal] = useState(false);
  const { location_id } = match.params;
  const activeCrops = useSelector(currentFieldCropsByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedFieldCropsByLocationIdSelector(location_id));
  const [locationHasShifts, setLocationHasShifts] = useState(false);
  const allShifts = useSelector(shiftsSelector);

  useEffect(() => {
    setLocationHasShifts(findShiftLocationMatch(allShifts, location_id));
  }, [locationHasShifts]);

  const handleRetire = () => {
    if (activeCrops.length === 0 && plannedCrops.length === 0 && !locationHasShifts) {
      setShowConfirmRetireModal(true);
    } else {
      setShowCannotRetireModal(true);
    }
  };

  const confirmRetire = () => {
    isViewLocationPage && dispatch(deleteSurfaceWaterLocation({ location_id }));
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureSurfaceWater
        history={history}
        match={match}
        submitForm={submitForm}
        system={system}
        useHookFormPersist={useHookFormPersist}
        isEditLocationPage={isEditLocationPage}
        isViewLocationPage={isViewLocationPage}
        handleRetire={handleRetire}
        isAdmin={isAdmin}
      />
      {isViewLocationPage && showCannotRetireModal && (
        <UnableToRetireModal dismissModal={() => setShowCannotRetireModal(false)} />
      )}
      {showConfirmRetireModal && (
        <RetireConfirmationModal
          dismissModal={() => setShowConfirmRetireModal(false)}
          handleRetire={confirmRetire}
        />
      )}
    </>
  );
}

export default EditSurfaceWaterDetailForm;
