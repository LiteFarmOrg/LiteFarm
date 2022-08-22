const newFields = [
  { name: 'translation_key', defn: 'character varying(255) COLLATE pg_catalog."default"' },
  { name: 'variables', defn: 'jsonb' },
  { name: 'entity_id', defn: 'character varying(255) COLLATE pg_catalog."default"' },
  { name: 'entity_type', defn: 'character varying(255) COLLATE pg_catalog."default"' },
  { name: 'context', defn: 'jsonb' },
];

const oldFields = [
  { name: 'title', defn: 'character varying(255) COLLATE pg_catalog."default"' },
  { name: 'body', defn: 'text COLLATE pg_catalog."default"' },
  { name: 'ref_table', defn: 'text COLLATE pg_catalog."default"' },
  { name: 'ref_subtable', defn: 'text COLLATE pg_catalog."default"' },
  { name: 'ref_pk', defn: 'character varying(255) COLLATE pg_catalog."default"' },
];

export const up = async function (knex) {
  for (const field of oldFields) {
    await knex.raw(`ALTER TABLE notification DROP COLUMN ${field.name};`);
  }
  for (const field of newFields) {
    await knex.raw(`ALTER TABLE notification ADD COLUMN ${field.name} ${field.defn};`);
  }
};

export const down = async function (knex) {
  for (const field of newFields) {
    await knex.raw(`ALTER TABLE notification DROP COLUMN ${field.name};`);
  }
  for (const field of oldFields) {
    await knex.raw(`ALTER TABLE notification ADD COLUMN ${field.name} ${field.defn};`);
  }
};
