exports.up = async function (knex) {
  await knex.schema.alterTable('users', (table) => {
    table.string('phone_number').alter();
  });
  const farms = await knex.select('farm_id', 'phone_number').from('farm');
  await knex.schema.alterTable('farm', (table) => {
    table.dropColumn('phone_number');
    table.string('farm_phone_number');
  });
  const phoneNumberUpdates = []
  for (const farm of farms) {
    phoneNumberUpdates.push(knex('farm').findById(farm.farm_id).update(
      { farm_phone_number: farm.phone_number.number }));
  }
  return Promise.all(phoneNumberUpdates);
};

exports.down = async function (knex) {
  const farms = await knex.select('farm_id', 'farm_phone_number').from('farm');
  const users = await knex.select('user_id', 'phone_number').from('users');
  await knex.schema.alterTable('farm', (table) => {
    table.dropColumn('farm_phone_number');
    table.jsonb('phone_number');
  });
  await knex.schema.alterTable('users', (table) => {
    table.integer('phone_number').alter();
  });
  const updates = [];
  for (const farm of farms) {
    updates.push(knex('farm').findById(farm.farm_id).update(
      { phone_number: { number: farm.farm_phone_number, country: '' } }));
  }
  for (const user of users) {
    updates.push(knex('users').findById(user.user_id).update(
      { phone_number: parseInt(user.phone_number.replace(/\D/g, '')) }));
  }
  return Promise.all(updates);
};
