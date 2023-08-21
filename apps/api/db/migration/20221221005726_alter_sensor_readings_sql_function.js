export const up = async function (knex) {
  return Promise.all([
    await knex.raw(
      `DROP FUNCTION IF EXISTS public.get_nearest_sensor_readings(text, boolean, date, date, uuid[], text);`,
    ),
    await knex.raw(`
    CREATE OR REPLACE FUNCTION public.get_nearest_sensor_readings_by_reading_type(
      readingtype text DEFAULT 'soil_water_potential'::text,
      valid boolean DEFAULT false,
      startdate date DEFAULT '2022-11-02'::date,
      enddate date DEFAULT '2022-12-02'::date,
      location_ids uuid[] DEFAULT '{}'::uuid[],
      intervalduration text DEFAULT '1 hour'::text)
        RETURNS TABLE(nearest_read_time timestamp with time zone, read_time timestamp with time zone, value real, u character varying, location_id uuid, name character varying, rank bigint) 
        LANGUAGE 'plpgsql'
        COST 100
        VOLATILE PARALLEL UNSAFE
        ROWS 1000
    
    AS $BODY$
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
            SELECT *
            FROM 
            (
                SELECT $1, sr.read_time, sr.value, sr.unit as u, 
                sr.location_id, l.name,
                rank() OVER 
                (
                    PARTITION BY sr.location_id 
                    ORDER BY sr.read_time DESC
                )
                FROM sensor_reading AS sr 
                JOIN location AS l
                ON l.location_id = sr.location_id
                WHERE sr.location_id = ANY($3)
                AND sr.read_time < $1 
                AND sr.reading_type = $2
            ) sensor_reading_ranked_scores 
            WHERE rank = 1
          $$
          USING r.i, readingType, location_ids;
        END LOOP;   
      END
    $BODY$;`),
  ]);
};

export const down = async function (knex) {
  return await knex.raw(
    `DROP FUNCTION IF EXISTS public.get_nearest_sensor_readings_by_reading_type(text, boolean, date, date, uuid[], text);`,
  );
};
