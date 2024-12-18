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

import { ReactNode, useState } from 'react';
import {
  UseFormHandleSubmit,
  FieldValues,
  FormState,
  UseFormReset,
  UseFormGetValues,
} from 'react-hook-form';
import StepperProgressBar, { StepperProgressBarProps } from '../../StepperProgressBar';
import FloatingContainer from '../../FloatingContainer';
import FormNavigationButtons from '../FormNavigationButtons';
import FixedHeaderContainer from '../../Animals/FixedHeaderContainer';
import CancelFlowModal from '../../Modals/CancelFlowModal';
import styles from './styles.module.scss';
import { useBlocker } from 'react-router';

interface WithStepperProgressBarProps {
  children: ReactNode;
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
}

export const WithStepperProgressBar = ({
  children,
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
}: WithStepperProgressBarProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const isSummaryPage = hasSummaryWithinForm && activeStepIndex === steps.length - 1;
  const isSingleStep = steps.length === 1;

  // Block the page transition
  // https://github.com/remix-run/history/blob/dev/docs/blocking-transitions.md
  // Updated from ^ to use react router: https://reactrouter.com/6.28.0/hooks/use-blocker
  let blocker = useBlocker(() => !(isSummaryPage || !isDirty));

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
      blocker.reset?.();
      blocker.proceed?.();
    } catch (e) {
      console.error(`Error during canceling ${cancelModalTitle}: ${e}`);
    }
    reset();
    setIsEditing?.(false);
    setShowCancelFlow?.(false);
  };

  const handleDismissModal = () => {
    blocker.reset?.();
    setShowCancelFlow?.(false);
  };

  return (
    <StepperProgressBarWrapper
      isSingleStep={isSingleStep}
      {...stepperProgressBarConfig}
      title={stepperProgressBarTitle}
      steps={steps.map(({ title }) => title)}
      activeStep={activeStepIndex}
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
      {(blocker.reset || showCancelFlow) && (
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
};

const StepperProgressBarWrapper = ({
  children,
  isSingleStep,
  ...stepperProgressBarProps
}: StepperProgressBarWrapperProps) => {
  if (isSingleStep) {
    return <>{children}</>;
  }

  return (
    <FixedHeaderContainer header={<StepperProgressBar {...stepperProgressBarProps} />}>
      {children}
    </FixedHeaderContainer>
  );
};
