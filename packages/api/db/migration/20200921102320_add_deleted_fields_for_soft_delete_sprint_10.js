exports.up = function(knex) {
    return Promise.all([
      knex.schema.alterTable('yield', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('todo', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('sale', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('price', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('plan', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('farmExpense', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('farmExpenseType', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('role', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
      knex.schema.alterTable('activityLog', (t)=>{
        t.boolean('deleted').notNullable().defaultTo(false);
      }),
    ])
  };

  exports.down = function(knex) {
    return Promise.all([
      knex.schema.alterTable('yield', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('todo', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('sale', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('price', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('plan', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('farmExpense', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('farmExpenseType', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('role', (t)=>{
        t.dropColumn('deleted')
      }),
      knex.schema.alterTable('activityLog', (t)=>{
        t.dropColumn('deleted')
      }),
    ]);
  };
