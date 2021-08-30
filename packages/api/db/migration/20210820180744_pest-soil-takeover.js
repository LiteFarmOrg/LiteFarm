const { formatAlterTableEnumSql } = require('../util');
exports.up = async function (knex) {
  const fertilizers = await knex('fertilizer').where({ farm_id: null });
  const pesticide = await knex('pesticide').where({ farm_id: null });
  await Promise.all(fertilizers.map(({ fertilizer_type }) => {
    const insert = { name: fertilizer_type, deleted: true, type: 'soil_amendment_task' };
    return knex('product').insert(insert);
  }));
  await Promise.all(pesticide.map(({ pesticide_name }) => {
    const insert = { name: pesticide_name, deleted: true, type: 'pest_control_task' };
    return knex('product').insert(insert);
  }));
  await knex.raw('ALTER TABLE pest_control_task DROP CONSTRAINT pest_control_task_type_check');
  await knex('pest_control_task').where({ control_method: 'handPick' }).update({ control_method: 'handWeeding' });
  await knex('pest_control_task').whereIn('control_method', [ 'burning', 'mulching', 'pruning', 'traps' ])
    .update({ control_method: 'heatTreatment' });
  await knex.raw(formatAlterTableEnumSql('pest_control_task', 'control_method', [ 'systemicSpray',
    'foliarSpray', 'handWeeding', 'biologicalControl', 'flameWeeding', 'soilFumigation', 'heatTreatment', 'other',
  ]))

};

exports.down = async function (knex) {
  await knex('product').where({
    farm_id: null,
    deleted: true,
  }).whereIn('type', [ 'soil_amendment_task', 'pest_control_task' ]);
  await knex.raw('ALTER TABLE pest_control_task DROP CONSTRAINT pest_control_task_control_method_check');
  await knex('pest_control_task').where({ control_method: 'handWeeding' }).update({ control_method: 'handPick' });
  await knex('pest_control_task').where({ control_method: 'heatTreatment' })
    .update({ control_method: 'burning' });
  await knex.raw(formatAlterTableEnumSql('pest_control_task', 'control_method', [
    'systemicSpray', 'foliarSpray', 'handPick', 'biologicalControl', 'burning', 'soilFumigation', 'heatTreatment',
    'flameWeeding', 'mulching', 'pruning', 'traps', 'other',
  ]));
};
