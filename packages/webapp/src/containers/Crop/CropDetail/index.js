import { useSelector } from 'react-redux';
import PureCropDetail from '../../../components/Crop/detail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useState } from 'react';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import EditCropVarietyModal from '../../../components/Modals/EditCropVarietyModal';

function CropDetail({ history, match }) {
  const selectedVariety = useSelector(cropVarietySelector(match.params.variety_id));

  const { interested } = useSelector(certifierSurveySelector);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const submitForm = (data) => {
    setIsEditing(false);
  };

  const goBack = () => {
    history.push(`/crop_varieties/crop/${selectedVariety.crop_id}`);
  };

  return (
    <>
      <PureCropDetail
        history={history}
        match={match}
        variety={selectedVariety}
        isEditing={isEditing}
        isInterestedInOrganic={interested}
        setIsEditing={setIsEditing}
        submitForm={submitForm}
        onBack={goBack}
        setShowEditModal={setShowEditModal}
      />
      <CropVarietySpotlight />
      {showEditModal && (
        <EditCropVarietyModal
          dismissModal={() => setShowEditModal(false)}
          handleEdit={() => setIsEditing(true)}
        />
      )}
      {/* todo: make handleEdit history push to edit page */}
    </>
  );
}

export default CropDetail;
