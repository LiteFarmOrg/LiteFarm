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

import { useState, useMemo, ReactNode } from 'react';
import { ClickAwayListener } from '@mui/material';
import Layout from '../../Layout';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';

interface MultiStepWithPageTitleProps {
  children: ReactNode;
  steps: { formContent: ReactNode; title: string }[];
  activeStepIndex: number;
  cancelModalTitle: string;
  onGoBack: () => void;
  onCancel: () => void;
}

export const MultiStepWithPageTitle = ({
  children,
  steps,
  activeStepIndex,
  cancelModalTitle,
  onGoBack,
  onCancel,
}: MultiStepWithPageTitleProps) => {
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);

  const progressBarValue = useMemo(
    () => (100 / (steps.length + 1)) * (activeStepIndex + 1),
    [steps, activeStepIndex],
  );

  const onClickAway = () => {
    setShowConfirmCancelModal(true);
  };

  const title = steps[activeStepIndex].title;

  return (
    <ClickAwayListener onClickAway={onClickAway} mouseEvent="onMouseDown" touchEvent="onTouchStart">
      <div>
        <Layout>
          {/* @ts-ignore */}
          <MultiStepPageTitle
            title={title}
            onGoBack={onGoBack}
            onCancel={onCancel}
            cancelModalTitle={cancelModalTitle}
            value={progressBarValue}
            showConfirmCancelModal={showConfirmCancelModal}
            setShowConfirmCancelModal={setShowConfirmCancelModal}
          />
          {children}
        </Layout>
      </div>
    </ClickAwayListener>
  );
};
