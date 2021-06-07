import { useSelector } from 'react-redux';
import PureCropDetail from '../../../components/Crop/detail';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useState } from 'react';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import CropVarietySpotlight from '../CropVarietySpotlight';

function CropDetail({ history, match }) {
  const selectedVariety = useSelector(cropVarietySelector(match.params.variety_id));

  const { interested } = useSelector(certifierSurveySelector);
  const [isEditing, setIsEditing] = useState(false);

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
      />
      <CropVarietySpotlight />
    </>
  );
}

export default CropDetail;
