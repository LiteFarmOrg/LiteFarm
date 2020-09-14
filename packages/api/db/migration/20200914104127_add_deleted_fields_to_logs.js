
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('activityLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('fertilizerLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('pestControlLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false).alter();
    }),
    knex.schema.alterTable('scoutingLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('irrigationLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('fieldWorkLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('soilDataLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('seedLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('harvestLog', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.alterTable('activityLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('fertilizerLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('pestControlLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('scoutingLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('irrigationLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('fieldWorkLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('soilDataLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('seedLog', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('harvestLog', (t)=>{
      t.dropColumn('deleted')
    }),
  ]);
};
