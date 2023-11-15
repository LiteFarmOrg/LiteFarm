import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PureField from '../../../../components/LocationDetailLayout/AreaDetails/Field';
import RetireConfirmationModal from '../../../../components/Modals/RetireConfirmationModal';
import UnableToRetireModal from '../../../../components/Modals/UnableToRetireModal';
import {
  currentManagementPlansByLocationIdSelector,
  plannedManagementPlansByLocationIdSelector,
} from '../../../Task/TaskCrops/managementPlansWithLocationSelector';
import { fieldSelector } from '../../../fieldSlice';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { isAdminSelector, measurementSelector } from '../../../userFarmSlice';
import { checkLocationDependencies } from '../../saga';
import { useLocationPageType } from '../../utils';
import { deleteFieldLocation, editFieldLocation } from './saga';

function EditFieldDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const isAdmin = useSelector(isAdminSelector);
  const system = useSelector(measurementSelector);
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editFieldLocation({ ...data, ...match.params, figure_id: field.figure_id }));
  };
  const field = useSelector(fieldSelector(match.params.location_id));
  const persistedFormData = useSelector(hookFormPersistSelector);

  useEffect(() => {
    if (history?.location?.state?.error) {
      setShowCannotRetireModal(true);
    }
  }, [history?.location?.state?.error]);

  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } =
    useLocationPageType(match);
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
    isViewLocationPage && dispatch(deleteFieldLocation({ location_id }));
    setShowConfirmRetireModal(false);
  };

  return (
    <>
      <PureField
        history={history}
        match={match}
        submitForm={submitForm}
        system={system}
        persistedFormData={{ ...field, ...persistedFormData }}
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
