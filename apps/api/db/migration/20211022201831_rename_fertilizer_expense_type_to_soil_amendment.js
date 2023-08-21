export const up = async function (knex) {
  const fertilizerType = await knex('farmExpenseType')
    .where({ expense_name: 'Fertilizer' })
    .first();
  if (fertilizerType) {
    const { expense_type_id } = fertilizerType;
    await knex('farmExpenseType').where({ expense_type_id }).update({
      expense_name: 'Soil Amendment',
      expense_translation_key: 'SOIL_AMENDMENT',
    });
  }
};

export const down = async function (knex) {
  const soilAmendmentType = await knex('farmExpenseType')
    .where({ expense_name: 'Soil Amendment' })
    .first();
  if (soilAmendmentType) {
    const { expense_type_id } = soilAmendmentType;
    await knex('farmExpenseType').where({ expense_type_id }).update({
      expense_name: 'Fertilizer',
      expense_translation_key: 'FERTILIZER',
    });
  }
};
