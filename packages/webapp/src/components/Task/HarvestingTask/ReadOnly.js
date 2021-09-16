import React from 'react';
import { useTranslation } from 'react-i18next';
import { harvestAmounts } from '../../../util/unit';
import Checkbox from '../../Form/Checkbox';
import Unit from '../../Form/Unit';

export const PureHarvestingTaskReadOnly = ({
  system,
  register,
  control,
  setValue,
  getValues,
  watch,
  isCompleted,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const HARVEST_QUANTITY = 'harvest_task.projected_quantity';
  const HARVEST_QUANTITY_UNIT = 'harvest_task.projected_quantity_unit';
  const HARVEST_EVERYTHING = 'harvest_task.harvest_everything';

  return (
    <>
      {!isCompleted && (
        <>
          <Unit
            register={register}
            style={{ marginBottom: '12px' }}
            label={t('ADD_TASK.QUANTITY')}
            name={HARVEST_QUANTITY}
            displayUnitName={HARVEST_QUANTITY_UNIT}
            unitType={harvestAmounts}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            optional
            disabled={disabled}
          />
          <Checkbox
            style={{ marginBottom: '19px' }}
            label={t('ADD_TASK.HARVEST_EVERYTHING')}
            hookFormRegister={register(
              HARVEST_EVERYTHING
            )}
            sm
            disabled={disabled}
          />
        </>
      )}
      {isCompleted && (
        <>
          
        </>
      )}
    </>
  );
};

export const PureHavestTaskCompleted = ({
  system,
  register,
  control,
  setValue,
  getValues,
  watch,
  isCompleted,
  disabled = false,
}) => {

};
