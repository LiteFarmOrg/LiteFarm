import { useEffect, useState } from 'react';
import PureField from '../../../../components/LocationDetailLayout/AreaDetails/Field';
import { deleteFieldLocation, editFieldLocation } from './saga';
import { checkLocationDependencies } from '../../saga';
import { useDispatch, useSelector } from 'react-redux';
import { isAdminSelector, measurementSelector } from '../../../userFarmSlice';
import { fieldSelector } from '../../../fieldSlice';
import { useLocationPageType } from '../../utils';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';
import RetireConfirmationModal from '../../../../components/Modals/RetireConfirmationModal';
import { useParams } from 'react-router-dom';

function EditFieldDetailForm({ history }) {
  let { location_id } = useParams();
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editFieldLocation({ ...data, location_id, figure_id: field.figure_id }));
  };
  const field = useSelector(fieldSelector(location_id));

  useEffect(() => {
    if (history?.location?.state?.error) {
      setShowCannotRetireModal(true);
    }
  }, [history?.location?.state?.error]);

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
    isViewLocationPage && dispatch(deleteFieldLocation({ location_id }));
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureField
        history={history}
        submitForm={submitForm}
        system={system}
        persistedFormData={field}
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

export default EditFieldDetailForm;
