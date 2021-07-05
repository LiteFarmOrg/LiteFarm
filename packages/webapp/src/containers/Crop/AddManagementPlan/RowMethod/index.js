import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureRowMethod from '../../../../components/Crop/RowMethod';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';

export default function RowMethod({ history, match }) {

  const system = useSelector(measurementSelector);

  return (
    <HookFormPersistProvider>
      <PureRowMethod
        system={system}
      />
    </HookFormPersistProvider>
  );
}