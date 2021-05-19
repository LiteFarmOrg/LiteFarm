import { useSelector } from 'react-redux';
import PureCropManagement from '../../../components/Crop/management';
import { cropVarietySelector } from '../../cropVarietySlice';

function CropManagement({ history, match }) {
  const selectedCrop = useSelector(cropVarietySelector(match.params.variety_id));

  const goBack = () => {
    history.push(`/crop_varieties/crop/${selectedCrop.crop_id}`);
  };

  return (
    <>
      <PureCropManagement history={history} match={match} crop={selectedCrop} onBack={goBack} />
    </>
  );
}

export default CropManagement;
