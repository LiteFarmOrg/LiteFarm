exports.up = async function(knex) {
  const invitedUser = await knex('users').where({ status_id: 2 });
  const userIds = invitedUser.map(user => user.user_id);
  await knex('showedSpotlight').whereIn('user_id', userIds).delete();

};

exports.down = async function(knex) {
  const invitedUser = await knex('users').where({ status_id: 2 });
  for (const user of invitedUser) {
    await knex('showedSpotlight').insert({ user_id: user.user_id });
  }
};
