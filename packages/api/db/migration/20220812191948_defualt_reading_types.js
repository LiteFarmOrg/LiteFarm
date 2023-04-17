export const up = function (knex) {
  return knex('partner_reading_type').insert([
    {
      partner_id: 0,
      readable_value: 'soil_water_content',
    },
    {
      partner_id: 0,
      readable_value: 'soil_water_potential',
    },
    {
      partner_id: 0,
      readable_value: 'temperature',
    },
  ]);
};

export const down = function (knex) {
  return knex.raw(
    `
    DELETE FROM partner_reading_type WHERE partner_id = 0 
    AND readable_value IN ('soil_water_content', 'soil_water_potential', 'temperature');
    `,
  );
};
