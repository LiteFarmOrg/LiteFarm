import { useEffect, useState } from 'react';

import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Layout from '../../Layout';
import { ClickAwayListener } from '@mui/material';

export const MultiStepForm = ({ history, steps, cancelModalTitle }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const progressBarValue = (100 / steps.length) * activeStepIndex;

  const onGoBack = () => {
    if (activeStepIndex === 0) {
      onCancel();
      return;
    }
    setActiveStepIndex(activeStepIndex - 1);
  };

  const onGoForward = () => {
    setActiveStepIndex(activeStepIndex + 1);
  };

  const onCancel = () => {
    history.back();
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
