/*
 *  Copyright 2023 LiteFarm.org
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

export const up = async function (knex) {
  return Promise.all([
    await knex.raw(
      `DROP FUNCTION IF EXISTS public.get_nearest_sensor_readings_by_reading_type(text, boolean, timestamp with time zone, timestamp with time zone, uuid[], text);`,
    ),
    await knex.raw(
      `CREATE OR REPLACE FUNCTION public.get_average_sensor_readings_by_reading_type(
		readingtype text DEFAULT 'soil_water_potential'::text,
		valid boolean DEFAULT false,
		startdate timestamp with time zone DEFAULT '2023-05-22 20:01:02.112924-04'::timestamp with time zone,
		enddate timestamp with time zone DEFAULT '2023-05-22 20:01:03.112924-04'::timestamp with time zone,
		location_ids uuid[] DEFAULT '{}'::uuid[],
		intervalduration text DEFAULT '1 hour'::text)
		  RETURNS TABLE(
			nearest_read_time timestamp with time zone, 
			read_time timestamp with time zone, 
			value real, 
			u character varying, 
			location_id uuid, 
			name character varying) 
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
				WITH real_values AS (
					SELECT $1, sr.read_time, sr.value, sr.unit as u, 
					sr.location_id, l.name
					FROM sensor_reading AS sr 
					JOIN location AS l
					ON l.location_id = sr.location_id
					WHERE sr.location_id = $3
					AND sr.read_time <= $1 + ($4::INTERVAL / 2)
					AND sr.read_time > $1 - ($4::INTERVAL / 2)
					AND sr.reading_type = $2
				), 
				null_values AS (
					SELECT nearest_read_time, read_time, "value", unit, location_id, "name" FROM (
						SELECT nearest_read_time, read_time, "value", unit, l.location_id, l.name
						FROM (
							values (
								$1::TIMESTAMPTZ,
								/* read_time for a null value will be 30 min before the timestamp + a ms */
								($1::TIMESTAMPTZ - ($4::INTERVAL / 2) + '1 millisecond'::INTERVAL), 
								NULL::REAL, 
								NULL::VARCHAR,
								$3::UUID
							)
						) null_values(nearest_read_time, read_time, "value", unit, location_id)
						JOIN location as l
						ON l.location_id = null_values.location_id
						WHERE l.location_id = $3
					) null_loc
				),
				/* New CTE for the average value of the real_value CTE records. */
				avg_value AS (
					SELECT
						$1::TIMESTAMPTZ AS nearest_read_time,
						/* The latest read time will be returned as the read_time for the avg */
						MAX(read_time) AS read_time, 
						AVG(value)::REAL AS value, 
						u AS unit,
						location_id,
						name
					FROM real_values
					GROUP BY location_id, name, unit
				)
				SELECT * FROM avg_value
				UNION ALL
				SELECT * FROM
				(SELECT * FROM null_values 
				WHERE NOT EXISTS (SELECT * FROM avg_value LIMIT 1)
				) add_null_if_not_real
			) timestamp_result
		$$
		USING r.i, readingType, locationId, intervalduration;
	  END LOOP;
	  END LOOP;
	END
   $BODY$;`,
    ),
  ]);
};

export const down = async function (knex) {
  return Promise.all([
    await knex.raw(
      `DROP FUNCTION IF EXISTS public.get_average_sensor_readings_by_reading_type(text, boolean, timestamp with time zone, timestamp with time zone, uuid[], text)`,
    ),
    await knex.raw(
      `CREATE OR REPLACE FUNCTION public.get_nearest_sensor_readings_by_reading_type(
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
	$BODY$;`,
    ),
  ]);
};
