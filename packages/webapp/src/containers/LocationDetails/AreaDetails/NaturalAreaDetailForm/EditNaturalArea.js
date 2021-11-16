import React, { useEffect, useState } from 'react';
import PureNaturalArea from '../../../../components/LocationDetailLayout/AreaDetails/NaturalArea';
import { deleteNaturalAreaLocation, editNaturalAreaLocation } from './saga';
import { checkLocationDependencies } from '../../saga';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { naturalAreaSelector } from '../../../naturalAreaSlice';
import {
  hookFormPersistSelector,
  setAreaDetailFormData,
} from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getFormData, useLocationPageType } from '../../utils';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';
import RetireConfirmationModal from '../../../../components/Modals/RetireConfirmationModal';
import {
  currentManagementPlansByLocationIdSelector,
  plannedManagementPlansByLocationIdSelector,
} from '../../../Task/TaskCrops/managementPlansWithLocationSelector';

function EditNaturalAreaDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(
        editNaturalAreaLocation({
          ...data,
          ...match.params,
          figure_id: naturalArea.figure_id,
        }),
      );
  };
  const naturalArea = useSelector(naturalAreaSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(naturalArea)));
  }, []);

  useEffect(() => {
    if (history?.location?.state?.error?.retire) {
      setShowCannotRetireModal(true);
    }
  }, [history?.location?.state?.error]);

  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );

  const [showCannotRetireModal, setShowCannotRetireModal] = useState(false);
  const [showConfirmRetireModal, setShowConfirmRetireModal] = useState(false);
  const { location_id } = match.params;
  const activeCrops = useSelector(currentManagementPlansByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedManagementPlansByLocationIdSelector(location_id));
  const handleRetire = () => {
    // approach 1: redux store check for dependencies
    // if (activeCrops.length === 0 && plannedCrops.length === 0) {
    //   setShowConfirmRetireModal(true);
    // } else {
    //   setShowCannotRetireModal(true);
    // }

    // approach 2: call backend for dependency check
    dispatch(
      checkLocationDependencies({
        location_id,
        setShowConfirmRetireModal,
        setShowCannotRetireModal,
      }),
    );
  };

  const confirmRetire = () => {
    isViewLocationPage && dispatch(deleteNaturalAreaLocation({ location_id }));
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureNaturalArea
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

export default EditNaturalAreaDetailForm;
