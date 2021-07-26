import PureTaskAssignment from '../../../components/AddTask/PureTaskAssignment';

function TaskManagement({ history, match }) {
  const userFarmOptions = [
    { label: 'Apple', value: 'apple' },
    { label: 'Banana', value: 'banana' },
    { label: 'Strawberry', value: 'strawberry' },
    { label: 'Kiwi', value: 'kiwi' },
    { label: 'Mango', value: 'mango' },
    { label: 'Banana Apple', value: 'bananaapple' },
  ];

  const onSubmit = () => {
    console.log('onSave called');
  };
  const handleGoBack = () => {
    console.log('handleGoBack called');
  };
  const handleCancel = () => {
    console.log('handleCancel called');
  };
  const onError = () => {
    console.log('onError called');
  };
  const isFarmWorker = false;

  return (
    <PureTaskAssignment
      onSubmit={onSubmit}
      handleGoBack={handleGoBack}
      handleCancel={handleCancel}
      onError={onError}
      userFarmOptions={userFarmOptions}
      isFarmWorker={isFarmWorker}
    />
  );
}

export default TaskManagement;
