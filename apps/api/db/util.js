const formatAlterTableEnumSql = (tableName, columnName, enums) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
      "'::text, '", // eslint-disable-line
    )}'::text]));`,
  ].join('\n');
};

const dropTableEnumConstraintSql = (tableName, columnName) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`;
};

const addTableEnumConstraintSql = (tableName, columnName, enums) => {
  const constraintName = `${tableName}_${columnName}_check`;
  return `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
    "'::text, '", // eslint-disable-line
  )}'::text]));`;
};

const getCropUniqueIdentifier = (crop) => {
  const { crop_common_name, crop_genus, crop_specie, farm_id } = crop;
  return { crop_common_name, crop_genus, crop_specie, farm_id };
};

export {
  formatAlterTableEnumSql,
  dropTableEnumConstraintSql,
  addTableEnumConstraintSql,
  getCropUniqueIdentifier,
};
