import React, { useEffect, useState } from 'react';
import PureField from '../../../../components/LocationDetailLayout/AreaDetails/Field';
import { editFieldLocation } from './saga';
import { useDispatch, useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import useHookFormPersist from '../../../hooks/useHookFormPersist';
import { fieldSelector } from '../../../fieldSlice';
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
import { useTranslation } from 'react-i18next';

function EditFieldDetailForm({ history, match }) {
  const dispatch = useDispatch();
  const system = useSelector(measurementSelector);
  const { t } = useTranslation();
  const submitForm = (data) => {
    isEditLocationPage &&
      dispatch(editFieldLocation({ ...data, ...match.params, figure_id: field.figure_id }));
  };
  const field = useSelector(fieldSelector(match.params.location_id));
  const formData = useSelector(hookFormPersistSelector);
  useEffect(() => {
    dispatch(setAreaDetailFormData(getFormData(field)));
  }, []);
  const { isCreateLocationPage, isViewLocationPage, isEditLocationPage } = useLocationPageType(
    match,
  );
  const [showCannotRetireModal, setShowCannotRetireModal] = useState(false);
  const [showConfirmRetireModal, setShowConfirmRetireModal] = useState(false);
  const { location_id } = match.params;
  const activeCrops = useSelector(currentFieldCropsByLocationIdSelector(location_id));
  const plannedCrops = useSelector(plannedFieldCropsByLocationIdSelector(location_id));
  const handleRetire = () => {
    if (activeCrops.length === 0 && plannedCrops.length === 0) {
      setShowConfirmRetireModal(true);
    } else {
      setShowCannotRetireModal(true);
    }
  }

  const confirmRetire = () => {
    console.log("confirm Retire");
  }

  return (
    <>
      <PureField
        history={history}
        match={match}
        submitForm={submitForm}
        system={system}
        useHookFormPersist={useHookFormPersist}
        isEditLocationPage={isEditLocationPage}
        isViewLocationPage={isViewLocationPage}
        handleRetire={handleRetire}
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
