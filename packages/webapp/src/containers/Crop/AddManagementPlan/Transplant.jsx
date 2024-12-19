import PureTransplant from '../../../components/Crop/Transplant';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { useParams } from 'react-router-dom-v5-compat';

function TransplantForm() {
  let { variety_id } = useParams();

  const { can_be_cover_crop } = useSelector(cropVarietySelector(variety_id));

  return (
    <HookFormPersistProvider>
      <PureTransplant can_be_cover_crop={can_be_cover_crop} />
    </HookFormPersistProvider>
  );
}

export default TransplantForm;
