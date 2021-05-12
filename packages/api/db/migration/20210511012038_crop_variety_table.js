exports.up = async function(knex) {
  await knex.schema.createTable('crop_variety', (t) => {
    t.uuid('crop_variety_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.integer('crop_id')
      .references('crop_id')
      .inTable('crop').notNullable();
    t.string('crop_variety_name');
    t.uuid('farm_id').references('farm_id').inTable('farm');
    t.boolean('deleted').defaultTo(false);
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();
  });
  const fieldCrops = await knex('fieldCrop').distinct('fieldCrop.crop_id', 'location.farm_id', 'crop.crop_common_name')
    .join('crop', 'crop.crop_id', 'fieldCrop.crop_id')
    .join('location', 'location.location_id', 'fieldCrop.location_id')
    .where('fieldCrop.deleted', false);
  const defaultDate = new Date('2000/1/1').toISOString();
  const varieties = fieldCrops.map(fieldCrop => {
    const [crop_common_name, crop_variety_name] = fieldCrop.crop_common_name.split(/ - (.*)/);
    return {
      crop_id: fieldCrop.crop_id,
      farm_id: fieldCrop.farm_id,
      crop_variety_name: crop_variety_name || null,
      created_by_user_id: 1,
      updated_by_user_id: 1,
      created_at: defaultDate,
      updated_at: defaultDate,
    };
  });
  await knex.batchInsert('crop_variety', varieties);
};

exports.down = function(knex) {
  return knex.schema.dropTable('crop_variety');
};
