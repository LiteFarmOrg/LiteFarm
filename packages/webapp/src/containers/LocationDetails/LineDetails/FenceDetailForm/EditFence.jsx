import { useEffect, useState } from 'react';
import PureFence from '../../../../components/LocationDetailLayout/LineDetails/Fence';
import { deleteFenceLocation, editFenceLocation } from './saga';
import { checkLocationDependencies } from '../../saga';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, measurementSelector } from '../../../userFarmSlice';
import { fenceSelector } from '../../../fenceSlice';
import { useLocationPageType } from '../../utils';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';
import RetireConfirmationModal from '../../../../components/Modals/RetireConfirmationModal';
import { useLocation, useParams } from 'react-router-dom';

function EditFenceDetailForm() {
  let location = useLocation();
  let { location_id } = useParams();
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editFenceLocation({ ...data, location_id, figure_id: fence.figure_id }));
  };
  const fence = useSelector(fenceSelector(location_id));

  useEffect(() => {
    if (location?.state?.error?.retire) {
      setShowCannotRetireModal(true);
    }
  }, [location?.state?.error]);

  const { isViewLocationPage, isEditLocationPage } = useLocationPageType();

  const [showCannotRetireModal, setShowCannotRetireModal] = useState(false);
  const [showConfirmRetireModal, setShowConfirmRetireModal] = useState(false);
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
    isViewLocationPage && dispatch(deleteFenceLocation({ location_id }));
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureFence
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
