exports.up = async function (knex) {
  await knex.schema.createTable('location', (t) => {
    t.uuid('location_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
    t.uuid('farm_id').references('farm_id').inTable('farm');
    t.string('name').notNullable();
    t.string('notes');
    t.boolean('deleted').defaultTo(false);
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at').notNullable();
    t.dateTime('updated_at').notNullable();
  })
  await Promise.all([
    knex.schema.createTable('figure', (t) => {
      t.uuid('figure_id').primary().defaultTo(knex.raw('uuid_generate_v1()'));
      t.enu('type', ['area', 'line', 'point']);
      t.uuid('location_id').references('location_id').inTable('location');
    }),
    knex.schema.createTable('area', (t) => {
      t.uuid('figure_id')
        .primary().references('figure_id')
        .inTable('figure');
      t.decimal('total_area').notNullable();
      t.jsonb('grid_points').notNullable();
      t.decimal('perimeter').nullable();
    }),
    knex.schema.createTable('line', (t) => {
      t.uuid('figure_id')
        .primary().references('figure_id')
        .inTable('figure');
      t.decimal('length').notNullable();
      t.decimal('width').nullable();
      t.jsonb('line_points').notNullable();
    }),
    knex.schema.createTable('point', (t) => {
      t.uuid('figure_id')
        .primary().references('figure_id')
        .inTable('figure');
      t.jsonb('point').notNullable();
    }),
    knex.schema.createTable('barn', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
      t.boolean('wash_and_pack');
      t.boolean('cold_storage');
    }),
    knex.schema.createTable('greenhouse', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
      t.enu('organic_status', ['Non-Organic', 'Transitional', 'Organic']).defaultTo('Non-Organic');
    }),
    knex.schema.createTable('natural_area', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
    }),
    knex.schema.createTable('ground_water', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
      t.boolean('user_for_irrigation');
    }),
    knex.schema.createTable('residence', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
    }),
    knex.schema.createTable('ceremonial_area', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
    }),
    knex.schema.createTable('fence', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
      t.boolean('pressure_treated');
    }),
    knex.schema.createTable('creek', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
      t.boolean('used_for_irrigation');
      t.boolean('includes_riparian_buffer');
      t.decimal('buffer_width');
    }),
    knex.schema.createTable('buffer_zone', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').onDelete('CASCADE');
    }),
    knex.schema.createTable('water_valve', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').unique().onDelete('CASCADE');
      t.enu('source', ['Municipal water', 'Surface water', 'Groundwater', 'Rain water'])
    }),
    knex.schema.createTable('gate', (t) => {
      t.uuid('location_id')
        .primary().references('location_id')
        .inTable('location').unique().onDelete('CASCADE');
    }),
  ]);
  const fields = await knex('field');
  await Promise.all(fields.map((field) => knex('location').insert({
    location_id: field.field_id,
    farm_id: field.farm_id,
    deleted: field.deleted,
    name: field.field_name,
    created_by_user_id: field.created_by_user_id,
    updated_by_user_id: field.updated_by_user_id,
    created_at: field.created_at,
    updated_at: field.updated_at,
  })));
  const figures = await Promise.all(fields.map((field) => knex('figure').insert({
    location_id: field.field_id,
    type: 'area',
  }).returning('*')));
  await Promise.all(figures.map((figure, i) => {
    const [{ figure_id }] = figure;
    return knex('area').insert({
      figure_id,
      total_area: fields[i].area,
      grid_points: JSON.stringify(fields[i].grid_points),
    })
  }));
  await knex.schema.alterTable('fieldCrop', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('location_id').inTable('location');
  });
  await knex.schema.alterTable('activityFields', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('location_id').inTable('location');
  });
  await knex.schema.alterTable('shiftTask', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('location_id').inTable('location');
  });
  await knex.schema.alterTable('field', (t) => {
    t.dropForeign('farm_id');
    t.dropForeign('created_by_user_id');
    t.dropForeign('updated_by_user_id');
    t.dropColumn('created_at');
    t.dropColumn('updated_at');
    t.dropColumn('deleted');
    t.dropColumn('created_by_user_id');
    t.dropColumn('updated_by_user_id');
    t.dropColumn('farm_id');
    t.dropColumn('grid_points');
    t.dropColumn('field_name');
    t.dropColumn('area');
    t.enu('organic_status', ['Non-Organic', 'Transitional', 'Organic']).defaultTo('Non-Organic');
    t.date('transition_date');
    t.foreign('field_id').references('location_id').inTable('location');
  });

};

exports.down = async function (knex) {
  const areaLocations = await knex.raw(`SELECT * FROM location l 
                                    JOIN field f ON l.location_id = f.field_id 
                                    JOIN figure fg ON fg.location_id = l.location_id
                                    JOIN area a ON fg.figure_id = a.figure_id;`);
  await knex.schema.alterTable('field', (t) => {
    t.uuid('farm_id').references('farm_id').inTable('farm');
    t.string('created_by_user_id').references('user_id').inTable('users');
    t.string('updated_by_user_id').references('user_id').inTable('users');
    t.dateTime('created_at');
    t.dateTime('updated_at');
    t.jsonb('grid_points');
    t.string('field_name');
    t.dropColumn('organic_status');
    t.dropColumn('transition_date');
    t.dropForeign('field_id');
    t.decimal('area');
    t.boolean('deleted').defaultTo(false);
  })
  await Promise.all(areaLocations.rows.map(({ deleted, farm_id, location_id, grid_points, total_area,
                            created_by_user_id, updated_by_user_id, name, created_at, updated_at }) => {
    return knex('field').update({
      area: total_area,
      farm_id,
      deleted,
      grid_points: JSON.stringify(grid_points),
      created_at,
      updated_at,
      created_by_user_id,
      updated_by_user_id,
      field_name: name,
    }).where({ field_id: location_id });
  }));
  await knex.schema.alterTable('fieldCrop', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('field_id').inTable('field');
  });
  await knex.schema.alterTable('activityFields', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('field_id').inTable('field');
  });
  await knex.schema.alterTable('shiftTask', (t) => {
    t.dropForeign('field_id');
    t.foreign('field_id').references('field_id').inTable('field');
  });
  await knex.schema.dropTable('gate');
  await knex.schema.dropTable('water_valve');
  await knex.schema.dropTable('buffer_zone');
  await knex.schema.dropTable('creek');
  await knex.schema.dropTable('fence');
  await knex.schema.dropTable('ceremonial_area');
  await knex.schema.dropTable('residence');
  await knex.schema.dropTable('ground_water');
  await knex.schema.dropTable('natural_area');
  await knex.schema.dropTable('greenhouse');
  await knex.schema.dropTable('barn');
  await knex.schema.dropTable('point');
  await knex.schema.dropTable('line');
  await knex.schema.dropTable('area');
  await knex.schema.dropTable('figure');
  await knex.schema.dropTable('location');
};
