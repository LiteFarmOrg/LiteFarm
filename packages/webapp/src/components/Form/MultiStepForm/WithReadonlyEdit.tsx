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

import { ReactNode, useEffect, useRef, useState } from 'react';
import { UseFormHandleSubmit, FieldValues, FormState } from 'react-hook-form';
import { History } from 'history';
import FloatingContainer from '../../FloatingContainer';
import FormNavigationButtons from '../FormNavigationButtons';
import CancelFlowModal from '../../Modals/CancelFlowModal';
import styles from './styles.module.scss';

interface WithReadonlyEditProps {
  children: ReactNode;
  history: History;
  steps: { formContent: ReactNode; title: string }[];
  activeStepIndex: number;
  cancelModalTitle: string;
  isCompactSideMenu: boolean;
  hasSummaryWithinForm: boolean;
  onSave: (
    data: FieldValues,
    onGoForward: () => void,
    setFormResultData?: (data: any) => void,
  ) => void;
  onGoBack: () => void;
  onCancel: () => void;
  onGoForward: () => void;
  formState: FormState<FieldValues>;
  handleSubmit: UseFormHandleSubmit<FieldValues>;
  setFormResultData: (data: any) => void;
  isEditing: boolean;
}

export const WithReadonlyEdit = ({
  children,
  history,
  steps,
  activeStepIndex,
  cancelModalTitle,
  isCompactSideMenu,
  hasSummaryWithinForm,
  onSave,
  onGoBack,
  onCancel,
  onGoForward,
  handleSubmit,
  formState: { isValid, isDirty },
  setFormResultData,
  isEditing,
}: WithReadonlyEditProps) => {
  const [transition, setTransition] = useState<{ unblock?: () => void; retry?: () => void }>({
    unblock: undefined,
    retry: undefined,
  });

  const isSummaryPage = hasSummaryWithinForm && activeStepIndex === steps.length - 1;

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

  const onContinue = () => {
    if (isFinalStep) {
      handleSubmit((data: FieldValues) => onSave(data, onGoForward, setFormResultData))();
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
  };

  return (
    <>
      <div className={styles.contentWrapper}>{children}</div>
      {isEditing && (
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
      {isEditing && transition.unblock && (
        <CancelFlowModal
          flow={cancelModalTitle}
          dismissModal={() => setTransition({ unblock: undefined, retry: undefined })}
          handleCancel={handleCancel}
        />
      )}
    </>
  );
};
