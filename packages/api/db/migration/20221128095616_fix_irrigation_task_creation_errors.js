export const up = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.string('default_measuring_type');
  });
  const irrigation_type_enum = [
    'sprinkler',
    'drip',
    'subsurface',
    'flood',
    'HAND_WATERING',
    'CHANNEL',
    'DRIP',
    'FLOOD',
    'PIVOT',
    'SPRINKLER',
    'SUB_SURFACE',
  ];

  // add new enum values
  await knex.schema
    .raw(`ALTER TABLE irrigation_task DROP CONSTRAINT IF EXISTS irrigationLog_type_check;
                          ALTER TABLE irrigation_task ADD CONSTRAINT irrigationLog_type_check 
                           CHECK (type = ANY (ARRAY['${irrigation_type_enum.join(
                             `'::text,'`,
                           )}'::text]))`);
};

export const down = async function (knex) {
  await knex.schema.alterTable('irrigation_task', (table) => {
    table.dropColumn('default_measuring_type');
  });
  const irrigation_type_enum = ['sprinkler', 'drip', 'subsurface', 'flood'];
  await knex.schema
    .raw(`ALTER TABLE irrigation_task DROP CONSTRAINT IF EXISTS irrigationLog_type_check;
                          ALTER TABLE irrigation_task ADD CONSTRAINT irrigationLog_type_check 
                           CHECK (type = ANY (ARRAY['${irrigation_type_enum.join(
                             `'::text,'`,
                           )}'::text]))`);
};
