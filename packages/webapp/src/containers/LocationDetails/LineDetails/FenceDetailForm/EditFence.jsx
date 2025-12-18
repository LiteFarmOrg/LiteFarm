import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router-dom';
import PureFence from '../../../../components/LocationDetailLayout/LineDetails/Fence';
import { deleteFenceLocation, editFenceLocation } from './saga';
import { useCheckDeleteLocationMutation } from '../../../../store/api/locationApi';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, measurementSelector } from '../../../userFarmSlice';
import { fenceSelector } from '../../../fenceSlice';
import { useLocationPageType } from '../../utils';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';
import RetireConfirmationModal from '../../../../components/Modals/RetireConfirmationModal';
import {
  currentManagementPlansByLocationIdSelector,
  plannedManagementPlansByLocationIdSelector,
} from '../../../Task/TaskCrops/managementPlansWithLocationSelector';

function EditFenceDetailForm() {
  const history = useHistory();
  const match = useRouteMatch();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editFenceLocation({ ...data, ...match.params, figure_id: fence.figure_id }));
  };
  const fence = useSelector(fenceSelector(match.params.location_id));

  useEffect(() => {
    if (location?.state?.error?.retire) {
      setShowCannotRetireModal(true);
    }
  }, [location?.state?.error]);

  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType();

  const [showCannotRetireModal, setShowCannotRetireModal] = useState(false);
  const [showConfirmRetireModal, setShowConfirmRetireModal] = useState(false);
  const { location_id } = match.params;
  const activeCrops = useSelector(currentManagementPlansByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedManagementPlansByLocationIdSelector(location_id));
  const [checkDeleteLocation] = useCheckDeleteLocationMutation();
  const handleRetire = async () => {
    // approach 1: redux store check for dependencies
    // if (activeCrops.length === 0 && plannedCrops.length === 0) {
    //   setShowConfirmRetireModal(true);
    // } else {
    //   setShowCannotRetireModal(true);
    // }

    // approach 2: call backend for dependency check
    try {
      await checkDeleteLocation({ location_id }).unwrap();
      setShowConfirmRetireModal(true);
    } catch (_err) {
      setShowCannotRetireModal(true);
    }
  };

  const confirmRetire = () => {
    isViewLocationPage && dispatch(deleteFenceLocation({ location_id }));
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureFence
        history={history}
        match={match}
        submitForm={submitForm}
        system={system}
        persistedFormData={fence}
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

export default EditFenceDetailForm;
