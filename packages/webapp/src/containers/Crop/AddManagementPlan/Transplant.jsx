import { useRouteMatch } from 'react-router-dom';
import PureTransplant from '../../../components/Crop/Transplant';
import { cropVarietySelector } from '../../cropVarietySlice';
import { useSelector } from 'react-redux';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';

function TransplantForm() {
  const match = useRouteMatch();
  const variety_id = match.params.variety_id;

  const { can_be_cover_crop } = useSelector(cropVarietySelector(variety_id));

  return (
    <HookFormPersistProvider>
      <PureTransplant can_be_cover_crop={can_be_cover_crop} match={match} />
    </HookFormPersistProvider>
  );
}

export default TransplantForm;
