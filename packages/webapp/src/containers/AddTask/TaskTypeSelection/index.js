import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);

  const onSubmit = () => {
    console.log('onSubmit called');
  };

  const handleGoBack = () => {
    console.log('go back called');
  };

  const handleCancel = () => {
    console.log('cancel called');
  };

  return (
    <PureTaskTypeSelection
      onSubmit={onSubmit}
      handleCancel={handleCancel}
      handleGoBack={handleGoBack}
    />
  );
}

export default TaskTypeSelection;
