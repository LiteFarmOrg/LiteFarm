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
import Loading from './Loading';
import styles from './styles.module.scss';

interface WithStepperProgressBarProps {
  children: ReactNode;
  history: History;
  steps: {
    formContent: ReactNode;
    title: string;
    onContinueAction?: (values: any) => Promise<void>;
    dataName?: string;
  }[];
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
  headerComponent?: (props: HeaderProps) => JSX.Element;
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
  formState: { isValid, isDirty },
  setFormResultData,
  isEditing,
  setIsEditing,
  showCancelFlow,
  setShowCancelFlow,
  headerComponent = StepperProgressBar,
}: WithStepperProgressBarProps) => {
  const [transition, setTransition] = useState<{ unblock?: () => void; retry?: () => void }>({
    unblock: undefined,
    retry: undefined,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    // Reset loading state whenever the step changes
    if (isLoading) {
      setIsLoading(false);
    }
  }, [activeStepIndex]);

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
    const { onContinueAction } = steps[activeStepIndex];

    if (onContinueAction) {
      setIsLoading(true);
      try {
        // Execute the custom action for the current step before proceeding to the next one
        await onContinueAction(getValues());
      } catch (error) {
        console.error(error);
        setIsLoading(false);
        return;
      }
    }

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

  if (isLoading) {
    return <Loading dataName={steps[activeStepIndex].dataName} />;
  }

  return (
    <StepperProgressBarWrapper
      isSingleStep={isSingleStep}
      {...stepperProgressBarConfig}
      title={stepperProgressBarTitle}
      steps={steps.map(({ title }) => title)}
      activeStep={activeStepIndex}
      onGoBack={onGoBack}
      onCancel={onCancel}
      headerComponent={headerComponent}
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
            isDisabled={!isValid || isSaving}
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

type HeaderProps = StepperProgressBarProps & {
  onGoBack: () => void;
  onCancel: () => void;
};

type StepperProgressBarWrapperProps = HeaderProps & {
  children: ReactNode;
  isSingleStep: boolean;
  headerComponent: (props: HeaderProps) => JSX.Element;
};

const StepperProgressBarWrapper = ({
  children,
  isSingleStep,
  headerComponent,
  ...stepperProgressBarProps
}: StepperProgressBarWrapperProps) => {
  if (isSingleStep) {
    return <>{children}</>;
  }

  return (
    <FixedHeaderContainer header={headerComponent(stepperProgressBarProps)}>
      {children}
    </FixedHeaderContainer>
  );
};
