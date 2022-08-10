export const up = async function (knex) {
  await knex.schema.alterTable('file', (t) => {
    t.string('thumbnail_url').alter();
  });
};

// eslint-disable-next-line no-unused-vars
export const down = async function (knex) {};
