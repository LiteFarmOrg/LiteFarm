import { useDispatch, useSelector } from 'react-redux';
import PureCropDetail from '../../../components/Crop/Detail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useState } from 'react';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import {
  currentAndPlannedManagementPlansByCropVarietySelector,
  currentManagementPlanByCropVarietyIdSelector,
  plannedManagementPlanByCropVarietyIdSelector,
} from '../../managementPlanSlice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import RetireCropWarning from '../../../components/Modals/CropModals/RetireCropWarningModal';
import EditCropVarietyModal from '../../../components/Modals/EditCropVarietyModal';
import UnableToRetireCropModal from '../../../components/Modals/CropModals/UnableToRetireCropModal';
import { deleteVarietal } from '../../AddCropVariety/saga';
import { isAdminSelector } from '../../userFarmSlice';
import { useLocation, useNavigate, useParams } from 'react-router';

function CropDetail() {
  let navigate = useNavigate();
  let location = useLocation();
  let { variety_id } = useParams();
  const dispatch = useDispatch();
  const selectedVariety = useSelector(cropVarietySelector(variety_id));
  const { crop_id } = selectedVariety;
  const [showWarningBox, setShowWarningBox] = useState(false);
  const [showErrorBox, setShowErrorBox] = useState(false);
  const { interested } = useSelector(certifierSurveySelector);
  const [showEditModal, setShowEditModal] = useState(false);
  const activeOrPlannedManagementPlansOnVariety = useSelector(
    currentAndPlannedManagementPlansByCropVarietySelector(variety_id),
  );
  const currentMPs = useSelector(currentManagementPlanByCropVarietyIdSelector(variety_id));
  const plannedMPs = useSelector(plannedManagementPlanByCropVarietyIdSelector(variety_id));
  const hasNoManagementPlans = currentMPs.length < 1 && plannedMPs.length < 1;

  const goBack = () => {
    navigate(location?.state?.returnPath ?? `/crop_varieties/crop/${crop_id}`, {
      state: location.state,
    });
  };

  const warningModal = () => {
    if (activeOrPlannedManagementPlansOnVariety.length === 0) {
      return setShowWarningBox(true);
    } else {
      return setShowErrorBox(true);
    }
  };

  const confirmRetire = () => {
    dispatch(deleteVarietal({ variety_id }));
  };

  const handleEdit = () => {
    if (hasNoManagementPlans) {
      navigate(`/crop/${variety_id}/edit_crop_variety`);
    } else {
      setShowEditModal(true);
    }
  };

  const isAdmin = useSelector(isAdminSelector);

  return (
    <CropVarietySpotlight>
      <PureCropDetail
        variety={selectedVariety}
        isInterestedInOrganic={interested}
        onBack={goBack}
        onRetire={() => warningModal()}
        onEdit={handleEdit}
        isAdmin={isAdmin}
      />
      {showWarningBox && (
        <RetireCropWarning
          handleRetire={confirmRetire}
          dismissModal={() => setShowWarningBox(false)}
        />
      )}
      {showErrorBox && <UnableToRetireCropModal dismissModal={() => setShowErrorBox(false)} />}
      {showEditModal && (
        <EditCropVarietyModal
          dismissModal={() => setShowEditModal(false)}
          handleEdit={() => navigate(`/crop/${variety_id}/edit_crop_variety`)}
        />
      )}
    </CropVarietySpotlight>
  );
}

export default CropDetail;
