
exports.up = function(knex) {
  return knex.schema.alterTable('emailToken', t=>{
    t.dropPrimary();
    t.uuid('invitation_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.unique(['user_id', 'farm_id']);
    t.dropColumn('token');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('emailToken', t=>{
    t.dropPrimary();
    t.dropUnique(['user_id', 'farm_id']);
    t.primary(['user_id', 'farm_id']);
    t.dropColumn('invitation_id');
    t.text('token');
  });
};
