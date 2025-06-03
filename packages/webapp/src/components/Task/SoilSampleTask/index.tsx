/*
 *  Copyright 2025 LiteFarm.org
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

import { Controller, useFieldArray, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BsChevronRight } from 'react-icons/bs';
import ReactSelect from '../../Form/ReactSelect';
import Input from '../../Form/Input';
import Unit from '../../Form/Unit';
import NumberInput from '../../Form/NumberInput';
import InputBaseLabel from '../../Form/InputBase/InputBaseLabel';
import { furrow_hole_depth } from '../../../util/convert-units/unit';
import { Location, System } from '../../../types';
import styles from './styles.module.scss';

type PureSoilSampleTaskProps = UseFormReturn & {
  system: System;
  disabled: boolean;
  task?: { locations: Location[] };
  locations: { location_id: number }[];
};

const PREFIX = 'soil_sample_task.';
const SAMPLES_PER_LOCATION = `${PREFIX}samples_per_location`;
const SAMPLE_DEPTHS_UNIT = `${PREFIX}sample_depths_unit`;
const SAMPLE_DEPTHS = `${PREFIX}sample_depths`;
const SAMPLING_TOOL = `${PREFIX}sampling_tool`;

const PureSoilSampleTask = ({
  system,
  disabled = false,
  task,
  locations: propLocations,
  ...props
}: PureSoilSampleTaskProps) => {
  const { control, register, setValue, getValues, watch } = props;

  const { fields, append, remove } = useFieldArray({
    name: SAMPLE_DEPTHS,
    control,
  });

  const { t } = useTranslation(['translation', 'common']);

  const locationLength = (task?.locations || propLocations)?.length;

  const sampleToolOptions = [
    { value: 'SOIL_PROBE', label: t('ADD_TASK.SOIL_SAMPLE_VIEW.SAMPLE_TOOL.SOIL_PROBE') },
    { value: 'AUGER', label: t('ADD_TASK.SOIL_SAMPLE_VIEW.SAMPLE_TOOL.AUGER') },
    { value: 'SPADE', label: t('ADD_TASK.SOIL_SAMPLE_VIEW.SAMPLE_TOOL.SPADE') },
  ];

  const adjustDepthRangeInputs = () => {
    const samplesPerLocation = getValues(SAMPLES_PER_LOCATION);
    if (fields.length < samplesPerLocation) {
      for (let i = 0; i < samplesPerLocation - fields.length; i++) {
        append({ from: null, to: null });
      }
    } else {
      for (let i = fields.length - 1; i >= samplesPerLocation; i--) {
        remove(i);
      }
    }
  };

  const unitProps = {
    unitType: furrow_hole_depth,
    register,
    control,
    hookFormSetValue: setValue,
    hookFormGetValue: getValues,
    hookFromWatch: watch,
    system,
    disabled,
    required: true,
  };

  return (
    <div className={styles.wrapper}>
      {/* @ts-expect-error */}
      <Input
        label={t('ADD_TASK.SOIL_SAMPLE_VIEW.LOCATION_COUNT')}
        value={locationLength}
        disabled
      />
      <div className={styles.locationDetail}>
        <NumberInput
          name={SAMPLES_PER_LOCATION}
          control={control}
          label={t('ADD_TASK.SOIL_SAMPLE_VIEW.SAMPLE_PER_LOCATION_COUNT')}
          showStepper
          defaultValue={getValues(SAMPLES_PER_LOCATION)}
          disabled={disabled}
          min={1}
          max={5} // TODO: confirm
          onBlur={adjustDepthRangeInputs}
          rules={{ required: { value: true, message: t('common:REQUIRED') } }}
        />
        {!!getValues(SAMPLES_PER_LOCATION) && !!fields.length && (
          <div className={styles.depths}>
            {fields.map((field, index) => {
              return (
                <div key={field.id}>
                  <InputBaseLabel
                    label={t('ADD_TASK.SOIL_SAMPLE_VIEW.SAMPLE_DEPTH_RANGE', { number: index + 1 })}
                  />
                  <div className={styles.depthRange}>
                    {/* @ts-expect-error */}
                    <Unit
                      name={`${SAMPLE_DEPTHS}.${index}.from`}
                      displayUnitName={SAMPLE_DEPTHS_UNIT}
                      // defaultValue={null} // TODO: LF-4835 Confirm
                      {...unitProps}
                    />
                    <span className={styles.arrow}>
                      <BsChevronRight />
                    </span>
                    {/* @ts-expect-error */}
                    <Unit
                      name={`${SAMPLE_DEPTHS}.${index}.to`}
                      displayUnitName={SAMPLE_DEPTHS_UNIT}
                      // defaultValue={null} // TODO: LF-4835 Confirm
                      {...unitProps}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Controller
        control={control}
        name={SAMPLING_TOOL}
        rules={{ required: true }}
        render={({ field: { onChange, value } }) => (
          <ReactSelect
            isDisabled={disabled}
            label={t('ADD_TASK.SOIL_SAMPLE_VIEW.SAMPLING_TOOL')}
            options={sampleToolOptions}
            value={sampleToolOptions.find((option) => option.value === value)}
            onChange={(e) => {
              onChange(e?.value);
            }}
          />
        )}
      />
    </div>
  );
};

export default PureSoilSampleTask;
