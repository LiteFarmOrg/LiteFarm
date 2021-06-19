import { useDispatch, useSelector } from 'react-redux';
import PureCropDetail from '../../../components/Crop/detail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useState } from 'react';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { currentAndPlannedManagementPlansByCropVarietySelector } from './../../managementPlanSlice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import RetireCropWarning from '../../../components/Modals/CropModals/RetireCropWarningModal';
import EditCropVarietyModal from '../../../components/Modals/EditCropVarietyModal';
import UnableToRetireCropModal from '../../../components/Modals/CropModals/UnableToRetireCropModal';
import { deleteVarietal } from '../../AddCropVariety/saga';

function CropDetail({ history, match }) {
  const { variety_id } = match.params;
  const dispatch = useDispatch();
  const selectedVariety = useSelector(cropVarietySelector(variety_id));
  const [showWarningBox, setShowWarningBox] = useState(false);
  const [showErrorBox, setShowErrorBox] = useState(false);
  const { interested } = useSelector(certifierSurveySelector);
  const [showEditModal, setShowEditModal] = useState(false);
  const activeOrPlannedManagementPlansOnVariety = useSelector(currentAndPlannedManagementPlansByCropVarietySelector(variety_id));
  const submitForm = (data) => {
    // setIsEditing(false);
  };

  const goBack = () => {
    history.push(`/crop_varieties/crop/${selectedVariety.crop_id}`);
  };

  const warningModal = () => {
    if (activeOrPlannedManagementPlansOnVariety.length === 0) {
      return setShowWarningBox(true);
    } else {
      return setShowErrorBox(true);
    }
  }


  const confirmRetire = () => {
    dispatch(deleteVarietal({ variety_id }))
  }

  return (
    <>
      <PureCropDetail
        history={history}
        match={match}
        variety={selectedVariety}
        isInterestedInOrganic={interested}
        submitForm={submitForm}
        onBack={goBack}
        onRetire={() => warningModal()}
        setShowEditModal={setShowEditModal}
      />
      <CropVarietySpotlight />
      {showWarningBox &&
        <RetireCropWarning handleRetire={confirmRetire} dismissModal={() => setShowWarningBox(false)}/>
      }
      { showErrorBox &&
        <UnableToRetireCropModal dismissModal={() => setShowErrorBox(false)} />
      }
      {showEditModal && (
        <EditCropVarietyModal
          dismissModal={() => setShowEditModal(false)}
          handleEdit={() => history.push(`/crop/${variety_id}/edit_crop_variety`)}
        />
      )}
    </>
  );
}

export default CropDetail;
