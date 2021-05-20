exports.up = async function(knex) {
  await knex('crop_variety').where({ crop_variety_name: null }).update({ crop_variety_name: '' });

  await knex.schema.alterTable('crop_variety', t => {
    t.string('crop_variety_name').notNullable().defaultTo('').alter();
    t.string('supplier');
    t.enum('seeding_type', ['SEED', 'SEEDLING_OR_PLANTING_STOCK']).notNullable().defaultTo('SEED');
    t.enum('lifecycle', ['ANNUAL', 'PERENNIAL']).notNullable().defaultTo('ANNUAL');
    t.string('compliance_file_url');
    t.boolean('organic');
    t.boolean('treated');
    t.boolean('genetically_engineered');
    t.boolean('searched');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('crop_variety', t => {
    t.string('crop_variety_name').nullable().alter();
    t.dropColumn('supplier');
    t.dropColumn('seeding_type');
    t.dropColumn('lifecycle');
    t.dropColumn('compliance_file_url');
    t.dropColumn('organic');
    t.dropColumn('treated');
    t.dropColumn('genetically_engineered');
    t.dropColumn('searched');
  });
};
