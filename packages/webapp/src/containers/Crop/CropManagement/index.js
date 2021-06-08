import { useSelector } from 'react-redux';
import PureCropManagement from '../../../components/Crop/management';
import { cropVarietySelector } from '../../cropVarietySlice';
import CropVarietySpotlight from '../CropVarietySpotlight';

function CropManagement({ history, match }) {
  const selectedVariety = useSelector(cropVarietySelector(match.params.variety_id));

  const goBack = () => {
    history.push(`/crop_varieties/crop/${selectedVariety.crop_id}`);
  };

  return (
    <>
      <PureCropManagement
        history={history}
        variety={selectedVariety}
        match={match}
        onBack={goBack}
      />
      <CropVarietySpotlight />
    </>
  );
}

export default CropManagement;
