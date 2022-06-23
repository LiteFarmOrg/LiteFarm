const formatAlterTableEnumSql = (tableName, columnName, enums) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
      "'::text, '",
    )}'::text]));`,
  ].join('\n');
};

exports.up = async function (knex) {
  await knex.raw(
    formatAlterTableEnumSql('figure', 'type', [
      'field',
      'farm_site_boundary',
      'greenhouse',
      'buffer_zone',
      'gate',
      'surface_water',
      'fence',
      'garden',
      'residence',
      'water_valve',
      'watercourse',
      'barn',
      'natural_area',
      'ceremonial_area',
      'pin',
      'sensor',
    ]),
  );
};

exports.down = async function (knex) {
  await knex.raw(
    formatAlterTableEnumSql('figure', 'type', [
      'field',
      'farm_site_boundary',
      'greenhouse',
      'buffer_zone',
      'gate',
      'surface_water',
      'fence',
      'garden',
      'residence',
      'water_valve',
      'watercourse',
      'barn',
      'natural_area',
      'ceremonial_area',
      'pin',
    ]),
  );
};
