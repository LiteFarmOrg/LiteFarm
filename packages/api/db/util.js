module.exports = {
  formatAlterTableEnumSql : (
    tableName,
    columnName,
    enums,
  ) => {
    const constraintName = `${tableName}_${columnName}_check`;
    return [
      `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
      `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
        "'::text, '" // eslint-disable-line
      )}'::text]));`,
    ].join('\n');
  },
};
