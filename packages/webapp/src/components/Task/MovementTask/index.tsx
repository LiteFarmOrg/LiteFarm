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

import { useEffect } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Controller, UseFormReturn } from 'react-hook-form';
import ReactSelect from '../../Form/ReactSelect';
import Input, { getInputErrors } from '../../Form/Input';
import { hookFormMaxCharsValidation } from '../../Form/hookformValidationUtils';
import styles from './styles.module.scss';
import { useGetAnimalMovementPurposesQuery } from '../../../store/api/apiSlice';
import { AnimalMovementPurpose } from '../../../store/api/types';

type PureMovementTaskProps = UseFormReturn & {
  disabled?: boolean;
};

const PureMovementTask = (props: PureMovementTaskProps) => {
  const {
    control,
    register,
    watch,
    getValues,
    setValue,
    formState: { errors },
    disabled = false,
  } = props;

  const { t } = useTranslation(['translation', 'message', 'animal']);
  const { data: purposes = [] } = useGetAnimalMovementPurposesQuery();

  const purposeOptions = purposes.map((purpose) => ({
    ...purpose,
    value: purpose.id,
    label: t(`animal:PURPOSE.${purpose.key}`),
  }));

  useEffect(() => {
    if (!purposeOptions.length) return;
    const purposeIds = getValues('movement_task.purpose_ids');
    if (purposeIds?.length) {
      const filteredPurposes = purposeOptions.filter(({ id }) => purposeIds.includes(id));
      setValue(PURPOSE, filteredPurposes);
    }
  }, [purposeOptions]);

  const PURPOSE = `movement_task.purpose`;
  const OTHER_PURPOSE_EXPLANATION = `movement_task.other_purpose_explanation`;

  const selectedPurposes: (AnimalMovementPurpose & { value: number; label: string })[] =
    watch(PURPOSE);

  return (
    <div className={clsx(styles.movementTaskDetailsContainer, disabled && styles.readonly)}>
      <Controller
        control={control}
        name={PURPOSE}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            value={value}
            label={t('ADD_TASK.MOVEMENT_VIEW.MOVEMENT_PURPOSE_LABEL')}
            options={purposeOptions}
            onChange={onChange}
            placeholder={t('ADD_TASK.MOVEMENT_VIEW.MOVEMENT_PURPOSE_PLACEHOLDER')}
            isMulti
            isDisabled={disabled}
          />
        )}
      />
      {selectedPurposes?.some((purpose) => purpose.key === 'OTHER') && (
        <>
          {/* @ts-ignore */}
          <Input
            label={t('ADD_TASK.MOVEMENT_VIEW.OTHER_PURPOSE_EXPLANATION_LABEL')}
            name={OTHER_PURPOSE_EXPLANATION}
            hookFormRegister={register(OTHER_PURPOSE_EXPLANATION, {
              shouldUnregister: true,
              maxLength: hookFormMaxCharsValidation(255),
            })}
            errors={getInputErrors(errors, OTHER_PURPOSE_EXPLANATION)}
            optional
            placeholder={t('ADD_TASK.MOVEMENT_VIEW.OTHER_PURPOSE_EXPLANATION_PLACEHOLDER')}
            disabled={disabled}
          />
        </>
      )}
    </div>
  );
};

export default PureMovementTask;
