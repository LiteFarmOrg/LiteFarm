import { useState } from 'react';
import { useSelector } from 'react-redux';
import { measurementSelector } from '../../../userFarmSlice';
import { HookFormPersistProvider } from '../../../hooks/useHookFormPersist/HookFormPersistProvider';
import PureHarvestUses from '../../../../components/Task/TaskComplete/HarvestComplete/HarvestUses';
import { hookFormPersistSelector } from '../../../hooks/useHookFormPersist/hookFormPersistSlice';
import { harvestUseTypesSelector } from '../../../harvestUseTypeSlice';
import { taskWithProductSelector } from '../../../taskSlice';
import AddHarvestUseTypeModal from './AddHarvestUseType';
import { useNavigate, useParams } from 'react-router-dom';

function HarvestUses({ location }) {
  let navigate = useNavigate();
  const system = useSelector(measurementSelector);
  let { task_id } = useParams();
  const persistedPaths = [
    `/tasks/${task_id}/complete_harvest_quantity`,
    `/tasks/${task_id}/complete`,
  ];
  const persistedFormData = useSelector(hookFormPersistSelector);
  const harvestUseTypes = useSelector(harvestUseTypesSelector);
  const task = useSelector(taskWithProductSelector(task_id));
  const [showAddHarvestTypeModal, setShowAddHarvestTypeModal] = useState(false);

  const onContinue = (data) => {
    navigate(`/tasks/${task_id}/complete`, { state: location?.state });
  };

  const onGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <HookFormPersistProvider>
        <PureHarvestUses
          system={system}
          onGoBack={onGoBack}
          onContinue={onContinue}
          persistedPaths={persistedPaths}
          amount={persistedFormData?.actual_quantity}
          unit={persistedFormData?.actual_quantity_unit?.label}
          harvestUseTypes={harvestUseTypes}
          onAddHarvestType={() => setShowAddHarvestTypeModal(true)}
          task={task}
        />
      </HookFormPersistProvider>
      {showAddHarvestTypeModal && (
        <AddHarvestUseTypeModal
          harvestUseTypes={harvestUseTypes.map(
            (harvestUseType) => harvestUseType.harvest_use_type_name,
          )}
          dismissModal={() => setShowAddHarvestTypeModal(false)}
        />
      )}
    </>
  );
}

export default HarvestUses;
