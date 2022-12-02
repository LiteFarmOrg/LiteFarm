// import fieldWorkData from '../../db/seeds/seedData/field_work.json';

export const up = async function (knex) {
  let fieldWorkData = await knex.raw(`
    SELECT 
    DISTINCT TRIM(t.other_type) AS field_work_name, 
    TRIM(REPLACE(UPPER(t.other_type),' ', '_')) AS field_work_type_translation_key, 
    l.farm_id,
    f.created_by_user_id,
    f.updated_by_user_id
        FROM 
          (
            SELECT * FROM field_work_task AS fwt
            JOIN location_tasks as lt
            ON lt.task_id = fwt.task_id  
            WHERE type='OTHER'
          ) as t 
        JOIN location AS l
      JOIN farm AS f
    ON f.farm_id = l.farm_id
    ON l.location_id = t.location_id;
  `);

  fieldWorkData = [
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
    ...fieldWorkData.rows,
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
    t.unique(['field_work_name', 'field_work_type_translation_key', 'farm_id']);
  });

  await knex('field_work_type').insert(fieldWorkData);

  const field_work_rows = await knex('field_work_type').select(
    'field_work_type_id',
    'field_work_type_translation_key',
    'farm_id',
    'field_work_name',
  );

  await knex.schema.alterTable('field_work_task', (t) => {
    t.integer('field_work_type_id').references('field_work_type_id').inTable('field_work_type');
    t.string('created_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.string('updated_by_user_id').references('user_id').inTable('users').defaultTo('1');
    t.dateTime('created_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
    t.dateTime('updated_at').defaultTo(new Date('2000/1/1').toISOString()).notNullable();
  });

  for (const row of field_work_rows) {
    if (row.farm_id) {
      await knex.raw(
        `UPDATE field_work_task SET field_work_type_id = ${row.field_work_type_id} WHERE type = 'OTHER' AND other_type = '${row.field_work_name}'::text;`,
      );
    } else {
      await knex.raw(
        `UPDATE field_work_task SET field_work_type_id = ${row.field_work_type_id} WHERE type = '${row.field_work_type_translation_key}';`,
      );
    }
  }

  await knex.raw(`
    ALTER TABLE "field_work_task"
    DROP COLUMN IF EXISTS "type",
    DROP COLUMN IF EXISTS "other_type",
    DROP CONSTRAINT IF EXISTS "field_work_task_type_check";
  `);

  return null;
};

export const down = async function (knex) {
  await knex.schema.alterTable('field_work_task', (t) => {
    t.string('type');
    t.string('other_type');
  });

  const field_work_tasks = await knex('field_work_task').select('*');
  for (const task of field_work_tasks) {
    if (task.field_work_type_id) {
      const { rows = [] } = await knex.raw(
        `SELECT * FROM field_work_type WHERE field_work_type_id=${task.field_work_type_id}`,
      );
      if (rows.length) {
        const row = rows[0];
        if (row.farm_id) {
          await knex.raw(
            `UPDATE field_work_task SET type = 'OTHER', other_type = '${row.field_work_name}'::text WHERE field_work_type_id = ${row.field_work_type_id}`,
          );
        } else {
          await knex.raw(
            `UPDATE field_work_task SET type = '${row.field_work_type_translation_key}' WHERE field_work_type_id = ${row.field_work_type_id};`,
          );
        }
      }
    }
  }
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
    await knex.raw(`
      ALTER TABLE "field_work_task"
      ADD CONSTRAINT "field_work_task_type_check" 
      CHECK ("type" IN (
        'COVERING_SOIL',
        'FENCING',
        'PREPARING_BEDS_OR_ROWS',
        'PRUNING',
        'SHADE_CLOTH',
        'TERMINATION',
        'TILLAGE',
        'WEEDING',
        'OTHER'
      ));
    `),
  ]);
};
