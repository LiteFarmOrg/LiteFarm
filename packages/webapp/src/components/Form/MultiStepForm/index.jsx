import { useEffect, useState } from 'react';
import { matchPath } from 'react-router-dom';

import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Layout from '../../Layout';
import { useDispatch } from 'react-redux';
import { resetAndUnLockFormData } from '../../../containers/hooks/useHookFormPersist/hookFormPersistSlice';
import { ClickAwayListener } from '@mui/material';

export const MultiStepForm = ({ history, steps, cancelModalTitle }) => {
  const dispatch = useDispatch();
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [stepNavigationCount, setStepNavigationCount] = useState(1);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const progressBarValue = (100 / steps.length) * activeStepIndex;

  const onCancel = () => {
    dispatch(resetAndUnLockFormData());
    history.go(-stepNavigationCount);
  };

  const onGoBack = () => {
    if (activeStepIndex === 0) {
      onCancel();
      return;
    }
    setActiveStepIndex(activeStepIndex - 1);
    setStepNavigationCount((count) => count + 1);
    history.push(steps[activeStepIndex - 1].route);
  };

  const onGoForward = () => {
    if (activeStepIndex === steps.length - 1) {
      setStepNavigationCount(0);
      return;
    }
    setActiveStepIndex(activeStepIndex + 1);
    setStepNavigationCount((count) => count + 1);
    history.push(steps[activeStepIndex + 1].route);
  };

  const onClickAway = () => {
    setShowConfirmCancelModal(true);
  };

  const activeStep = steps[activeStepIndex];

  return (
    <ClickAwayListener onClickAway={onClickAway} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <div>
        <Layout>
          <MultiStepPageTitle
            title={activeStep.title}
            onGoBack={onGoBack}
            onCancel={onCancel}
            cancelModalTitle={cancelModalTitle}
            value={progressBarValue}
            showConfirmCancelModal={showConfirmCancelModal}
            setShowConfirmCancelModal={setShowConfirmCancelModal}
          />
          <activeStep.FormContent onGoForward={onGoForward} />
        </Layout>
      </div>
    </ClickAwayListener>
  );
};
