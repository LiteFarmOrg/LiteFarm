export const up = function (knex) {
  return Promise.all([
    knex.raw('ALTER TABLE "users" ALTER COLUMN user_id SET DEFAULT uuid_generate_v1();'),
  ]);
};

export const down = function (knex) {
  return Promise.all([knex.raw('ALTER TABLE "users" ALTER COLUMN user_id DROP DEFAULT;')]);
};
