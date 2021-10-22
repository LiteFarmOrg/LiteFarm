
exports.up = async function(knex) {
  const { expense_type_id } = await knex('farmExpenseType')
    .where({ expense_name: 'Fertilizer' }).first();
  await knex('farmExpenseType').where({ expense_type_id }).update({
    expense_name: 'Soil Amendment',
    expense_translation_key: 'SOIL_AMENDMENT',
  });
};

exports.down = async function(knex) {
  const { expense_type_id } = await knex('farmExpenseType')
    .where({ expense_name: 'Soil Amendment' }).first();
  await knex('farmExpenseType').where({ expense_type_id }).update({
    expense_name: 'Fertilizer',
    expense_translation_key: 'FERTILIZER',
  });
};
