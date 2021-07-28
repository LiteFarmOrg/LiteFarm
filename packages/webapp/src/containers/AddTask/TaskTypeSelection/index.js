import PureTaskTypeSelection from '../../../components/AddTask/PureTaskTypeSelection';

function TaskTypeSelection({ history, match }) {
  const onSubmit = () => {
    console.log('onSubmit called');
  };

  return <PureTaskTypeSelection />;
}

export default TaskTypeSelection;
