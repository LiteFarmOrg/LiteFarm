/*
 *  Copyright 2024 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import Layout from '../../Layout';
import { ClickAwayListener } from '@mui/material';
import { FormProvider, useForm } from 'react-hook-form';
import StepperProgressBar from '../../StepperProgressBar';
import FloatingContainer from '../../FloatingContainer';
import FormNavigationButtons from '../FormNavigationButtons';

export const VARIANT = {
  PAGE_TITLE: 'page_title',
  STEPPER_PROGRESS_BAR: 'stepper_progress_bar',
};

export const MultiStepForm = ({
  history,
  getSteps,
  cancelModalTitle,
  defaultFormValues,
  variant = VARIANT.PAGE_TITLE,
  isCompactSideMenu,
  hasSummaryWithinForm,
  onSave,
  stepperProgressBarConfig = {},
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [formData, setFormData] = useState();

  const { t } = useTranslation();

  const form = useForm({
    mode: 'onBlur',
    defaultValues: defaultFormValues,
  });

  const steps = useMemo(() => getSteps(formData), [getSteps, formData]);
  const progressBarValue = useMemo(
    () => (100 / (steps.length + 1)) * (activeStepIndex + 1),
    [steps],
  );

  const isSummaryPage =
    variant === VARIANT.STEPPER_PROGRESS_BAR &&
    hasSummaryWithinForm &&
    activeStepIndex === steps.length - 1;

  const isSummaryPageRef = useRef(isSummaryPage);

  useEffect(() => {
    isSummaryPageRef.current = isSummaryPage;
  }, [isSummaryPage]);

  // Block the page transition
  // https://github.com/remix-run/history/blob/dev/docs/blocking-transitions.md
  useEffect(() => {
    if (variant !== VARIANT.STEPPER_PROGRESS_BAR || isSummaryPage) {
      return;
    }
    const unblock = history.block((tx) => {
      if (window.confirm(`TODO: ${t('CANCEL_FLOW_MODAL.BODY')}`)) {
        // Unblock the navigation.
        unblock();

        // Retry the transition.
        tx.retry();
      }
    });

    return () => unblock();
  }, [variant, isSummaryPage]);

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

  const onPrevious = () => {
    if (!activeStepIndex) {
      return;
    }
    storeFormData();
    setActiveStepIndex(activeStepIndex - 1);
  };

  const onClickAway = () => {
    setShowConfirmCancelModal(true);
  };

  const activeStep = steps[activeStepIndex];

  const isFinalStep =
    (!hasSummaryWithinForm && activeStepIndex === steps.length - 1) ||
    (hasSummaryWithinForm && activeStepIndex === steps.length - 2);

  const shouldShowFormNavigationButtons =
    variant === VARIANT.STEPPER_PROGRESS_BAR && !isSummaryPage;

  const onContinue = () => {
    if (isFinalStep) {
      form.handleSubmit((data) => onSave(data, onGoForward))();
      return;
    }
    onGoForward();
  };

  return (
    <ClickAwayListener onClickAway={onClickAway} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <div>
        {variant === VARIANT.STEPPER_PROGRESS_BAR && (
          <StepperProgressBar
            {...stepperProgressBarConfig}
            steps={steps.map(({ title }) => title)}
            activeStep={activeStepIndex}
          />
        )}
        <Layout>
          {variant === VARIANT.PAGE_TITLE && (
            <MultiStepPageTitle
              title={activeStep.title}
              onGoBack={onGoBack}
              onCancel={onCancel}
              cancelModalTitle={cancelModalTitle}
              value={progressBarValue}
              showConfirmCancelModal={showConfirmCancelModal}
              setShowConfirmCancelModal={setShowConfirmCancelModal}
            />
          )}
          <FormProvider {...form}>
            <activeStep.FormContent onGoForward={onGoForward} form={form} />
          </FormProvider>
        </Layout>
        {shouldShowFormNavigationButtons && (
          <FloatingContainer isCompactSideMenu={isCompactSideMenu}>
            <FormNavigationButtons
              onContinue={onContinue}
              onCancel={onCancel}
              onGoBack={onGoBack}
              onPrevious={onPrevious}
              isFirstStep={!activeStepIndex}
              isFinalStep={isFinalStep}
            />
          </FloatingContainer>
        )}
      </div>
    </ClickAwayListener>
  );
};

MultiStepForm.propTypes = {
  history: PropTypes.object,
  getSteps: PropTypes.func,
  cancelModalTitle: PropTypes.string,
  defaultFormValues: PropTypes.object,
  variant: PropTypes.oneOf(Object.values(VARIANT)),
  isCompactSideMenu: PropTypes.bool,
  hasSummaryWithinForm: PropTypes.bool,
  onSave: PropTypes.func,
  stepperProgressBarConfig: PropTypes.shape({
    isMobile: PropTypes.bool,
    isDarkMode: PropTypes.bool,
  }),
};
