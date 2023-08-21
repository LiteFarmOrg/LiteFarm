export const up = async function (knex) {
  return await knex.raw(`
    with subquery as (
        select ('{'||index-1||',name}')::text[] as name_path, ('{'||index-1||',value}')::text[] as value_path, n.notification_id,
            (select concat('"', replace(first_name, '"', E'\\\\"'), ' ', replace(last_name, '"', E'\\\\"'), '"')::jsonb from users u where u.user_id = (select t.updated_by_user_id from task t where t.task_id = (select n.ref->'entity'->>'id')::integer)) as user_name
        from notification n, jsonb_array_elements(n.variables) with ordinality arr(variable, index)
        where variable->>'name' = 'assignee' and body @> '{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}'
    ) update notification set variables = jsonb_set(
        jsonb_set(variables, subquery.name_path, '"assigner"', false),
        subquery.value_path,
        subquery.user_name,
        false
        )
    from subquery
    where notification.notification_id = subquery.notification_id;
  `);
};

export const down = async function (knex) {
  return await knex.raw(`
      with subquery as (
          select ('{'||index-1||',name}')::text[] as name_path, ('{'||index-1||',value}')::text[] as value_path, n.notification_id,
              (select concat('"', replace(first_name, '"', E'\\\\"'), ' ', replace(last_name, '"', E'\\\\"'),'"') ::jsonb from users u where u.user_id = (select t.assignee_user_id from task t where t.task_id = (select n.ref->'entity'->>'id')::integer)) as user_name
          from notification n, jsonb_array_elements(n.variables) with ordinality arr(variable, index)
          where variable->>'name' = 'assigner' and body @> '{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}'
      ) update notification set variables = jsonb_set(
          jsonb_set(variables, subquery.name_path, '"assignee"', false),
              subquery.value_path,
              subquery.user_name,
              false
          )
      from subquery
      where notification.notification_id = subquery.notification_id;
  `);
};
