export const up = function (knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.text('complete_notes');
    t.enu('rating', [0, 1, 2, 3, 4, 5]);
    t.string('abandon_reason');
  });
};

export const down = function (knex) {
  return knex.schema.alterTable('management_plan', (t) => {
    t.dropColumn('complete_notes');
    t.dropColumn('rating');
    t.dropColumn('abandon_reason');
  });
};
