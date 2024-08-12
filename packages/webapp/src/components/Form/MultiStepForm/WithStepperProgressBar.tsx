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

import { ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormHandleSubmit, FieldValues, FormState } from 'react-hook-form';
import { History } from 'history';
import StepperProgressBar from '../../StepperProgressBar';
import FloatingContainer from '../../FloatingContainer';
import FormNavigationButtons from '../FormNavigationButtons';
import FixedHeaderContainer from '../../Animals/FixedHeaderContainer';
import styles from './styles.module.scss';

interface WithStepperProgressBarProps {
  children: ReactNode;
  history: History;
  steps: { formContent: ReactNode; title: string }[];
  activeStepIndex: number;
  isCompactSideMenu: boolean;
  hasSummaryWithinForm: boolean;
  stepperProgressBarConfig?: {
    isMobile?: boolean;
    isDarkMode?: boolean;
  };
  stepperProgressBarTitle?: ReactNode;
  onSave: (data: FieldValues, onGoForward: () => void) => void;
  onGoBack: () => void;
  onCancel: () => void;
  onGoForward: () => void;
  formState: FormState<FieldValues>;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
}

export const WithStepperProgressBar = ({
  children,
  history,
  steps,
  activeStepIndex,
  isCompactSideMenu,
  hasSummaryWithinForm,
  stepperProgressBarConfig = {},
  stepperProgressBarTitle,
  onSave,
  onGoBack,
  onCancel,
  onGoForward,
  handleSubmit,
  formState: { isValid },
}: WithStepperProgressBarProps) => {
  const { t } = useTranslation();

  const isSummaryPage = hasSummaryWithinForm && activeStepIndex === steps.length - 1;

  const isSummaryPageRef = useRef(isSummaryPage);

  useEffect(() => {
    isSummaryPageRef.current = isSummaryPage;
  }, [isSummaryPage]);

  // Block the page transition
  // https://github.com/remix-run/history/blob/dev/docs/blocking-transitions.md
  useEffect(() => {
    if (isSummaryPage) {
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
  }, [isSummaryPage]);

  const isFinalStep =
    (!hasSummaryWithinForm && activeStepIndex === steps.length - 1) ||
    (hasSummaryWithinForm && activeStepIndex === steps.length - 2);

  const shouldShowFormNavigationButtons = !isSummaryPage;

  const onContinue = () => {
    if (isFinalStep) {
      handleSubmit((data: FieldValues) => onSave(data, onGoForward))();
      return;
    }
    onGoForward();
  };

  return (
    <FixedHeaderContainer
      header={
        <StepperProgressBar
          {...stepperProgressBarConfig}
          title={stepperProgressBarTitle}
          steps={steps.map(({ title }) => title)}
          activeStep={activeStepIndex}
        />
      }
    >
      <div className={styles.contentWrapper}>{children}</div>
      {shouldShowFormNavigationButtons && (
        <FloatingContainer isCompactSideMenu={isCompactSideMenu}>
          <FormNavigationButtons
            onContinue={onContinue}
            onCancel={onCancel}
            onPrevious={onGoBack}
            isFirstStep={!activeStepIndex}
            isFinalStep={isFinalStep}
            isDisabled={!isValid}
          />
        </FloatingContainer>
      )}
    </FixedHeaderContainer>
  );
};
