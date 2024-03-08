import { useEffect, useState } from 'react';

import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Layout from '../../Layout';
import { ClickAwayListener } from '@mui/material';
import { matchPath } from 'react-router-dom';

export const MultiStepForm = ({ history, steps, cancelModalTitle }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const progressBarValue = (100 / steps.length) * activeStepIndex;

  useEffect(() => {
    const matchingStepIndex = steps.findIndex((step) =>
      matchPath(step.route, history.location.pathname),
    );
    if (typeof matchingStepIndex === 'number') {
      setActiveStepIndex(matchingStepIndex);
    }
  }, [steps, history.location.pathname]);

  const onGoBack = () => {
    if (activeStepIndex === 0) {
      onCancel();
      return;
    }
    setActiveStepIndex(activeStepIndex - 1);
    history.go(-1);
  };

  const onGoForward = () => {
    setActiveStepIndex(activeStepIndex + 1);
    history.push(steps[activeStepIndex + 1].route);
  };

  const onCancel = () => {
    history.go(-activeStepIndex - 1);
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
