import React from 'react';
import { useTranslation } from 'react-i18next';
import { harvestAmounts } from '../../../util/convert-units/unit';
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

  const harvest_everything = watch(HARVEST_EVERYTHING);

  return (
    <>
      {!isCompleted && (
        <>
          {!harvest_everything && (
            <Unit
              register={register}
              style={{ marginBottom: '40px' }}
              label={t('common:QUANTITY')}
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
              data-testid="harvest-quantity"
            />
          )}
          {harvest_everything && (
            <Checkbox
              style={{ marginBottom: '19px' }}
              label={t('ADD_TASK.HARVEST_EVERYTHING')}
              hookFormRegister={register(HARVEST_EVERYTHING)}
              sm
              disabled={disabled}
            />
          )}
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
  const harvest_uses = task.harvest_task.harvest_use;
  const harvest_uses_type_map = {};
  for (let i = 0; i < harvestUseTypes.length; i++) {
    harvest_uses_type_map[harvestUseTypes[i].harvest_use_type_id] = harvestUseTypes[i];
  }

  return (
    <>
      {harvest_uses?.map((use, index) => (
        <div key={`harvestUse-${index}`}>
          <ReactSelect
            style={{ marginBottom: '40px' }}
            label={t('TASK.HARVEST_USE')}
            defaultValue={{
              label: t(
                `harvest_uses:${
                  harvest_uses_type_map[use.harvest_use_type_id].harvest_use_type_translation_key
                }`,
              ),
              value: use.harvest_use_type_id,
            }}
            isDisabled={disabled}
          />
          <Unit
            register={register}
            style={{ marginBottom: '40px' }}
            label={t('common:QUANTITY')}
            name={`harvest_uses.${index}.quantity`}
            displayUnitName={`harvest_uses.${index}.quantity_unit`}
            unitType={harvestAmounts}
            system={system}
            defaultValue={use.quantity}
            hookFormSetValue={setValue}
            hookFormGetValue={getValues}
            hookFromWatch={watch}
            control={control}
            disabled={disabled}
            data-testid={`harvestuse-quantity-${index}`}
          />
        </div>
      ))}
    </>
  );
};
