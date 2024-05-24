import React, { useEffect } from 'react';
import PureCompleteStepOne from '../../../components/Task/TaskComplete/StepOne';
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { userFarmSelector } from '../../userFarmSlice';
import { HookFormPersistProvider } from '../../hooks/useHookFormPersist/HookFormPersistProvider';
import { taskWithProductSelector } from '../../taskSlice';
import { productsSelector } from '../../productSlice';
import { certifierSurveySelector } from '../../OrganicCertifierSurvey/slice';
import { setPersistedPaths } from '../../hooks/useHookFormPersist/hookFormPersistSlice';
import { getProducts } from '../saga';

function generateProductsKey(products) {
  return products.map((product) => `${product.product_id}-${product.supplier}`).join('-');
}

function TaskCompleteStepOne({ history, match, location }) {
  const {
    units: { measurement: system },
    country_id,
  } = useSelector(userFarmSelector);
  const { interested, farm_id } = useSelector(certifierSurveySelector, shallowEqual);
  const task_id = match.params.task_id;
  const task = useSelector(taskWithProductSelector(task_id));
  const selectedTaskType = task.taskType;
  const products = useSelector(productsSelector);
  const persistedPaths = [`/tasks/${task_id}/complete`];

  const onContinue = (data) => {
    history.push(persistedPaths[0], location?.state);
  };

  const onGoBack = () => {
    history.back();
  };

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      setPersistedPaths([`/tasks/${task_id}/complete`, `/tasks/${task_id}/before_complete`]),
    );
  }, [dispatch, task_id]);

  const productsKey = generateProductsKey(products);

  return (
    <HookFormPersistProvider>
      <PureCompleteStepOne
        key={productsKey}
        onContinue={onContinue}
        onGoBack={onGoBack}
        system={system}
        farm={{ farm_id, country_id, interested }}
        selectedTaskType={selectedTaskType}
        products={products}
        persistedPaths={persistedPaths}
        selectedTask={task}
      />
    </HookFormPersistProvider>
  );
}

export default TaskCompleteStepOne;
