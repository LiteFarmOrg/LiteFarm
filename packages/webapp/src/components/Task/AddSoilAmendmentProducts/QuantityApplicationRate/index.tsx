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

import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Collapse } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowUp';
import TextButton from '../../../Form/Button/TextButton';
import Switch from '../../../Form/Switch';
import Unit from '../../../Form/Unit';
import { type FormFields } from '../types';
import styles from './styles.module.scss';
import { soilAmounts, soilAmountsVolume } from '../../../../util/convert-units/unit';

export type QuantityApplicationRateProps = {
  productId: number | string;
  isReadOnly: boolean;
  farm: { farm_id: string; interested: boolean; country_id: number };
  system: 'metric' | 'imperial';
};

const TASK_PRODUCT_FIELD_NAMES = {
  WEIGHT: 'weight',
  WEIGHT_UNIT: 'weight_unit',
  VOLUME: 'volume',
  VOLUME_UNIT: 'volume_unit',
};

const QuantityApplicationRate = ({
  productId,
  isReadOnly,
  system = 'metric', // measurementSelector
}: QuantityApplicationRateProps) => {
  const { t } = useTranslation();
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isWeight, setIsWeight] = useState(true);

  const toggleUnit = () => setIsWeight((prev) => !prev);

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  const {
    control,
    getValues,
    setValue,
    handleSubmit,
    reset,
    setFocus,
    trigger,
    register,
    watch,
    formState: { errors, isValid, isDirty },
  } = useForm<FormFields>({
    mode: 'onBlur',
    // defaultValues,
  });

  /* -----------------
  temporarily in component */
  const SOIL_AMENDMENT_UNITS = {
    WEIGHT: {
      units: soilAmounts, // original
      label: t('ADD_TASK.SOIL_AMENDMENT_VIEW.IS_PERMITTED'),
    },
    VOLUME: {
      units: soilAmountsVolume,
      label: t('ADD_TASK.SOIL_AMENDMENT_VIEW.IS_PERMITTED'),
    },
  };
  /* ----------------- */

  return (
    <div className={styles.container}>
      <Switch
        leftLabel="Weight"
        label="Volume"
        isToggleVariant
        onChange={toggleUnit}
        checked={!isWeight}
      />
      <div className={styles.applicationRateCard}>
        {/* @ts-ignore */}
        <Unit
          label={t('common:QUANTITY')}
          data-cy="soilAmendment-quantity"
          style={{ marginBottom: '40px' }}
          register={register}
          name={TASK_PRODUCT_FIELD_NAMES[isWeight ? 'WEIGHT' : 'VOLUME']}
          displayUnitName={TASK_PRODUCT_FIELD_NAMES[isWeight ? 'WEIGHT_UNIT' : 'VOLUME_UNIT']}
          unitType={SOIL_AMENDMENT_UNITS[isWeight ? 'WEIGHT' : 'VOLUME'].units}
          system={system}
          hookFormSetValue={setValue}
          hookFormGetValue={getValues}
          hookFromWatch={watch}
          control={control}
          disabled={isReadOnly}
          required
          key={isWeight ? 'weight' : 'volume'}
        />
        <div className={clsx(styles.border, styles.advancedSection)}>
          <TextButton onClick={toggleExpanded} className={clsx(styles.advancedTitle)}>
            <span>{'Advanced'}</span>
            <KeyboardArrowDownIcon className={styles.expandIcon} />
          </TextButton>

          <Collapse
            id={`application_rate-${productId}`}
            in={isExpanded}
            timeout="auto"
            unmountOnExit
          >
            <div className={styles.sectionBody}>Expanded content</div>
          </Collapse>
        </div>
      </div>
    </div>
  );
};

export default QuantityApplicationRate;
