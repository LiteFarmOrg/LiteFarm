export const up = async function (knex) {
  return await knex.raw(`
  CREATE OR REPLACE FUNCTION get_nearest_sensor_readings(
    readingType TEXT DEFAULT 'soil_water_potential',
    valid BOOLEAN DEFAULT false,
    startDate DATE DEFAULT '2022-11-02',
    endDate DATE DEFAULT '2022-12-02',
    location_ids UUID[] DEFAULT '{}',
    intervalDuration TEXT DEFAULT '1 hour'
    ) RETURNS TABLE (
    nearest_read_time TIMESTAMPTZ, 
      read_time TIMESTAMPTZ,
    value REAL,
    u VARCHAR,
    location_id UUID,
    name VARCHAR  
    ) AS
  $func$
  DECLARE
   r RECORD;
   s RECORD;
  BEGIN
      FOR r IN 
      SELECT * FROM 
      generate_series(startDate,endDate,intervalDuration::INTERVAL) AS s(i) 
    LOOP
      RETURN QUERY
      EXECUTE $$ 
        SELECT $1, sr.read_time, sr.value, sr.unit as u, 
        sr.location_id, l.name
        FROM sensor_reading AS sr 
        JOIN location AS l
        ON l.location_id = sr.location_id
        WHERE sr.location_id = ANY($3)
        AND sr.read_time < $1 
        AND sr.reading_type = $2
        ORDER BY sr.read_time DESC
        LIMIT 1 
      $$
      USING r.i, readingType, location_ids;
    END LOOP;   
  END
  $func$ LANGUAGE plpgsql;`);
};

export const down = async function (knex) {
  return await knex.raw(
    `DROP FUNCTION IF EXISTS public.get_nearest_sensor_readings(text, boolean, date, date, uuid[], text);`,
  );
};
