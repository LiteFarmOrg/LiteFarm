import { useState, useMemo } from 'react';

import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Layout from '../../Layout';
import { ClickAwayListener } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';

export const MultiStepForm = ({ history, getSteps, cancelModalTitle, defaultFormValues }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [formData, setFormData] = useState();

  const form = useForm({
    mode: 'onBlur',
    defaultValues: defaultFormValues,
  });

  const steps = useMemo(() => getSteps(formData), [getSteps, formData]);
  const progressBarValue = useMemo(() => (100 / steps.length) * activeStepIndex, [steps]);

  const storeFormData = () => {
    const values = form.getValues();
    setFormData({ ...formData, ...values });
  };

  const onGoBack = () => {
    if (activeStepIndex === 0) {
      onCancel();
      return;
    }
    storeFormData();
    setActiveStepIndex(activeStepIndex - 1);
  };

  const onGoForward = () => {
    storeFormData();
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
          <FormProvider {...form}>
            <activeStep.FormContent onGoForward={onGoForward} form={form} formData={formData} />
          </FormProvider>
        </Layout>
      </div>
    </ClickAwayListener>
  );
};
