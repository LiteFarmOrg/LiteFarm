export const up = async function (knex) {
  await knex.schema.createTable('irrigation_type', (t) => {
    t.increments('irrigation_type_id').primary().notNullable();
    t.string('irrigation_type_name').notNullable();
    t.uuid('farm_id').defaultTo(null);
    t.string('default_measuring_type').notNullable();
  });

  await knex('irrigation_type').insert([
    {
      irrigation_type_name: 'HAND_WATERING',
      default_measuring_type: 'VOLUME',
    },
    {
      irrigation_type_name: 'CHANNEL',
      default_measuring_type: 'VOLUME',
    },
    {
      irrigation_type_name: 'DRIP',
      default_measuring_type: 'VOLUME',
    },
    {
      irrigation_type_name: 'FLOOD',
      default_measuring_type: 'VOLUME',
    },
    {
      irrigation_type_name: 'PIVOT',
      default_measuring_type: 'DEPTH',
    },
    {
      irrigation_type_name: 'SPRINKLER',
      default_measuring_type: 'DEPTH',
    },
    {
      irrigation_type_name: 'SUB_SURFACE',
      default_measuring_type: 'VOLUME',
    },
  ]);
};

export const down = function (knex) {
  return Promise.all([knex.schema.dropTable('irrigation_type')]);
};
