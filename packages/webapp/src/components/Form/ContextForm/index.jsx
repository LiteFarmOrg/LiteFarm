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

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import { WithPageTitle } from './WithPageTitle';
import { WithStepperProgressBar } from './WithStepperProgressBar';
import { WithReadonlyEdit } from './SingleStepWithReadonlyEdit';

export const VARIANT = {
  PAGE_TITLE: 'page_title',
  STEPPER_PROGRESS_BAR: 'stepper_progress_bar',
  READONLY_EDIT: 'readonly_edit',
};

const components = {
  [VARIANT.PAGE_TITLE]: (props) => <WithPageTitle {...props} />,
  [VARIANT.STEPPER_PROGRESS_BAR]: (props) => <WithStepperProgressBar {...props} />,
  [VARIANT.READONLY_EDIT]: (props) => <WithReadonlyEdit {...props} />,
};

export const ContextForm = ({
  history,
  getSteps,
  defaultFormValues,
  variant = VARIANT.PAGE_TITLE,
  isEditing = true,
  setIsEditing,
  ...props
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [formData, setFormData] = useState();
  const [formResultData, setFormResultData] = useState();
  const [showCancelFlow, setShowCancelFlow] = useState(false);

  const form = useForm({
    mode: 'onBlur',
    defaultValues: defaultFormValues,
  });

  const steps = useMemo(() => getSteps(formData), [getSteps, formData]);

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
    if (isEditing) {
      if (form.formState.isDirty) {
        setShowCancelFlow(true);
      } else {
        setIsEditing?.(false);
      }
      return;
    }
    history.back();
  };

  const { FormContent } = steps[activeStepIndex];

  const Component = components[variant];

  return (
    <Component
      history={history}
      steps={steps}
      activeStepIndex={activeStepIndex}
      onGoBack={onGoBack}
      onCancel={onCancel}
      onGoForward={onGoForward}
      setFormResultData={setFormResultData}
      isEditing={isEditing}
      setIsEditing={setIsEditing}
      showCancelFlow={showCancelFlow}
      setShowCancelFlow={setShowCancelFlow}
      {...form}
      {...props}
    >
      <FormProvider {...form}>
        <FormContent
          onGoForward={onGoForward}
          form={form}
          formResultData={formResultData}
          history={history}
          isEditing={isEditing}
        />
      </FormProvider>
    </Component>
  );
};

ContextForm.propTypes = {
  variant: PropTypes.oneOf(Object.values(VARIANT)),
  history: PropTypes.object,
  getSteps: PropTypes.func,
  defaultFormValues: PropTypes.object,
  cancelModalTitle: PropTypes.string,

  // STEPPER_PROGRESS_BAR variant
  isCompactSideMenu: PropTypes.bool,
  hasSummaryWithinForm: PropTypes.bool,
  onSave: PropTypes.func,
  stepperProgressBarConfig: PropTypes.shape({
    isMobile: PropTypes.bool,
    isDarkMode: PropTypes.bool,
  }),
  stepperProgressBarTitle: PropTypes.node,
};
