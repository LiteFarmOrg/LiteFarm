// See LF-2280 for context.

const nameChanges = [
  { old: 'Czech Republic', new: 'Czechia' },
  { old: 'Myanmar', new: 'Myanmar (Burma)' },
  { old: 'Macau', new: 'Macao' },
  { old: 'East Timor', new: 'Timor-Leste' },
  { old: 'Falkland Islands', new: 'Falkland Islands (Islas Malvinas)' },
];

const newCountries = [
  { country_name: 'Greenland', currency: 'Danish krone', symbol: 'kr', iso: 'DKK', unit: 'Metric' },
  {
    country_name: 'Gibraltar',
    currency: 'Gibraltar pound',
    symbol: '£',
    iso: 'GIP',
    unit: 'Metric',
  },
  {
    country_name: 'Puerto Rico',
    currency: 'United States dollar',
    symbol: '$',
    iso: 'USD',
    unit: 'Imperial',
  },
  {
    country_name: 'Guam',
    currency: 'United States dollar',
    symbol: '$',
    iso: 'USD',
    unit: 'Imperial',
  },
  {
    country_name: 'Caribbean Netherlands',
    currency: 'Netherlands Antillean guilder',
    symbol: 'ƒ',
    iso: 'ANG',
    unit: 'Metric',
  },
];

export const up = async function (knex) {
  for (const name of nameChanges) {
    await knex.schema.raw('UPDATE countries SET country_name = ? WHERE country_name = ?;', [
      name.new,
      name.old,
    ]);
  }
  await knex('countries').insert(newCountries);
};

export const down = async function (knex) {
  for (const name of nameChanges) {
    await knex.schema.raw('UPDATE countries SET country_name = ? WHERE country_name = ?;', [
      name.old,
      name.new,
    ]);
  }
  await knex('countries')
    .whereIn(
      'country_name',
      newCountries.map((country) => country.country_name),
    )
    .delete();
};
