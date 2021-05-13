exports.up = function(knex) {
  return knex.schema.alterTable('crop_variety', t => {
    t.string('crop_variety_name').notNullable().defaultTo('').alter();
    t.string('supplier');
    t.enum('seeding_type', ['SEED', 'SEEDLING_OR_PLANTING_STOCK']).notNullable().defaultTo('SEED');
    t.enum('lifecycle', ['ANNUAL', 'PERENNIAL']).notNullable().defaultTo('ANNUAL');
    t.string('compliance_file_url');
    t.boolean('organic');
    t.boolean('GMO');
    t.boolean('treated');
    t.boolean('pelleted');
    t.boolean('coated');
    t.boolean('primed');
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
    t.dropColumn('GMO');
    t.dropColumn('treated');
    t.dropColumn('pelleted');
    t.dropColumn('coated');
    t.dropColumn('primed');
  });
};
