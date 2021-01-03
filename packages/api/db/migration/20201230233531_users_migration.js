exports.up = function(knex) {
  knex('users').select('*').join('userFarm', 'userFarm.user_id', 'users.user_id').then((users) => {
    const activeUsers = users.filter(({ user_id }) => /^\d+$/.test(user_id)).map(({ user_id }) => user_id);
    const isAllInvited = users.reduce((obj, { user_id, status }) => obj[user_id] ?
      { [user_id]: obj[user_id] && status === 'Invited', ...obj }:
      { [user_id]: status === 'Invited', ...obj }, {});
    const allInvitedUserFarms = Object.keys(isAllInvited).filter((k) => isAllInvited[k]);
    const legacy = users.filter(({ user_id }) => !allInvitedUserFarms.includes(user_id) && !activeUsers.includes(user_id)).map(({ user_id }) => user_id);
    return Promise.all([
      knex('users').whereIn('user_id', activeUsers).update({ status: 1 }),
      knex('users').whereIn('user_id', allInvitedUserFarms).update({ status: 2 }),
      knex('users').whereIn('user_id', legacy).update({ status: 3 }),
    ]);
  })
};

exports.down = function(knex) {
  return knex('users').update({ status: 1 });
};
