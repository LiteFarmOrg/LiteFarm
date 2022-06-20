exports.up = async function (knex) {
  return await knex.raw(`
      with user_name_type as (
        select ('{'||index-1||',name}')::text[] as path
        from notification n, jsonb_array_elements(n.variables) with ordinality arr(variable, index)
        where variable->>'name' = 'assignee' and body @> '{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}'
      ) update notification set variables = jsonb_set(variables, user_name_type.path, '"assigner"', false)
      from user_name_type
      where notification.variables @> '[{"name": "assignee"}]' and body @> '{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}';
    `);
};

exports.down = async function (knex) {
  return await knex.raw(`
    with user_name_type as (
      select ('{'||index-1||',name}')::text[] as path
      from notification n, jsonb_array_elements(n.variables) with ordinality arr(variable, index)
      where variable->>'name' = 'assigner' and body @> '{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}'
    ) update notification set variables = jsonb_set(variables, user_name_type.path, '"assignee"', false)
    from user_name_type
    where notification.variables @> '[{"name": "assigner"}]' and body @> '{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}';
  `);
};
