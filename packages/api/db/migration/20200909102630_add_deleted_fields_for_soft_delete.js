
exports.up = function(knex) {
  return Promise.all([
    knex.schema.alterTable('farm', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('field', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('crop', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false).alter();
    }),
    knex.schema.alterTable('disease', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('pesticide', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('taskType', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('fertilizer', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
    knex.schema.alterTable('fieldCrop', (t)=>{
      t.boolean('deleted').notNullable().defaultTo(false);
    }),
  ])
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.alterTable('farm', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('field', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('disease', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('pesticide', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('taskType', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('fertilizer', (t)=>{
      t.dropColumn('deleted')
    }),
    knex.schema.alterTable('fieldCrop', (t)=>{
      t.dropColumn('deleted')
    }),
  ]);
};
