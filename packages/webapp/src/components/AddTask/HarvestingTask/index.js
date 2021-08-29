import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Input from '../../Form/Input';
import { useFieldArray } from 'react-hook-form';
import { Info } from '../../Typography';
import PureManagementPlanTile from '../../CropTile/ManagementPlanTile';
import PageBreak from '../../PageBreak';
import Unit from '../../Form/Unit';
import { harvestAmounts } from '../../../util/unit';
import styles from './styles.module.scss';
import Checkbox from '../../Form/Checkbox';

const PureHarvestingTask = ({
  persistedFormData,
  setValue,
  getValues,
  watch,
  control,
  register,
  system,
  managementPlanByLocations,
}) => {
  const { t } = useTranslation();
  const managementPlansMap = useMemo(() => {
    return Object.keys(managementPlanByLocations).reduce((managementPlansMap, location_id) => {
      for (const managementPlan of managementPlanByLocations[location_id]) {
        managementPlansMap[managementPlan.management_plan_id] = managementPlan;
      }
      return managementPlansMap;
    }, {});
  }, []);

  const { fields, append } = useFieldArray({
    control,
    name: 'harvest_tasks',
    shouldUnregister: false,
  });
  const HARVEST_QUANTITY = 'quantity';
  const HARVEST_QUANTITY_UNIT = 'quantity_unit';
  const NOTES = 'harvest_task_notes';
  const HARVEST_EVERYTHING = 'harvest_everything';

  return (
    <>
      <Info style={{ marginBottom: '24px' }}>{t('ADD_TASK.HARVESTING_INFO')}</Info>
      {Object.keys(managementPlanByLocations).map((location_id) => {
        let location_name =
          managementPlanByLocations[location_id][0].planting_management_plans.final.location.name;
        return (
          <>
            <div style={{ paddingBottom: '16px' }} key={location_id}>
              <PageBreak label={location_name} />
            </div>
            <div className={styles.container}>
              {fields.map((field, index) => {
                let managementLocation = field.id.split('.')[0];
                let managementPlanId = field.id.split('.')[1];
                let managementPlan = managementPlansMap[managementPlanId];
                if (managementLocation === location_id) {
                  const is_harvest_everything = watch(
                    `harvest_tasks.${index}.` + HARVEST_EVERYTHING,
                  );
                  return (
                    <div className={styles.harvestDetails} style={{ marginBottom: '48px' }}>
                      <PureManagementPlanTile
                        key={managementPlanId}
                        managementPlan={managementPlan}
                        date={managementPlan.firstTaskDate}
                        status={managementPlan.status}
                      />
                      <div
                        className={styles.harvestInputs}
                        style={{ marginLeft: '24px' }}
                        key={field.id}
                      >
                        <Unit
                          register={register}
                          style={{ marginBottom: '10px' }}
                          label={t('ADD_TASK.QUANTITY')}
                          name={`harvest_tasks.${index}.` + HARVEST_QUANTITY}
                          displayUnitName={`harvest_tasks.${index}.` + HARVEST_QUANTITY_UNIT}
                          unitType={harvestAmounts}
                          system={system}
                          hookFormSetValue={setValue}
                          hookFormGetValue={getValues}
                          hookFromWatch={watch}
                          control={control}
                          disabled={is_harvest_everything}
                          optional
                        />
                        <Checkbox
                          defaultChecked={field[HARVEST_EVERYTHING]}
                          label={t('ADD_TASK.HARVEST_EVERYTHING')}
                          hookFormRegister={register(
                            `harvest_tasks.${index}.` + HARVEST_EVERYTHING,
                          )}
                        />
                        <Input
                          defaultValue={field[NOTES]}
                          style={{ paddingTop: '22px' }}
                          label={t('LOG_COMMON.NOTES')}
                          optional={true}
                          hookFormRegister={register(`harvest_tasks.${index}.` + NOTES)}
                          name={`harvest_tasks.${index}.` + NOTES}
                        />
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </>
        );
      })}
    </>
  );
};

export default PureHarvestingTask;
