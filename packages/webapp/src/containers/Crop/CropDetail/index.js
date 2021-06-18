import { useSelector } from 'react-redux';
import PureCropDetail from '../../../components/Crop/detail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useState } from 'react';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import CropVarietySpotlight from '../CropVarietySpotlight';
import RetireCropWarning from '../../../components/Modals/CropModals/RetireCropWarningModal';

function CropDetail({ history, match }) {
  const selectedVariety = useSelector(cropVarietySelector(match.params.variety_id));
  const [showWarningBox, setShowWarningBox] = useState(false);
  const { interested } = useSelector(certifierSurveySelector);
  const [isEditing, setIsEditing] = useState(false);

  const submitForm = (data) => {
    setIsEditing(false);
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
        isEditing={isEditing}
        isInterestedInOrganic={interested}
        setIsEditing={setIsEditing}
        submitForm={submitForm}
        onBack={goBack}
        onRetire={askForRetireConfirmation}
      />
      <CropVarietySpotlight />
      ( showWarningBox &&
        <RetireCropWarning handleRetire={confirmRetire}  />
      )
    </>
  );
}

export default CropDetail;
