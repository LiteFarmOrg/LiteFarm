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

import { ReactNode, useEffect, useState } from 'react';
import {
  UseFormHandleSubmit,
  FieldValues,
  FormState,
  UseFormReset,
  UseFormGetValues,
} from 'react-hook-form';
import { History } from 'history';
import StepperProgressBar, { StepperProgressBarProps } from '../../StepperProgressBar';
import FloatingContainer from '../../FloatingContainer';
import FormNavigationButtons from '../FormNavigationButtons';
import FixedHeaderContainer from '../../Animals/FixedHeaderContainer';
import CancelFlowModal from '../../Modals/CancelFlowModal';
import HeaderWithBackAndClose from './HeaderWithBackAndClose';
import { Variant } from '.';
import styles from './styles.module.scss';

interface WithStepperProgressBarProps {
  children: ReactNode;
  history: History;
  steps: { formContent: ReactNode; title: string }[];
  activeStepIndex: number;
  cancelModalTitle: string;
  isCompactSideMenu: boolean;
  hasSummaryWithinForm: boolean;
  stepperProgressBarConfig?: {
    isMobile?: boolean;
    isDarkMode?: boolean;
  };
  stepperProgressBarTitle?: ReactNode;
  onSave: (
    data: FieldValues,
    onSuccess: () => void,
    setFormResultData?: (data: any) => void,
  ) => void;
  onGoBack: () => void;
  onCancel: () => void;
  onGoForward: () => void;
  reset: UseFormReset<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  formState: FormState<FieldValues>;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  setFormResultData: (data: any) => void;
  isEditing?: boolean;
  setIsEditing?: React.Dispatch<React.SetStateAction<boolean>>;
  showCancelFlow?: boolean;
  setShowCancelFlow?: React.Dispatch<React.SetStateAction<boolean>>;
  variant: Variant;
}

export const WithStepperProgressBar = ({
  children,
  history,
  steps,
  activeStepIndex,
  cancelModalTitle,
  isCompactSideMenu,
  hasSummaryWithinForm,
  stepperProgressBarConfig = {},
  stepperProgressBarTitle,
  onSave,
  onGoBack,
  onCancel,
  onGoForward,
  handleSubmit,
  reset,
  getValues,
  formState: { isValid, isDirty, errors },
  setFormResultData,
  isEditing,
  setIsEditing,
  showCancelFlow,
  setShowCancelFlow,
  variant,
}: WithStepperProgressBarProps) => {
  const [transition, setTransition] = useState<{ unblock?: () => void; retry?: () => void }>({
    unblock: undefined,
    retry: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);

  const isSummaryPage = hasSummaryWithinForm && activeStepIndex === steps.length - 1;
  const isSingleStep = steps.length === 1;

  // Block the page transition
  // https://github.com/remix-run/history/blob/dev/docs/blocking-transitions.md
  useEffect(() => {
    if (isSummaryPage || !isDirty) {
      return;
    }
    const unblock = history.block((tx) => {
      setTransition({ unblock, retry: tx.retry });
    });

    return () => unblock();
  }, [isSummaryPage, isDirty, history]);

  const isFinalStep =
    (!hasSummaryWithinForm && activeStepIndex === steps.length - 1) ||
    (hasSummaryWithinForm && activeStepIndex === steps.length - 2);

  const shouldShowFormNavigationButtons = !isSummaryPage && isEditing;

  const onSuccess = () => {
    reset(getValues());
    setIsEditing?.(false);

    if (hasSummaryWithinForm) {
      onGoForward();
    }
  };

  const onContinue = async () => {
    if (isFinalStep) {
      setIsSaving(true);
      await handleSubmit((data: FieldValues) => onSave(data, onSuccess, setFormResultData))();
      setIsSaving(false);
      return;
    }
    onGoForward();
  };

  const handleCancel = () => {
    try {
      transition.unblock?.();
      transition.retry?.();
    } catch (e) {
      console.error(`Error during canceling ${cancelModalTitle}: ${e}`);
    }
    reset();
    setIsEditing?.(false);
    setShowCancelFlow?.(false);
  };

  const handleDismissModal = () => {
    setTransition({ unblock: undefined, retry: undefined });
    setShowCancelFlow?.(false);
  };

  // Disable the button if the form is invalid or saving. On the final step, we check for errors
  // since isValid may be true even if there are errors in hidden/collapsed fields.
  // Reference: https://github.com/react-hook-form/react-hook-form/issues/7178
  const isContinueDisabled = !isValid || isSaving || (isFinalStep && !!Object.keys(errors).length);

  return (
    <StepperProgressBarWrapper
      isSingleStep={isSingleStep}
      {...stepperProgressBarConfig}
      title={stepperProgressBarTitle}
      steps={steps.map(({ title }) => title)}
      activeStep={activeStepIndex}
      onGoBack={onGoBack}
      onCancel={onCancel}
      variant={variant}
    >
      <div className={styles.contentWrapper}>{children}</div>
      {shouldShowFormNavigationButtons && (
        <FloatingContainer isCompactSideMenu={isCompactSideMenu}>
          <FormNavigationButtons
            onContinue={onContinue}
            onCancel={onCancel}
            onPrevious={isSingleStep ? undefined : onGoBack}
            isFirstStep={!activeStepIndex}
            isFinalStep={isFinalStep}
            isDisabled={isContinueDisabled}
          />
        </FloatingContainer>
      )}
      {(transition.unblock || showCancelFlow) && (
        <CancelFlowModal
          flow={cancelModalTitle}
          dismissModal={handleDismissModal}
          handleCancel={handleCancel}
        />
      )}
    </StepperProgressBarWrapper>
  );
};

type StepperProgressBarWrapperProps = StepperProgressBarProps & {
  children: ReactNode;
  isSingleStep: boolean;
  onGoBack: () => void;
  onCancel: () => void;
  variant: Variant;
};

const StepperProgressBarWrapper = ({
  children,
  isSingleStep,
  onGoBack,
  onCancel,
  variant,
  ...stepperProgressBarProps
}: StepperProgressBarWrapperProps) => {
  if (isSingleStep) {
    return <>{children}</>;
  }

  if (variant === Variant.SIMPLE_HEADER) {
    return (
      <FixedHeaderContainer
        header={
          <HeaderWithBackAndClose
            title={stepperProgressBarProps.title}
            onGoBack={onGoBack}
            onCancel={onCancel}
          />
        }
      >
        {children}
      </FixedHeaderContainer>
    );
  }

  return (
    <FixedHeaderContainer header={<StepperProgressBar {...stepperProgressBarProps} />}>
      {children}
    </FixedHeaderContainer>
  );
};
