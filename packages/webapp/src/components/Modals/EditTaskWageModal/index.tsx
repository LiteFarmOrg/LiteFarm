/*
 *  Copyright 2026 LiteFarm.org
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

import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ModalComponent from '../ModalComponent/v2';
import Button from '../../Form/Button';
import HourlyWageInputs from '../../Task/AssignTask/HourlyWageInputs';
import {
  HOURLY_WAGE,
  HOURLY_WAGE_ACTION,
  hourlyWageActions,
} from '../../Task/AssignTask/constants';
import { roundToTwo } from '../../../util/rounding';

interface EditTaskWageFormFields {
  [HOURLY_WAGE_ACTION]: string;
  [HOURLY_WAGE]: number | null;
}

interface TaskWagePatch {
  wage_at_moment: number | null;
  override_hourly_wage: boolean;
}

interface EditTaskWageModalProps {
  dismissModal: () => void;
  onSave: (data: TaskWagePatch) => void;
  wage_at_moment: number | null;
  override_hourly_wage: boolean;
}

interface WageActionChangeEvent {
  target: {
    value: typeof hourlyWageActions.FOR_THIS_TASK | typeof hourlyWageActions.NO;
  };
}

export default function EditTaskWageModal({
  dismissModal,
  onSave,
  wage_at_moment,
  override_hourly_wage,
}: EditTaskWageModalProps) {
  const { t } = useTranslation();

  const hasTaskWageOverride = override_hourly_wage;

  const {
    register,
    control,
    watch,
    handleSubmit,
    resetField,
    formState: { errors, isValid, isDirty },
  } = useForm<EditTaskWageFormFields>({
    mode: 'onChange',
    defaultValues: {
      [HOURLY_WAGE_ACTION]: hasTaskWageOverride
        ? hourlyWageActions.FOR_THIS_TASK
        : hourlyWageActions.NO,
      [HOURLY_WAGE]: hasTaskWageOverride ? wage_at_moment : null,
    },
  });

  const selectedHourlyWageAction = watch(HOURLY_WAGE_ACTION);
  const shouldSetWage = selectedHourlyWageAction === hourlyWageActions.FOR_THIS_TASK;

  const handleWageChange = ({ target }: WageActionChangeEvent) => {
    if (target?.value === hourlyWageActions.NO) {
      resetField(HOURLY_WAGE);
    }
  };

  const onSubmit = (data: EditTaskWageFormFields) => {
    if (data[HOURLY_WAGE_ACTION] === hourlyWageActions.FOR_THIS_TASK) {
      onSave({
        wage_at_moment: roundToTwo(data[HOURLY_WAGE]),
        override_hourly_wage: true,
      });
    } else if (data[HOURLY_WAGE_ACTION] === hourlyWageActions.NO) {
      onSave({
        wage_at_moment: null,
        override_hourly_wage: false,
      });
    }
    dismissModal();
  };

  return (
    <ModalComponent
      dismissModal={dismissModal}
      title={t('ADD_TASK.EDIT_TASK_WAGE')}
      buttonGroup={
        <>
          <Button onClick={dismissModal} color="secondary" sm>
            {t('common:CANCEL')}
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={!isValid || !isDirty}
            color="primary"
            sm
          >
            {t('common:SAVE')}
          </Button>
        </>
      }
    >
      <HourlyWageInputs
        register={register}
        control={control}
        errors={errors}
        shouldSetWage={shouldSetWage}
        onHourlyWageActionChange={handleWageChange}
      />
    </ModalComponent>
  );
}
