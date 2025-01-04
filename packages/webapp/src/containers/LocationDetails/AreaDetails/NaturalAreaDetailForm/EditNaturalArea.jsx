import { useEffect, useState } from 'react';
import PureNaturalArea from '../../../../components/LocationDetailLayout/AreaDetails/NaturalArea';
import { deleteNaturalAreaLocation, editNaturalAreaLocation } from './saga';
import { checkLocationDependencies } from '../../saga';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, measurementSelector } from '../../../userFarmSlice';
import { naturalAreaSelector } from '../../../naturalAreaSlice';
import { useLocationPageType } from '../../utils';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';
import RetireConfirmationModal from '../../../../components/Modals/RetireConfirmationModal';
import { useLocation, useParams } from 'react-router';

function EditNaturalAreaDetailForm() {
  let location = useLocation();
  let { location_id } = useParams();
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(
        editNaturalAreaLocation({
          ...data,
          location_id,
          figure_id: naturalArea.figure_id,
        }),
      );
  };
  const naturalArea = useSelector(naturalAreaSelector(location_id));

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
    isViewLocationPage && dispatch(deleteNaturalAreaLocation({ location_id }));
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureNaturalArea
        submitForm={submitForm}
        system={system}
        persistedFormData={naturalArea}
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
