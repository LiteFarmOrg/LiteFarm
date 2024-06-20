/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const PERMISSION_NAME = 'get:animal_identifier_type';

export const up = async function (knex) {
  // Synchronize the permissions_permission_id_seq sequence with the latest permission_id value.
  await knex.raw(`
        SELECT setval('permissions_permission_id_seq', 
           COALESCE((SELECT MAX(permission_id)+1 FROM permissions), 1), 
           false);
`);

  const [{ permission_id }] = await knex('permissions')
    .insert({
      name: PERMISSION_NAME,
      description: 'get animal identifier types',
    })
    .returning('*');

  await knex('rolePermissions').insert([1, 2, 3, 5].map((role_id) => ({ role_id, permission_id })));
};
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = async function (knex) {
  await knex.raw(`
        DELETE FROM "rolePermissions" rp
        USING permissions p
        WHERE rp.permission_id = p.permission_id 
        AND p.name = '${PERMISSION_NAME}'
      `);
  await knex('permissions').where('name', PERMISSION_NAME).del();
};
