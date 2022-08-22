import { formatAlterTableEnumSql } from '../util.js';

export const up = async function (knex) {
  const fertilizers = await knex('fertilizer').whereNull('farm_id');
  const pesticide = await knex('pesticide').whereNull('farm_id');
  const soilTasks = await knex('soil_amendment_task').whereNotNull('historic_product_id');
  const pestTasks = await knex('pest_control_task').whereNotNull('historic_product_id');
  await Promise.all(
    fertilizers.map(async ({ fertilizer_type, fertilizer_id }) => {
      const insert = { name: fertilizer_type, deleted: true, type: 'soil_amendment_task' };
      const [{ product_id }] = await knex('product').insert(insert).returning('*');
      return Promise.all(
        soilTasks
          .filter(({ historic_product_id }) => historic_product_id === fertilizer_id)
          .map(({ task_id }) => {
            return knex('soil_amendment_task').update({ product_id }).where({ task_id });
          }),
      );
    }),
  );
  await Promise.all(
    pesticide.map(async ({ pesticide_name, pesticide_id }) => {
      const insert = { name: pesticide_name, deleted: true, type: 'pest_control_task' };
      const [{ product_id }] = await knex('product').insert(insert).returning('*');
      return Promise.all(
        pestTasks
          .filter(({ historic_product_id }) => historic_product_id === pesticide_id)
          .map(({ task_id }) => {
            return knex('pest_control_task').update({ product_id }).where({ task_id });
          }),
      );
    }),
  );
  await knex.raw('ALTER TABLE pest_control_task DROP CONSTRAINT pest_control_task_type_check');
  await knex('pest_control_task')
    .where({ control_method: 'handPick' })
    .update({ control_method: 'handWeeding' });
  await knex('pest_control_task')
    .whereIn('control_method', ['burning', 'mulching', 'pruning', 'traps'])
    .update({ control_method: 'heatTreatment' });
  await knex.raw(
    formatAlterTableEnumSql('pest_control_task', 'control_method', [
      'systemicSpray',
      'foliarSpray',
      'handWeeding',
      'biologicalControl',
      'flameWeeding',
      'soilFumigation',
      'heatTreatment',
      'other',
    ]),
  );
  await knex.schema.alterTable('soil_amendment_task', (t) => {
    t.dropColumn('historic_product_id');
  });
  await knex.schema.alterTable('pest_control_task', (t) => {
    t.dropColumn('historic_product_id');
  });
};

export const down = async function (knex) {
  await knex('product')
    .where({
      farm_id: null,
      deleted: true,
    })
    .whereIn('type', ['soil_amendment_task', 'pest_control_task']);
  await knex.raw(
    'ALTER TABLE pest_control_task DROP CONSTRAINT pest_control_task_control_method_check',
  );
  await knex('pest_control_task')
    .where({ control_method: 'handWeeding' })
    .update({ control_method: 'handPick' });
  await knex('pest_control_task')
    .where({ control_method: 'heatTreatment' })
    .update({ control_method: 'burning' });
  await knex.raw(
    formatAlterTableEnumSql('pest_control_task', 'control_method', [
      'systemicSpray',
      'foliarSpray',
      'handPick',
      'biologicalControl',
      'burning',
      'soilFumigation',
      'heatTreatment',
      'flameWeeding',
      'mulching',
      'pruning',
      'traps',
      'other',
    ]),
  );
};
