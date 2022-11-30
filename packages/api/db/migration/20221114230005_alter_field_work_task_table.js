// import fieldWorkData from '../../db/seeds/seedData/field_work.json';

export const up = async function (knex) {
  const fieldWorkData = [
    {
      field_work_type_translation_key: 'COVERING_SOIL',
      field_work_name: 'Covering soil',
    },
    {
      field_work_type_translation_key: 'FENCING',
      field_work_name: 'Fencing',
    },
    {
      field_work_type_translation_key: 'PREPARING_BEDS_OR_ROWS',
      field_work_name: 'Preparing beds or rows',
    },
    {
      field_work_type_translation_key: 'PRUNING',
      field_work_name: 'Pruning',
    },
    {
      field_work_type_translation_key: 'SHADE_CLOTH',
      field_work_name: 'Shade cloth',
    },
    {
      field_work_type_translation_key: 'TERMINATION',
      field_work_name: 'Termination',
    },
    {
      field_work_type_translation_key: 'TILLAGE',
      field_work_name: 'Tillage',
    },
    {
      field_work_type_translation_key: 'WEEDING',
      field_work_name: 'Weeding',
    },
  ];
  await knex.schema.createTable('field_work_type', function (t) {
    t.increments('field_work_type_id').primary();
    t.uuid('farm_id').references('farm_id').inTable('farm').defaultTo(null);
    t.string('field_work_name');
    t.string('field_work_type_translation_key');
    t.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    t.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    t.unique(['field_work_name', 'field_work_type_translation_key']);
  });

  await knex('field_work_type').insert(fieldWorkData);

  const field_work_rows = await knex('field_work_type').select(
    'field_work_type_id',
    'field_work_type_translation_key',
  );

  await knex.schema.alterTable('field_work_task', (t) => {
    t.integer('field_work_type_id').references('field_work_type_id').inTable('field_work_type');
    t.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    t.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
  });

  for (const row of field_work_rows) {
    await knex.raw(
      `UPDATE field_work_task SET field_work_type_id = ${row.field_work_type_id} WHERE type = '${row.field_work_type_translation_key}';`,
    );
  }

  await knex.raw(`
    ALTER TABLE "field_work_task"
    DROP CONSTRAINT IF EXISTS "field_work_task_type_check";
  `);

  return null;
};

export const down = async function (knex) {
  return Promise.all([
    await knex.raw('DROP TABLE "field_work_type" cascade'),
    await knex.schema.alterTable('field_work_task', (t) => {
      t.dropColumn('field_work_type_id');
      t.dropForeign('created_by_user_id');
      t.dropColumn('created_by_user_id');
      t.dropForeign('updated_by_user_id');
      t.dropColumn('updated_by_user_id');
      t.dropColumn('created_at');
      t.dropColumn('updated_at');
    }),
  ]);
};
