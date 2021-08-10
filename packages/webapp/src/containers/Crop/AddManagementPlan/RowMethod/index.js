import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { cropVarietySelector } from '../../../cropVarietySlice';

export default function RowMethod({ history, match }) {
  const system = useSelector(measurementSelector);
  const variety_id = match.params.variety_id;
  const variety = useSelector(cropVarietySelector(variety_id));

  const isFinalPage = match.path === '/crop/:variety_id/add_management_plan/row_method';

  return (
    <HookFormPersistProvider>
      <PureRowMethod
        system={system}
        variety={variety}
        isFinalPage={isFinalPage}
        history={history}
      />
    </HookFormPersistProvider>
  );
}
