import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';
import { useSelector } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';

function TaskTypeSelection({ history, match }) {
  const userFarm = useSelector(userFarmSelector);

  const onCustomTask = () => {
    console.log('Go to LF-1747 custom task creation page');
  };

  const handleGoBack = () => {
    history.goBack();
  };

  const handleCancel = () => {
    console.log('cancel called');
  };

  return (
    <PureTaskTypeSelection
      history={history}
      onCustomTask={onCustomTask}
      handleCancel={handleCancel}
      handleGoBack={handleGoBack}
      persistedPaths={[]}
    />
  );
}

export default TaskTypeSelection;
