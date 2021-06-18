import { useSelector } from 'react-redux';
import PureCropDetail from '../../../components/Crop/detail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useState } from 'react';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import RetireCropWarning from '../../../components/Modals/CropModals/RetireCropWarningModal';
import EditCropVarietyModal from '../../../components/Modals/EditCropVarietyModal';

function CropDetail({ history, match }) {
  const { variety_id } = match.params;
  const selectedVariety = useSelector(cropVarietySelector(variety_id));
  const [showWarningBox, setShowWarningBox] = useState(false);
  const { interested } = useSelector(certifierSurveySelector);
  const [showEditModal, setShowEditModal] = useState(false);

  const submitForm = (data) => {
    // setIsEditing(false);
  };

  const goBack = () => {
    history.push(`/crop_varieties/crop/${selectedVariety.crop_id}`);
  };

  const askForRetireConfirmation = () => {
    setShowWarningBox(true);
  }

  const confirmRetire = () => {
    
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
        onRetire={askForRetireConfirmation}
        setShowEditModal={setShowEditModal}
      />
      <CropVarietySpotlight />
      ( showWarningBox &&
        <RetireCropWarning handleRetire={confirmRetire}  />
      )
      {showEditModal && (
        <EditCropVarietyModal
          dismissModal={() => setShowEditModal(false)}
          handleEdit={() => history.push(`/crop/${variety_id}/edit_crop_variety`)}
        />
      )}
      {/* todo: make handleEdit history push to edit page */}
    </>
  );
}

export default CropDetail;
