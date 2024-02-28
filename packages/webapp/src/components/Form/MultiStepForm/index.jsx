import { useEffect, useState } from 'react';
import { matchPath } from 'react-router-dom';

import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Layout from '../../Layout';

export const MultiStepForm = ({ history, steps }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const progressBarValue = (100 / steps.length) * activeStepIndex;

  useEffect(() => {
    const currentRouteStepIndex = steps.findIndex((step) =>
      matchPath(history.location.pathname, step.route),
    );
    if (typeof currentRouteStepIndex === 'number') {
      setActiveStepIndex(currentRouteStepIndex);
    }
  }, [history.location.pathname, steps]);

  const onCancel = () => {};

  const onGoBack = () => {
    if (activeStepIndex === 0) {
      onCancel();
      return;
    }
    setActiveStepIndex(activeStepIndex - 1);
    history.push(steps[activeStepIndex - 1].route);
  };

  const onGoForward = () => {
    if (activeStepIndex === steps.length - 1) {
      return;
    }
    setActiveStepIndex(activeStepIndex + 1);
    history.push(steps[activeStepIndex + 1].route);
  };

  const activeStep = steps[activeStepIndex];

  return (
    <Layout>
      <MultiStepPageTitle
        title={activeStep.title}
        onGoBack={onGoBack}
        onCancel={onCancel}
        cancelModalTitle="Cancel"
        value={progressBarValue}
      />
      <activeStep.FormContent onGoForward={onGoForward} />
    </Layout>
  );
};
