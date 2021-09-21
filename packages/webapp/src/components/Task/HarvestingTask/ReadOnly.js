import React from 'react';
import { useTranslation } from 'react-i18next';
import { harvestAmounts } from '../../../util/unit';
import Checkbox from '../../Form/Checkbox';
import Unit from '../../Form/Unit';
import ReactSelect from '../../Form/ReactSelect';

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
  task,
  harvestUseTypes,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const havrest_uses = task.harvest_task.harvest_use;
  console.log(havrest_uses);
  const harvest_uses_type_map = {};
  for (let i = 0; i < harvestUseTypes.length; i++) {
    harvest_uses_type_map[harvestUseTypes[i].harvest_use_type_id] = harvestUseTypes[i];
  }

  console.log(harvest_uses_type_map);

  return (
    <>
      {havrest_uses.map((use, index) => (
        <div>
          <ReactSelect
            style={{ marginBottom: '40px' }}
            label={t('TASK.HARVEST_USE')}
            defaultValue={{
              label: harvest_uses_type_map[use.harvest_use_type_id].harvest_use_type_name, 
              value: use.harvest_use_type_id
            }}
            isDisabled={disabled}
          />
          <Unit
            register={register}
            style={{ marginBottom: '40px' }}
            label={t('ADD_TASK.QUANTITY')}
            name={`harvest_uses.${index}.quantity`}
            displayUnitName={`harvest_uses.${index}.quantity_unit`}
            unitType={harvestAmounts}
            system={system}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            disabled={disabled}
            defaultValue={use.quantity}
          />
        </div>
      ))}
    </>
  )
};
