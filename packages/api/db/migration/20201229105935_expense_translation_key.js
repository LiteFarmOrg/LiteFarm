exports.up = function (knex) {
  return knex.schema.alterTable('farmExpenseType', (t) => {
    t.string('expense_translation_key')
  }).then(() => {
    return knex('farmExpenseType').select('*').where('farm_id', null)
      .then((data) => {
        return Promise.all(data.map((expense) => {
          return knex('farmExpenseType').where({ expense_type_id : expense.expense_type_id }).update({
            expense_translation_key: expense.expense_name.toUpperCase()
          })
        }))
      })
  })
};

exports.down = function (knex) {
  return knex.schema.alterTable('farmExpenseType', (t) => {
    t.dropColumn('expense_translation_key')
  })
};
