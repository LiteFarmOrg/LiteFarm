/*
 *  Copyright 2019, 2020, 2021, 2022, 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

// This update to the function returns a NULL row should data not exist
export const up = async function (knex) {
  return Promise.all([
    await knex.raw(`
    CREATE OR REPLACE FUNCTION public.get_nearest_sensor_readings_by_reading_type(
		readingtype text DEFAULT 'soil_water_potential'::text,
		valid boolean DEFAULT false,
		startdate timestamp with time zone DEFAULT '2023-05-22 20:01:02.112924-04'::timestamp with time zone,
		enddate timestamp with time zone DEFAULT '2023-05-22 20:01:03.112924-04'::timestamp with time zone,
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
	 locationId UUID;
	BEGIN
	  FOREACH locationId IN ARRAY location_ids
	  LOOP
		FOR r IN 
		SELECT * FROM 
		generate_series(startDate,endDate,intervalDuration::INTERVAL) AS s(i) 
	  LOOP
		RETURN QUERY
		EXECUTE $$ 
		  SELECT * 
		  FROM 
		  (	
			  SELECT *, rank() OVER 
			  (
				  PARTITION BY location_id 
				  ORDER BY read_time DESC
			  ) FROM (
				  WITH real_values AS (
					  SELECT $1, sr.read_time, sr.value, sr.unit as u, 
					  sr.location_id, l.name
					  FROM sensor_reading AS sr 
					  JOIN location AS l
					  ON l.location_id = sr.location_id
					  WHERE sr.location_id = $3
					  AND sr.read_time <= $1 
					  AND sr.read_time > ($1 - $4::interval)
					  AND sr.reading_type = $2
				  ), 
				  null_values AS (
					  SELECT nearest_read_time, read_time, "value", unit, location_id, "name" FROM (
						  SELECT nearest_read_time, read_time, "value", unit, l.location_id, l.name FROM (
							  values ($1::TIMESTAMPTZ, ($1::TIMESTAMPTZ - $4::INTERVAL + '1 millisecond'::INTERVAL), NULL::REAL, NULL::VARCHAR, $3::UUID)
						  ) null_values(nearest_read_time, read_time, "value", unit, location_id)
						  JOIN location as l
						  ON l.location_id = null_values.location_id
						  WHERE l.location_id = $3
					  ) null_loc
				  )
				  SELECT * FROM real_values
				  UNION ALL
				  SELECT * FROM
				  (SELECT * FROM null_values 
				  WHERE NOT EXISTS (SELECT * FROM real_values LIMIT 1) 
				  ) add_null_if_not_real
			  ) generated_series_readings
		  ) sensor_reading_ranked_scores
		  WHERE rank = 1
		$$
		USING r.i, readingType, locationId, intervalduration;
	  END LOOP;
	  END LOOP;
	END
	$BODY$;`),
    await knex.raw(`
	DROP FUNCTION IF EXISTS public.get_nearest_sensor_readings_by_reading_type(
		readingtype text,
		valid boolean,
		startdate date,
		enddate date,
		location_ids uuid[],
		intervalduration text);
	`),
  ]);
};

export const down = async function (knex) {
  return Promise.all([
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
	 locationId UUID;
	BEGIN
	  FOREACH locationId IN ARRAY location_ids
	  LOOP
		FOR r IN 
		SELECT * FROM 
		generate_series(startDate,endDate,intervalDuration::INTERVAL) AS s(i) 
	  LOOP
		RETURN QUERY
		EXECUTE $$ 
		  SELECT * 
		  FROM 
		  (	
			  SELECT *, rank() OVER 
			  (
				  PARTITION BY location_id 
				  ORDER BY read_time DESC
			  ) FROM (
				  WITH real_values AS (
					  SELECT $1, sr.read_time, sr.value, sr.unit as u, 
					  sr.location_id, l.name
					  FROM sensor_reading AS sr 
					  JOIN location AS l
					  ON l.location_id = sr.location_id
					  WHERE sr.location_id = $3
					  AND sr.read_time <= $1 
					  AND sr.read_time > ($1 - $4::interval)
					  AND sr.reading_type = $2
				  ), 
				  null_values AS (
					  SELECT nearest_read_time, read_time, "value", unit, location_id, "name" FROM (
						  SELECT nearest_read_time, read_time, "value", unit, l.location_id, l.name FROM (
							  values ($1::TIMESTAMPTZ, ($1::TIMESTAMPTZ - $4::INTERVAL + '1 millisecond'::INTERVAL), NULL::REAL, NULL::VARCHAR, $3::UUID)
						  ) null_values(nearest_read_time, read_time, "value", unit, location_id)
						  JOIN location as l
						  ON l.location_id = null_values.location_id
						  WHERE l.location_id = $3
					  ) null_loc
				  )
				  SELECT * FROM real_values
				  UNION ALL
				  SELECT * FROM
				  (SELECT * FROM null_values 
				  WHERE NOT EXISTS (SELECT * FROM real_values LIMIT 1) 
				  ) add_null_if_not_real
			  ) generated_series_readings
		  ) sensor_reading_ranked_scores
		  WHERE rank = 1
		$$
		USING r.i, readingType, locationId, intervalduration;
	  END LOOP;
	  END LOOP;
	END
   $BODY$;`),
    await knex.raw(`
	DROP FUNCTION IF EXISTS public.get_nearest_sensor_readings_by_reading_type(
		readingtype text,
		valid boolean,
		startdate timestamp with time zone,
		enddate timestamp with time zone,
		location_ids uuid[],
		intervalduration text);
	`),
  ]);
};
