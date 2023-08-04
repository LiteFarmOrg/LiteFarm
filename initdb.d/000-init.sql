--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg-litefarm; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE "pg-litefarm" WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C';


ALTER DATABASE "pg-litefarm" OWNER TO postgres;

\connect -reuse-previous=on "dbname='pg-litefarm'"

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: get_nearest_sensor_readings_by_reading_type(text, boolean, timestamp with time zone, timestamp with time zone, uuid[], text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_nearest_sensor_readings_by_reading_type(readingtype text DEFAULT 'soil_water_potential'::text, valid boolean DEFAULT false, startdate timestamp with time zone DEFAULT '2023-05-23 02:01:02.112924+02'::timestamp with time zone, enddate timestamp with time zone DEFAULT '2023-05-23 02:01:03.112924+02'::timestamp with time zone, location_ids uuid[] DEFAULT '{}'::uuid[], intervalduration text DEFAULT '1 hour'::text) RETURNS TABLE(nearest_read_time timestamp with time zone, read_time timestamp with time zone, value real, u character varying, location_id uuid, name character varying, rank bigint)
    LANGUAGE plpgsql
    AS $_$
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
	$_$;


ALTER FUNCTION public.get_nearest_sensor_readings_by_reading_type(readingtype text, valid boolean, startdate timestamp with time zone, enddate timestamp with time zone, location_ids uuid[], intervalduration text) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task (
    task_id integer NOT NULL,
    due_date date NOT NULL,
    owner_user_id character varying(255) NOT NULL,
    notes text,
    action_needed boolean DEFAULT false,
    photo character varying(255),
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    task_type_id integer,
    assignee_user_id character varying(255),
    coordinates jsonb,
    duration real,
    wage_at_moment real,
    happiness integer,
    completion_notes text,
    complete_date date,
    late_time timestamp with time zone,
    for_review_time timestamp with time zone,
    abandon_date date,
    abandonment_reason character varying(255),
    other_abandonment_reason character varying(255),
    abandonment_notes text,
    override_hourly_wage boolean DEFAULT false
);


ALTER TABLE public.task OWNER TO postgres;

--
-- Name: activityLog_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."activityLog_activity_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."activityLog_activity_id_seq" OWNER TO postgres;

--
-- Name: activityLog_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."activityLog_activity_id_seq" OWNED BY public.task.task_id;


--
-- Name: area; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.area (
    figure_id uuid NOT NULL,
    total_area numeric(36,12) NOT NULL,
    grid_points jsonb NOT NULL,
    perimeter numeric(36,12),
    total_area_unit text DEFAULT 'm2'::text,
    perimeter_unit text DEFAULT 'm'::text,
    CONSTRAINT area_perimeter_unit_check CHECK ((perimeter_unit = ANY (ARRAY['m'::text, 'km'::text, 'ft'::text, 'mi'::text]))),
    CONSTRAINT area_total_area_unit_check CHECK ((total_area_unit = ANY (ARRAY['m2'::text, 'ha'::text, 'ft2'::text, 'ac'::text])))
);


ALTER TABLE public.area OWNER TO postgres;

--
-- Name: barn; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.barn (
    location_id uuid NOT NULL,
    wash_and_pack boolean,
    cold_storage boolean,
    used_for_animals boolean
);


ALTER TABLE public.barn OWNER TO postgres;

--
-- Name: bed_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bed_method (
    planting_management_plan_id uuid NOT NULL,
    number_of_beds integer NOT NULL,
    number_of_rows_in_bed integer NOT NULL,
    plant_spacing numeric(36,12) NOT NULL,
    plant_spacing_unit text DEFAULT 'cm'::text,
    bed_length numeric(36,12) NOT NULL,
    bed_length_unit text DEFAULT 'm'::text,
    planting_depth numeric(36,12),
    planting_depth_unit text DEFAULT 'cm'::text,
    bed_width numeric(36,12),
    bed_width_unit text DEFAULT 'm'::text,
    bed_spacing numeric(36,12),
    bed_spacing_unit text DEFAULT 'm'::text,
    specify_beds character varying(255),
    CONSTRAINT bed_method_bed_length_unit_check CHECK ((bed_length_unit = ANY (ARRAY['cm'::text, 'm'::text, 'ft'::text, 'in'::text]))),
    CONSTRAINT bed_method_bed_spacing_unit_check CHECK ((bed_spacing_unit = ANY (ARRAY['cm'::text, 'm'::text, 'ft'::text, 'in'::text]))),
    CONSTRAINT bed_method_bed_width_unit_check CHECK ((bed_width_unit = ANY (ARRAY['cm'::text, 'm'::text, 'ft'::text, 'in'::text]))),
    CONSTRAINT bed_method_plant_spacing_unit_check CHECK ((plant_spacing_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text]))),
    CONSTRAINT bed_method_planting_depth_unit_check CHECK ((planting_depth_unit = ANY (ARRAY['cm'::text, 'm'::text, 'ft'::text, 'in'::text])))
);


ALTER TABLE public.bed_method OWNER TO postgres;

--
-- Name: broadcast_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.broadcast_method (
    planting_management_plan_id uuid NOT NULL,
    percentage_planted numeric(15,12) NOT NULL,
    area_used numeric(36,12) NOT NULL,
    area_used_unit text DEFAULT 'm2'::text NOT NULL,
    seeding_rate numeric(36,12) NOT NULL,
    CONSTRAINT broadcast_method_area_used_unit_check CHECK ((area_used_unit = ANY (ARRAY['m2'::text, 'ha'::text, 'ft2'::text, 'ac'::text])))
);


ALTER TABLE public.broadcast_method OWNER TO postgres;

--
-- Name: buffer_zone; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.buffer_zone (
    location_id uuid NOT NULL
);


ALTER TABLE public.buffer_zone OWNER TO postgres;

--
-- Name: ceremonial_area; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ceremonial_area (
    location_id uuid NOT NULL
);


ALTER TABLE public.ceremonial_area OWNER TO postgres;

--
-- Name: certifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certifications (
    certification_id integer NOT NULL,
    certification_type character varying(255) NOT NULL,
    certification_translation_key character varying(255) NOT NULL
);


ALTER TABLE public.certifications OWNER TO postgres;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certifications_certification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.certifications_certification_id_seq OWNER TO postgres;

--
-- Name: certifications_certification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certifications_certification_id_seq OWNED BY public.certifications.certification_id;


--
-- Name: certifier_country; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certifier_country (
    certifier_country_id integer NOT NULL,
    certifier_id integer,
    country_id integer
);


ALTER TABLE public.certifier_country OWNER TO postgres;

--
-- Name: certifier_country_certifier_country_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certifier_country_certifier_country_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.certifier_country_certifier_country_id_seq OWNER TO postgres;

--
-- Name: certifier_country_certifier_country_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certifier_country_certifier_country_id_seq OWNED BY public.certifier_country.certifier_country_id;


--
-- Name: certifiers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.certifiers (
    certifier_id integer NOT NULL,
    certification_id integer NOT NULL,
    certifier_name character varying(255) NOT NULL,
    certifier_acronym character varying(255) NOT NULL,
    survey_id character varying(255) DEFAULT NULL::character varying
);


ALTER TABLE public.certifiers OWNER TO postgres;

--
-- Name: certifiers_certifier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.certifiers_certifier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.certifiers_certifier_id_seq OWNER TO postgres;

--
-- Name: certifiers_certifier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.certifiers_certifier_id_seq OWNED BY public.certifiers.certifier_id;


--
-- Name: cleaning_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cleaning_task (
    task_id integer NOT NULL,
    product_id integer,
    cleaning_target character varying(255),
    agent_used boolean,
    water_usage numeric(36,12),
    water_usage_unit text DEFAULT 'l'::text,
    product_quantity numeric(36,12),
    product_quantity_unit text DEFAULT 'l'::text,
    CONSTRAINT cleaning_task_product_quantity_unit_check CHECK ((product_quantity_unit = ANY (ARRAY['l'::text, 'ml'::text, 'gal'::text, 'fl-oz'::text]))),
    CONSTRAINT cleaning_task_water_usage_unit_check CHECK ((water_usage_unit = ANY (ARRAY['l'::text, 'ml'::text, 'gal'::text, 'fl-oz'::text])))
);


ALTER TABLE public.cleaning_task OWNER TO postgres;

--
-- Name: container_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.container_method (
    planting_management_plan_id uuid NOT NULL,
    in_ground boolean NOT NULL,
    plant_spacing numeric(36,12),
    plant_spacing_unit text DEFAULT 'cm'::text,
    total_plants integer,
    number_of_containers integer,
    plants_per_container integer,
    planting_depth numeric(36,12),
    planting_depth_unit text DEFAULT 'cm'::text,
    planting_soil character varying(255),
    container_type character varying(255),
    CONSTRAINT container_method_plant_spacing_unit_check CHECK ((plant_spacing_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text]))),
    CONSTRAINT container_method_planting_depth_unit_check CHECK ((planting_depth_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text])))
);


ALTER TABLE public.container_method OWNER TO postgres;

--
-- Name: countries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.countries (
    id integer NOT NULL,
    country_name character varying(255) NOT NULL,
    currency character varying(255) NOT NULL,
    symbol character varying(255) NOT NULL,
    iso character varying(255) NOT NULL,
    unit character varying(255) NOT NULL
);


ALTER TABLE public.countries OWNER TO postgres;

--
-- Name: crop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crop (
    crop_id integer NOT NULL,
    crop_common_name character varying(255),
    crop_genus character varying(255),
    crop_specie character varying(255),
    crop_group text,
    crop_subgroup text,
    max_rooting_depth real,
    depletion_fraction real,
    is_avg_depth boolean,
    initial_kc real,
    mid_kc real,
    end_kc real,
    max_height real,
    is_avg_kc boolean,
    nutrient_notes character varying(255),
    percentrefuse real,
    refuse character varying(255),
    protein real,
    lipid real,
    energy real,
    ca real,
    fe real,
    mg real,
    ph real,
    k real,
    na real,
    zn real,
    cu real,
    fl real,
    mn real,
    se real,
    vita_rae real,
    vite real,
    vitc real,
    thiamin real,
    riboflavin real,
    niacin real,
    pantothenic real,
    vitb6 real,
    folate real,
    vitb12 real,
    vitk real,
    is_avg_nutrient boolean,
    farm_id uuid,
    user_added boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    nutrient_credits real,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    crop_translation_key character varying(255),
    crop_photo_url character varying(255) DEFAULT 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/default.webp'::character varying NOT NULL,
    reviewed boolean DEFAULT false,
    can_be_cover_crop boolean,
    planting_depth numeric(36,12),
    yield_per_area numeric(36,12),
    average_seed_weight numeric(36,12),
    yield_per_plant numeric(36,12),
    lifecycle text DEFAULT 'ANNUAL'::text NOT NULL,
    seeding_type text DEFAULT 'SEED'::text NOT NULL,
    needs_transplant boolean DEFAULT false,
    germination_days integer,
    transplant_days integer,
    harvest_days integer,
    termination_days integer,
    planting_method text,
    plant_spacing numeric(36,12),
    seeding_rate numeric(36,12),
    hs_code_id bigint,
    CONSTRAINT crop_crop_group_check CHECK ((crop_group = ANY (ARRAY['Fruit and nuts'::text, 'Other crops'::text, 'Stimulant, spice and aromatic crops'::text, 'Vegetables and melons'::text, 'Cereals'::text, 'High starch root/tuber crops'::text, 'Oilseed crops and oleaginous fruits'::text, 'Leguminous crops'::text, 'Sugar crops'::text, 'Potatoes and yams'::text, 'Beverage and spice crops'::text]))),
    CONSTRAINT crop_crop_subgroup_check CHECK ((crop_subgroup = ANY (ARRAY['Berries'::text, 'Cereals'::text, 'Citrus fruits'::text, 'Fibre crops'::text, 'Flower crops'::text, 'Fruit-bearing vegetables'::text, 'Grapes'::text, 'Grasses and other fodder crops'::text, 'High starch root/tuber crops'::text, 'Leafy or stem vegetables'::text, 'Leguminous crops'::text, 'Lentils'::text, 'Medicinal, pesticidal or similar crops'::text, 'Melons'::text, 'Mixed cereals'::text, 'Mushrooms and truffles'::text, 'Nuts'::text, 'Oilseed crops and oleaginous fruits'::text, 'Other crops'::text, 'Other fruits'::text, 'Other roots and tubers'::text, 'Other temporary oilseed crops'::text, 'Permanent oilseed crops'::text, 'Pome fruits and stone fruits'::text, 'Root, bulb or tuberous vegetables'::text, 'Rubber'::text, 'Spice and aromatic crops'::text, 'Stimulant crops'::text, 'Sugar crops'::text, 'Tobacco'::text, 'Tropical and subtropical fruits'::text]))),
    CONSTRAINT crop_lifecycle_check CHECK ((lifecycle = ANY (ARRAY['ANNUAL'::text, 'PERENNIAL'::text]))),
    CONSTRAINT crop_planting_method_check CHECK ((planting_method = ANY (ARRAY['BROADCAST_METHOD'::text, 'CONTAINER_METHOD'::text, 'BED_METHOD'::text, 'ROW_METHOD'::text]))),
    CONSTRAINT crop_seeding_type_check CHECK ((seeding_type = ANY (ARRAY['SEED'::text, 'SEEDLING_OR_PLANTING_STOCK'::text])))
);


ALTER TABLE public.crop OWNER TO postgres;

--
-- Name: cropDisease; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."cropDisease" (
    disease_id integer NOT NULL,
    crop_id integer NOT NULL
);


ALTER TABLE public."cropDisease" OWNER TO postgres;

--
-- Name: crop_crop_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.crop_crop_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crop_crop_id_seq OWNER TO postgres;

--
-- Name: crop_crop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.crop_crop_id_seq OWNED BY public.crop.crop_id;


--
-- Name: crop_management_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crop_management_plan (
    management_plan_id integer NOT NULL,
    estimated_revenue numeric(36,12),
    seed_date date,
    plant_date date,
    germination_date date,
    transplant_date date,
    harvest_date date,
    termination_date date,
    already_in_ground boolean DEFAULT false NOT NULL,
    is_seed boolean,
    needs_transplant boolean DEFAULT false NOT NULL,
    for_cover boolean,
    is_wild boolean,
    estimated_yield numeric(36,12),
    estimated_yield_unit text DEFAULT 'kg'::text,
    estimated_price_per_mass numeric(36,12),
    estimated_price_per_mass_unit text DEFAULT 'kg'::text,
    CONSTRAINT crop_management_plan_estimated_price_per_mass_unit_check CHECK ((estimated_price_per_mass_unit = ANY (ARRAY['kg'::text, 'lb'::text, 'mt'::text, 't'::text]))),
    CONSTRAINT crop_management_plan_estimated_yield_unit_check CHECK ((estimated_yield_unit = ANY (ARRAY['kg'::text, 'lb'::text, 'mt'::text, 't'::text])))
);


ALTER TABLE public.crop_management_plan OWNER TO postgres;

--
-- Name: crop_variety; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crop_variety (
    crop_variety_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    crop_id integer NOT NULL,
    crop_variety_name character varying(255) DEFAULT ''::character varying NOT NULL,
    farm_id uuid,
    deleted boolean DEFAULT false,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    supplier character varying(255),
    seeding_type text DEFAULT 'SEED'::text NOT NULL,
    lifecycle text DEFAULT 'ANNUAL'::text NOT NULL,
    compliance_file_url character varying(255),
    organic boolean,
    genetically_engineered boolean,
    searched boolean,
    crop_variety_photo_url character varying(255) DEFAULT 'https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v1/default.webp'::character varying NOT NULL,
    protein numeric(8,2),
    lipid numeric(8,2),
    ph numeric(8,2),
    energy numeric(8,2),
    ca numeric(8,2),
    fe numeric(8,2),
    mg numeric(8,2),
    k numeric(8,2),
    na numeric(8,2),
    zn numeric(8,2),
    cu numeric(8,2),
    mn numeric(8,2),
    vita_rae numeric(8,2),
    vitc numeric(8,2),
    thiamin numeric(8,2),
    riboflavin numeric(8,2),
    niacin numeric(8,2),
    vitb6 numeric(8,2),
    folate numeric(8,2),
    vitb12 numeric(8,2),
    nutrient_credits numeric(8,2),
    treated text,
    can_be_cover_crop boolean,
    planting_depth numeric(36,12),
    yield_per_area numeric(36,12),
    average_seed_weight numeric(36,12),
    yield_per_plant numeric(36,12),
    planting_method text,
    plant_spacing numeric(36,12),
    needs_transplant boolean DEFAULT false,
    germination_days integer,
    transplant_days integer,
    harvest_days integer,
    termination_days integer,
    seeding_rate numeric(36,12),
    hs_code_id bigint,
    crop_varietal character varying(255),
    crop_cultivar character varying(255),
    CONSTRAINT crop_variety_lifecycle_check CHECK ((lifecycle = ANY (ARRAY['ANNUAL'::text, 'PERENNIAL'::text]))),
    CONSTRAINT crop_variety_planting_method_check CHECK ((planting_method = ANY (ARRAY['BROADCAST_METHOD'::text, 'CONTAINER_METHOD'::text, 'BED_METHOD'::text, 'ROW_METHOD'::text]))),
    CONSTRAINT crop_variety_seeding_type_check CHECK ((seeding_type = ANY (ARRAY['SEED'::text, 'SEEDLING_OR_PLANTING_STOCK'::text]))),
    CONSTRAINT crop_variety_treated_check CHECK ((treated = ANY (ARRAY['YES'::text, 'NO'::text, 'NOT_SURE'::text])))
);


ALTER TABLE public.crop_variety OWNER TO postgres;

--
-- Name: crop_variety_sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crop_variety_sale (
    sale_id integer NOT NULL,
    quantity real,
    sale_value real,
    crop_variety_id uuid NOT NULL,
    quantity_unit text DEFAULT 'kg'::text,
    CONSTRAINT crop_variety_sale_quantity_unit_check CHECK ((quantity_unit = ANY (ARRAY['kg'::text, 'mt'::text, 'lb'::text, 't'::text])))
);


ALTER TABLE public.crop_variety_sale OWNER TO postgres;

--
-- Name: currency_table_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.currency_table_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.currency_table_id_seq OWNER TO postgres;

--
-- Name: currency_table_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.currency_table_id_seq OWNED BY public.countries.id;


--
-- Name: custom_location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.custom_location (
    location_id uuid NOT NULL,
    main_color character varying(6),
    hover_color character varying(6),
    line_type character varying(255)
);


ALTER TABLE public.custom_location OWNER TO postgres;

--
-- Name: disease; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.disease (
    disease_id integer NOT NULL,
    disease_scientific_name character varying(255),
    disease_common_name character varying(255),
    disease_group text,
    farm_id uuid,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    disease_name_translation_key character varying(255),
    disease_group_translation_key character varying(255),
    CONSTRAINT disease_disease_group_check CHECK ((disease_group = ANY (ARRAY['Fungus'::text, 'Insect'::text, 'Bacteria'::text, 'Virus'::text, 'Deficiency'::text, 'Mite'::text, 'Other'::text, 'Weed'::text])))
);


ALTER TABLE public.disease OWNER TO postgres;

--
-- Name: disease_disease_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.disease_disease_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.disease_disease_id_seq OWNER TO postgres;

--
-- Name: disease_disease_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.disease_disease_id_seq OWNED BY public.disease.disease_id;


--
-- Name: document; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.document (
    document_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    name character varying(255) NOT NULL,
    valid_until date,
    type text,
    thumbnail_url character varying(255),
    notes character varying(255),
    farm_id uuid,
    deleted boolean DEFAULT false,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    no_expiration boolean DEFAULT false,
    archived boolean DEFAULT false NOT NULL,
    CONSTRAINT document_type_check CHECK ((type = ANY (ARRAY['CLEANING_PRODUCT'::text, 'CROP_COMPLIANCE'::text, 'FERTILIZING_PRODUCT'::text, 'PEST_CONTROL_PRODUCT'::text, 'SOIL_AMENDMENT'::text, 'SOIL_SAMPLE_RESULTS'::text, 'WATER_SAMPLE_RESULTS'::text, 'INVOICES'::text, 'RECEIPTS'::text, 'OTHER'::text])))
);


ALTER TABLE public.document OWNER TO postgres;

--
-- Name: emailToken; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."emailToken" (
    user_id character varying(255) NOT NULL,
    farm_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    times_sent integer,
    invitation_id uuid DEFAULT public.uuid_generate_v1() NOT NULL
);


ALTER TABLE public."emailToken" OWNER TO postgres;

--
-- Name: farm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farm (
    farm_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    farm_name character varying(255) NOT NULL,
    address character varying(255),
    units jsonb DEFAULT '{"currency": "USD", "date_format": "MM/DD/YY", "measurement": "metric"}'::jsonb,
    grid_points jsonb,
    deleted boolean DEFAULT false NOT NULL,
    farm_phone_number character varying(255),
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    sandbox_farm boolean DEFAULT false,
    country_id integer,
    owner_operated boolean,
    default_initial_location_id uuid,
    utc_offset integer
);


ALTER TABLE public.farm OWNER TO postgres;

--
-- Name: farmDataSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."farmDataSchedule" (
    request_number integer NOT NULL,
    farm_id uuid NOT NULL,
    is_processed boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_id character varying(255),
    has_failed boolean DEFAULT false NOT NULL
);


ALTER TABLE public."farmDataSchedule" OWNER TO postgres;

--
-- Name: farmDataSchedule_request_number_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."farmDataSchedule_request_number_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."farmDataSchedule_request_number_seq" OWNER TO postgres;

--
-- Name: farmDataSchedule_request_number_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."farmDataSchedule_request_number_seq" OWNED BY public."farmDataSchedule".request_number;


--
-- Name: farmExpense; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."farmExpense" (
    farm_id uuid,
    expense_date timestamp with time zone NOT NULL,
    picture character varying(255),
    note character varying(255),
    expense_type_id uuid,
    farm_expense_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    value real,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL
);


ALTER TABLE public."farmExpense" OWNER TO postgres;

--
-- Name: farmExpenseType; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."farmExpenseType" (
    expense_name character varying(255),
    farm_id uuid,
    expense_type_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    expense_translation_key character varying(255)
);


ALTER TABLE public."farmExpenseType" OWNER TO postgres;

--
-- Name: farm_external_integration; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farm_external_integration (
    farm_id uuid NOT NULL,
    partner_id integer NOT NULL,
    organization_uuid uuid,
    webhook_id integer
);


ALTER TABLE public.farm_external_integration OWNER TO postgres;

--
-- Name: farm_site_boundary; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.farm_site_boundary (
    location_id uuid NOT NULL
);


ALTER TABLE public.farm_site_boundary OWNER TO postgres;

--
-- Name: fence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fence (
    location_id uuid NOT NULL,
    pressure_treated boolean
);


ALTER TABLE public.fence OWNER TO postgres;

--
-- Name: fertilizer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fertilizer (
    fertilizer_id integer NOT NULL,
    fertilizer_type character varying(255),
    moisture_percentage real,
    n_percentage real,
    nh4_n_ppm real,
    p_percentage real,
    k_percentage real,
    farm_id uuid,
    mineralization_rate real,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    fertilizer_translation_key character varying(255)
);


ALTER TABLE public.fertilizer OWNER TO postgres;

--
-- Name: fertilizer_fertilizer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fertilizer_fertilizer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.fertilizer_fertilizer_id_seq OWNER TO postgres;

--
-- Name: fertilizer_fertilizer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fertilizer_fertilizer_id_seq OWNED BY public.fertilizer.fertilizer_id;


--
-- Name: field; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field (
    location_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    station_id integer,
    organic_status text DEFAULT 'Non-Organic'::text,
    transition_date date,
    CONSTRAINT field_organic_status_check CHECK ((organic_status = ANY (ARRAY['Non-Organic'::text, 'Transitional'::text, 'Organic'::text])))
);


ALTER TABLE public.field OWNER TO postgres;

--
-- Name: management_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.management_plan (
    management_plan_id integer NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    crop_variety_id uuid,
    notes text,
    name character varying(255),
    start_date date,
    complete_date date,
    abandon_date date,
    complete_notes text,
    rating text,
    abandon_reason character varying(255),
    CONSTRAINT management_plan_rating_check CHECK ((rating = ANY (ARRAY['0'::text, '1'::text, '2'::text, '3'::text, '4'::text, '5'::text])))
);


ALTER TABLE public.management_plan OWNER TO postgres;

--
-- Name: fieldCrop_field_crop_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."fieldCrop_field_crop_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."fieldCrop_field_crop_id_seq" OWNER TO postgres;

--
-- Name: fieldCrop_field_crop_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."fieldCrop_field_crop_id_seq" OWNED BY public.management_plan.management_plan_id;


--
-- Name: field_work_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field_work_task (
    task_id integer NOT NULL,
    field_work_type_id integer,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL
);


ALTER TABLE public.field_work_task OWNER TO postgres;

--
-- Name: field_work_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.field_work_type (
    field_work_type_id integer NOT NULL,
    farm_id uuid,
    field_work_name character varying(255),
    field_work_type_translation_key character varying(255),
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    deleted boolean DEFAULT false
);


ALTER TABLE public.field_work_type OWNER TO postgres;

--
-- Name: field_work_type_field_work_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.field_work_type_field_work_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.field_work_type_field_work_type_id_seq OWNER TO postgres;

--
-- Name: field_work_type_field_work_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.field_work_type_field_work_type_id_seq OWNED BY public.field_work_type.field_work_type_id;


--
-- Name: figure; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.figure (
    figure_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    type text,
    location_id uuid,
    CONSTRAINT figure_type_check CHECK ((type = ANY (ARRAY['field'::text, 'farm_site_boundary'::text, 'greenhouse'::text, 'buffer_zone'::text, 'gate'::text, 'surface_water'::text, 'fence'::text, 'garden'::text, 'residence'::text, 'water_valve'::text, 'watercourse'::text, 'barn'::text, 'natural_area'::text, 'ceremonial_area'::text, 'pin'::text, 'sensor'::text])))
);


ALTER TABLE public.figure OWNER TO postgres;

--
-- Name: file; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.file (
    file_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    document_id uuid,
    file_name character varying(255) NOT NULL,
    url character varying(255) NOT NULL,
    thumbnail_url character varying(255)
);


ALTER TABLE public.file OWNER TO postgres;

--
-- Name: garden; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garden (
    location_id uuid NOT NULL,
    organic_status text DEFAULT 'Non-Organic'::text,
    transition_date date,
    station_id integer,
    CONSTRAINT garden_organic_status_check CHECK ((organic_status = ANY (ARRAY['Non-Organic'::text, 'Transitional'::text, 'Organic'::text])))
);


ALTER TABLE public.garden OWNER TO postgres;

--
-- Name: gate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gate (
    location_id uuid NOT NULL
);


ALTER TABLE public.gate OWNER TO postgres;

--
-- Name: greenhouse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.greenhouse (
    location_id uuid NOT NULL,
    organic_status text DEFAULT 'Non-Organic'::text,
    transition_date timestamp with time zone,
    supplemental_lighting boolean,
    co2_enrichment boolean,
    greenhouse_heated boolean,
    CONSTRAINT greenhouse_organic_status_check CHECK ((organic_status = ANY (ARRAY['Non-Organic'::text, 'Transitional'::text, 'Organic'::text])))
);


ALTER TABLE public.greenhouse OWNER TO postgres;

--
-- Name: harvest_use_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.harvest_use_type (
    harvest_use_type_id integer NOT NULL,
    harvest_use_type_name character varying(255) NOT NULL,
    farm_id uuid,
    harvest_use_type_translation_key character varying(255)
);


ALTER TABLE public.harvest_use_type OWNER TO postgres;

--
-- Name: harvestUseType_harvest_use_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."harvestUseType_harvest_use_type_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."harvestUseType_harvest_use_type_id_seq" OWNER TO postgres;

--
-- Name: harvestUseType_harvest_use_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."harvestUseType_harvest_use_type_id_seq" OWNED BY public.harvest_use_type.harvest_use_type_id;


--
-- Name: harvest_use; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.harvest_use (
    harvest_use_id integer NOT NULL,
    task_id integer NOT NULL,
    harvest_use_type_id integer NOT NULL,
    quantity numeric(36,12),
    quantity_unit text DEFAULT 'kg'::text,
    CONSTRAINT harvest_use_quantity_unit_check CHECK ((quantity_unit = ANY (ARRAY['kg'::text, 'mt'::text, 'lb'::text, 't'::text])))
);


ALTER TABLE public.harvest_use OWNER TO postgres;

--
-- Name: harvestUse_harvest_use_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."harvestUse_harvest_use_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."harvestUse_harvest_use_id_seq" OWNER TO postgres;

--
-- Name: harvestUse_harvest_use_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."harvestUse_harvest_use_id_seq" OWNED BY public.harvest_use.harvest_use_id;


--
-- Name: harvest_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.harvest_task (
    task_id integer NOT NULL,
    projected_quantity numeric(36,12),
    projected_quantity_unit text DEFAULT 'kg'::text,
    harvest_everything boolean DEFAULT false,
    actual_quantity numeric(36,12),
    actual_quantity_unit text DEFAULT 'kg'::text,
    CONSTRAINT harvest_task_actual_quantity_unit_check CHECK ((actual_quantity_unit = ANY (ARRAY['kg'::text, 'mt'::text, 'lb'::text, 't'::text]))),
    CONSTRAINT harvest_task_quantity_unit_check CHECK ((projected_quantity_unit = ANY (ARRAY['kg'::text, 'mt'::text, 'lb'::text, 't'::text])))
);


ALTER TABLE public.harvest_task OWNER TO postgres;

--
-- Name: hs_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hs_code (
    hs_code_id bigint NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.hs_code OWNER TO postgres;

--
-- Name: integrating_partner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.integrating_partner (
    partner_id integer NOT NULL,
    partner_name character varying(255) NOT NULL,
    access_token character varying(255),
    refresh_token character varying(255),
    root_url character varying(255),
    deactivated boolean DEFAULT false
);


ALTER TABLE public.integrating_partner OWNER TO postgres;

--
-- Name: integrating_partner_partner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.integrating_partner_partner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.integrating_partner_partner_id_seq OWNER TO postgres;

--
-- Name: integrating_partner_partner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.integrating_partner_partner_id_seq OWNED BY public.integrating_partner.partner_id;


--
-- Name: irrigation_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irrigation_task (
    task_id integer NOT NULL,
    irrigation_type_name text,
    estimated_flow_rate numeric(36,12),
    estimated_duration real,
    estimated_duration_unit character varying(255),
    estimated_flow_rate_unit character varying(255),
    location_id uuid,
    estimated_water_usage numeric(36,12),
    estimated_water_usage_unit character varying(255),
    application_depth numeric(36,12),
    application_depth_unit character varying(255),
    measuring_type character varying(255),
    irrigation_type_id integer,
    percent_of_location_irrigated real,
    default_location_flow_rate boolean DEFAULT false NOT NULL,
    default_location_application_depth boolean DEFAULT false NOT NULL,
    default_irrigation_task_type_location boolean DEFAULT false NOT NULL,
    default_irrigation_task_type_measurement boolean DEFAULT false NOT NULL
);


ALTER TABLE public.irrigation_task OWNER TO postgres;

--
-- Name: irrigation_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.irrigation_type (
    irrigation_type_id integer NOT NULL,
    irrigation_type_name character varying(255) NOT NULL,
    farm_id uuid,
    default_measuring_type character varying(255) NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    irrigation_type_translation_key character varying(255)
);


ALTER TABLE public.irrigation_type OWNER TO postgres;

--
-- Name: irrigation_type_irrigation_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.irrigation_type_irrigation_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.irrigation_type_irrigation_type_id_seq OWNER TO postgres;

--
-- Name: irrigation_type_irrigation_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.irrigation_type_irrigation_type_id_seq OWNED BY public.irrigation_type.irrigation_type_id;


--
-- Name: knex_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations (
    id integer NOT NULL,
    name character varying(255),
    batch integer,
    migration_time timestamp with time zone
);


ALTER TABLE public.knex_migrations OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_id_seq OWNER TO postgres;

--
-- Name: knex_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_id_seq OWNED BY public.knex_migrations.id;


--
-- Name: knex_migrations_lock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knex_migrations_lock (
    index integer NOT NULL,
    is_locked integer
);


ALTER TABLE public.knex_migrations_lock OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knex_migrations_lock_index_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.knex_migrations_lock_index_seq OWNER TO postgres;

--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knex_migrations_lock_index_seq OWNED BY public.knex_migrations_lock.index;


--
-- Name: line; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.line (
    figure_id uuid NOT NULL,
    length numeric(36,12) NOT NULL,
    width numeric(36,12),
    line_points jsonb NOT NULL,
    length_unit text DEFAULT 'm'::text,
    width_unit text DEFAULT 'm'::text,
    total_area numeric(36,12),
    total_area_unit text DEFAULT 'm2'::text,
    CONSTRAINT line_length_unit_check CHECK ((length_unit = ANY (ARRAY['cm'::text, 'm'::text, 'km'::text, 'in'::text, 'ft'::text, 'mi'::text]))),
    CONSTRAINT line_total_area_unit_check CHECK ((total_area_unit = ANY (ARRAY['m2'::text, 'ha'::text, 'ft2'::text, 'ac'::text]))),
    CONSTRAINT line_width_unit_check CHECK ((width_unit = ANY (ARRAY['cm'::text, 'm'::text, 'km'::text, 'in'::text, 'ft'::text, 'mi'::text])))
);


ALTER TABLE public.line OWNER TO postgres;

--
-- Name: location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location (
    location_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    farm_id uuid,
    name character varying(255) NOT NULL,
    notes text,
    deleted boolean DEFAULT false,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.location OWNER TO postgres;

--
-- Name: location_defaults; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_defaults (
    location_id uuid NOT NULL,
    estimated_flow_rate numeric(36,12),
    estimated_flow_rate_unit character varying(255),
    application_depth numeric(36,12),
    application_depth_unit character varying(255),
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    irrigation_type_id integer
);


ALTER TABLE public.location_defaults OWNER TO postgres;

--
-- Name: location_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.location_tasks (
    task_id integer NOT NULL,
    location_id uuid NOT NULL
);


ALTER TABLE public.location_tasks OWNER TO postgres;

--
-- Name: maintenance_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenance_task (
    task_id integer NOT NULL,
    type text,
    CONSTRAINT maintenance_task_type_check CHECK ((type = ANY (ARRAY['CHECK_IRRIGATION_LINES'::text, 'FIX_EQUIPMENT'::text, 'FIX_FENCE'::text, 'OIL_CHANGE'::text, 'PAINT'::text, 'SHARPEN_TOOL'::text])))
);


ALTER TABLE public.maintenance_task OWNER TO postgres;

--
-- Name: management_tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.management_tasks (
    task_id integer NOT NULL,
    planting_management_plan_id uuid NOT NULL
);


ALTER TABLE public.management_tasks OWNER TO postgres;

--
-- Name: natural_area; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.natural_area (
    location_id uuid NOT NULL
);


ALTER TABLE public.natural_area OWNER TO postgres;

--
-- Name: nitrogenBalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."nitrogenBalance" (
    nitrogen_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    location_id uuid NOT NULL,
    nitrogen_value real
);


ALTER TABLE public."nitrogenBalance" OWNER TO postgres;

--
-- Name: nitrogenBalance_nitrogen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."nitrogenBalance_nitrogen_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."nitrogenBalance_nitrogen_id_seq" OWNER TO postgres;

--
-- Name: nitrogenBalance_nitrogen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."nitrogenBalance_nitrogen_id_seq" OWNED BY public."nitrogenBalance".nitrogen_id;


--
-- Name: nitrogenSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."nitrogenSchedule" (
    nitrogen_schedule_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    scheduled_at timestamp with time zone,
    farm_id uuid NOT NULL,
    frequency integer
);


ALTER TABLE public."nitrogenSchedule" OWNER TO postgres;

--
-- Name: nitrogenSchedule_nitrogen_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."nitrogenSchedule_nitrogen_schedule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."nitrogenSchedule_nitrogen_schedule_id_seq" OWNER TO postgres;

--
-- Name: nitrogenSchedule_nitrogen_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."nitrogenSchedule_nitrogen_schedule_id_seq" OWNED BY public."nitrogenSchedule".nitrogen_schedule_id;


--
-- Name: nomination; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nomination (
    nomination_id integer NOT NULL,
    nomination_type character varying(255) NOT NULL,
    farm_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    created_by_user_id character varying(255) NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    updated_by_user_id character varying(255) NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.nomination OWNER TO postgres;

--
-- Name: nomination_crop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nomination_crop (
    nomination_id integer NOT NULL,
    crop_id integer NOT NULL
);


ALTER TABLE public.nomination_crop OWNER TO postgres;

--
-- Name: nomination_nomination_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nomination_nomination_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nomination_nomination_id_seq OWNER TO postgres;

--
-- Name: nomination_nomination_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nomination_nomination_id_seq OWNED BY public.nomination.nomination_id;


--
-- Name: nomination_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nomination_status (
    status_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    nomination_id integer NOT NULL,
    workflow_id integer NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL,
    created_by_user_id character varying(255) NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    updated_by_user_id character varying(255) NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.nomination_status OWNER TO postgres;

--
-- Name: nomination_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nomination_type (
    nomination_type character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    created_by_user_id character varying(255) NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    updated_by_user_id character varying(255) NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.nomination_type OWNER TO postgres;

--
-- Name: nomination_workflow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nomination_workflow (
    workflow_id integer NOT NULL,
    status character varying(255) NOT NULL,
    type_group character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    created_by_user_id character varying(255) NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    updated_by_user_id character varying(255) NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.nomination_workflow OWNER TO postgres;

--
-- Name: nomination_workflow_workflow_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nomination_workflow_workflow_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.nomination_workflow_workflow_id_seq OWNER TO postgres;

--
-- Name: nomination_workflow_workflow_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nomination_workflow_workflow_id_seq OWNED BY public.nomination_workflow.workflow_id;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification (
    notification_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    farm_id uuid,
    deleted boolean DEFAULT false,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    variables jsonb,
    context jsonb,
    title jsonb,
    body jsonb,
    ref jsonb
);


ALTER TABLE public.notification OWNER TO postgres;

--
-- Name: notification_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_user (
    notification_id uuid NOT NULL,
    user_id character varying(255) NOT NULL,
    alert boolean DEFAULT true NOT NULL,
    status text DEFAULT 'Unread'::text NOT NULL,
    deleted boolean DEFAULT false,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT notification_user_status_check CHECK ((status = ANY (ARRAY['Unread'::text, 'Read'::text, 'Archived'::text])))
);


ALTER TABLE public.notification_user OWNER TO postgres;

--
-- Name: organicCertifierSurvey; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."organicCertifierSurvey" (
    survey_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    farm_id uuid,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    interested boolean DEFAULT false NOT NULL,
    deleted boolean DEFAULT false,
    requested_certification character varying(255),
    requested_certifier character varying(255),
    certifier_id integer,
    certification_id integer
);


ALTER TABLE public."organicCertifierSurvey" OWNER TO postgres;

--
-- Name: organic_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.organic_history (
    organic_history_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    location_id uuid NOT NULL,
    organic_status text DEFAULT 'Non-Organic'::text,
    effective_date date NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    CONSTRAINT organic_history_organic_status_check CHECK ((organic_status = ANY (ARRAY['Non-Organic'::text, 'Transitional'::text, 'Organic'::text])))
);


ALTER TABLE public.organic_history OWNER TO postgres;

--
-- Name: partner_reading_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.partner_reading_type (
    partner_reading_type_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    partner_id integer NOT NULL,
    raw_value integer,
    readable_value character varying(255)
);


ALTER TABLE public.partner_reading_type OWNER TO postgres;

--
-- Name: password; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password (
    user_id character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    reset_token_version integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL
);


ALTER TABLE public.password OWNER TO postgres;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    permission_id integer NOT NULL,
    name character varying(255) NOT NULL,
    description character varying(255)
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- Name: permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.permissions_permission_id_seq OWNER TO postgres;

--
-- Name: permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permissions_permission_id_seq OWNED BY public.permissions.permission_id;


--
-- Name: pest_control_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pest_control_task (
    task_id integer NOT NULL,
    product_quantity numeric(36,12),
    control_method text NOT NULL,
    product_id integer,
    pest_target character varying(255),
    other_method character varying(255),
    product_quantity_unit text DEFAULT 'l'::text,
    CONSTRAINT pest_control_task_amount_unit_check CHECK ((product_quantity_unit = ANY (ARRAY['g'::text, 'lb'::text, 'kg'::text, 't'::text, 'mt'::text, 'oz'::text, 'l'::text, 'gal'::text, 'ml'::text, 'fl-oz'::text]))),
    CONSTRAINT pest_control_task_control_method_check CHECK ((control_method = ANY (ARRAY['systemicSpray'::text, 'foliarSpray'::text, 'handWeeding'::text, 'biologicalControl'::text, 'flameWeeding'::text, 'soilFumigation'::text, 'heatTreatment'::text, 'other'::text])))
);


ALTER TABLE public.pest_control_task OWNER TO postgres;

--
-- Name: pesticide; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pesticide (
    pesticide_id integer NOT NULL,
    pesticide_name character varying(255),
    entry_interval real DEFAULT '0'::real,
    harvest_interval real DEFAULT '0'::real,
    active_ingredients character varying(255),
    concentration real DEFAULT '0'::real,
    farm_id uuid,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    pesticide_translation_key character varying(255)
);


ALTER TABLE public.pesticide OWNER TO postgres;

--
-- Name: pesticide_pesticide_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pesticide_pesticide_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pesticide_pesticide_id_seq OWNER TO postgres;

--
-- Name: pesticide_pesticide_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pesticide_pesticide_id_seq OWNED BY public.pesticide.pesticide_id;


--
-- Name: pin; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pin (
    location_id uuid NOT NULL
);


ALTER TABLE public.pin OWNER TO postgres;

--
-- Name: plant_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plant_task (
    task_id integer NOT NULL,
    planting_management_plan_id uuid
);


ALTER TABLE public.plant_task OWNER TO postgres;

--
-- Name: planting_management_plan; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.planting_management_plan (
    planting_management_plan_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    management_plan_id integer NOT NULL,
    is_final_planting_management_plan boolean,
    planting_method text,
    is_planting_method_known boolean,
    estimated_seeds numeric(36,12),
    estimated_seeds_unit text DEFAULT 'kg'::text,
    location_id uuid,
    pin_coordinate jsonb,
    notes text,
    planting_task_type text,
    CONSTRAINT planting_management_plan_estimated_seeds_unit_check CHECK ((estimated_seeds_unit = ANY (ARRAY['g'::text, 'kg'::text, 'mt'::text, 'oz'::text, 'lb'::text, 't'::text]))),
    CONSTRAINT planting_management_plan_planting_method_check CHECK ((planting_method = ANY (ARRAY['BROADCAST_METHOD'::text, 'CONTAINER_METHOD'::text, 'BED_METHOD'::text, 'ROW_METHOD'::text]))),
    CONSTRAINT planting_management_plan_planting_task_type_check CHECK ((planting_task_type = ANY (ARRAY['PLANT_TASK'::text, 'TRANSPLANT_TASK'::text])))
);


ALTER TABLE public.planting_management_plan OWNER TO postgres;

--
-- Name: point; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.point (
    figure_id uuid NOT NULL,
    point jsonb NOT NULL
);


ALTER TABLE public.point OWNER TO postgres;

--
-- Name: price; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price (
    price_id integer NOT NULL,
    crop_id integer,
    "value_$/kg" real,
    date timestamp with time zone,
    farm_id uuid NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.price OWNER TO postgres;

--
-- Name: price_yield_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.price_yield_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.price_yield_id_seq OWNER TO postgres;

--
-- Name: price_yield_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.price_yield_id_seq OWNED BY public.price.price_id;


--
-- Name: product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product (
    product_id integer NOT NULL,
    name character varying(255) NOT NULL,
    product_translation_key character varying(255),
    supplier character varying(255),
    type text,
    farm_id uuid,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    on_permitted_substances_list text,
    CONSTRAINT product_on_permitted_substances_list_check CHECK ((on_permitted_substances_list = ANY (ARRAY['YES'::text, 'NO'::text, 'NOT_SURE'::text]))),
    CONSTRAINT product_type_check CHECK ((type = ANY (ARRAY['soil_amendment_task'::text, 'pest_control_task'::text, 'cleaning_task'::text])))
);


ALTER TABLE public.product OWNER TO postgres;

--
-- Name: product_product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.product_product_id_seq OWNER TO postgres;

--
-- Name: product_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_product_id_seq OWNED BY public.product.product_id;


--
-- Name: residence; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.residence (
    location_id uuid NOT NULL
);


ALTER TABLE public.residence OWNER TO postgres;

--
-- Name: role; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role (
    role_id integer NOT NULL,
    role character varying(255) NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.role OWNER TO postgres;

--
-- Name: rolePermissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."rolePermissions" (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public."rolePermissions" OWNER TO postgres;

--
-- Name: role_role_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_role_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_role_id_seq OWNER TO postgres;

--
-- Name: role_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_role_id_seq OWNED BY public.role.role_id;


--
-- Name: row_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.row_method (
    planting_management_plan_id uuid NOT NULL,
    same_length boolean NOT NULL,
    number_of_rows integer,
    row_length numeric(36,12),
    row_length_unit text DEFAULT 'cm'::text,
    plant_spacing numeric(36,12) NOT NULL,
    plant_spacing_unit text DEFAULT 'cm'::text,
    total_rows_length numeric(36,12),
    total_rows_length_unit text DEFAULT 'cm'::text,
    specify_rows character varying(255),
    planting_depth numeric(36,12),
    planting_depth_unit text DEFAULT 'cm'::text,
    row_width numeric(36,12),
    row_width_unit text DEFAULT 'cm'::text,
    row_spacing numeric(36,12),
    row_spacing_unit text DEFAULT 'cm'::text,
    CONSTRAINT row_method_plant_spacing_unit_check CHECK ((plant_spacing_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text]))),
    CONSTRAINT row_method_planting_depth_unit_check CHECK ((planting_depth_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text]))),
    CONSTRAINT row_method_row_length_unit_check CHECK ((row_length_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text]))),
    CONSTRAINT row_method_row_spacing_unit_check CHECK ((row_spacing_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text]))),
    CONSTRAINT row_method_row_width_unit_check CHECK ((row_width_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text]))),
    CONSTRAINT row_method_total_rows_length_unit_check CHECK ((total_rows_length_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text])))
);


ALTER TABLE public.row_method OWNER TO postgres;

--
-- Name: sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale (
    sale_id integer NOT NULL,
    customer_name character varying(255) NOT NULL,
    sale_date timestamp with time zone NOT NULL,
    farm_id uuid,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL
);


ALTER TABLE public.sale OWNER TO postgres;

--
-- Name: sale_sale_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_sale_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sale_sale_id_seq OWNER TO postgres;

--
-- Name: sale_sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_sale_id_seq OWNED BY public.sale.sale_id;


--
-- Name: sale_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_task (
    task_id integer NOT NULL
);


ALTER TABLE public.sale_task OWNER TO postgres;

--
-- Name: scouting_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scouting_task (
    task_id integer NOT NULL,
    type text,
    CONSTRAINT "scoutingLog_type_check" CHECK ((type = ANY (ARRAY['harvest'::text, 'pest'::text, 'disease'::text, 'weed'::text, 'other'::text])))
);


ALTER TABLE public.scouting_task OWNER TO postgres;

--
-- Name: sensor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensor (
    location_id uuid NOT NULL,
    partner_id integer NOT NULL,
    external_id character varying(255) NOT NULL,
    depth real,
    elevation real,
    model character varying(255),
    depth_unit text DEFAULT 'cm'::text,
    CONSTRAINT sensor_depth_unit_check CHECK ((depth_unit = ANY (ARRAY['cm'::text, 'm'::text, 'in'::text, 'ft'::text])))
);


ALTER TABLE public.sensor OWNER TO postgres;

--
-- Name: sensor_reading; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensor_reading (
    reading_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    location_id uuid NOT NULL,
    read_time timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reading_type character varying(255) NOT NULL,
    value real NOT NULL,
    unit character varying(255) NOT NULL,
    valid boolean DEFAULT true NOT NULL
);


ALTER TABLE public.sensor_reading OWNER TO postgres;

--
-- Name: sensor_reading_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sensor_reading_type (
    sensor_reading_type_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    partner_reading_type_id uuid,
    location_id uuid
);


ALTER TABLE public.sensor_reading_type OWNER TO postgres;

--
-- Name: shift; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shift (
    shift_id uuid DEFAULT public.uuid_generate_v1() NOT NULL,
    user_id character varying(255),
    mood text,
    wage_at_moment real DEFAULT '0'::real,
    farm_id uuid,
    deleted boolean DEFAULT false,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    shift_date date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT shift_mood_check CHECK ((mood = ANY (ARRAY['happy'::text, 'neutral'::text, 'very happy'::text, 'sad'::text, 'very sad'::text, 'na'::text, 'no answer'::text])))
);


ALTER TABLE public.shift OWNER TO postgres;

--
-- Name: shiftTask; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."shiftTask" (
    task_id integer,
    shift_id uuid,
    management_plan_id integer,
    is_location boolean DEFAULT false,
    location_id uuid,
    duration real,
    deleted boolean DEFAULT false,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL
);


ALTER TABLE public."shiftTask" OWNER TO postgres;

--
-- Name: showedSpotlight; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."showedSpotlight" (
    user_id character varying(255) NOT NULL,
    map boolean DEFAULT false,
    map_end timestamp with time zone,
    draw_area boolean DEFAULT false,
    draw_area_end timestamp with time zone,
    draw_line boolean DEFAULT false,
    draw_line_end timestamp with time zone,
    drop_point boolean DEFAULT false,
    drop_point_end timestamp with time zone,
    adjust_area boolean DEFAULT false,
    adjust_area_end timestamp with time zone,
    adjust_line boolean DEFAULT false,
    adjust_line_end timestamp with time zone,
    navigation boolean DEFAULT false,
    navigation_end timestamp with time zone,
    introduce_map boolean DEFAULT true,
    introduce_map_end timestamp with time zone,
    crop_catalog boolean DEFAULT false,
    crop_catalog_end timestamp with time zone,
    crop_variety_detail boolean DEFAULT false,
    crop_variety_detail_end timestamp with time zone,
    documents boolean DEFAULT false,
    documents_end timestamp with time zone,
    compliance_docs_and_certification boolean DEFAULT false,
    compliance_docs_and_certification_end timestamp with time zone,
    transplant boolean DEFAULT false,
    transplant_end timestamp with time zone,
    management_plan_creation boolean DEFAULT false,
    management_plan_creation_end timestamp with time zone,
    planting_task boolean DEFAULT false,
    planting_task_end timestamp with time zone,
    notification boolean DEFAULT false,
    notification_end timestamp with time zone,
    sensor_reading_chart boolean DEFAULT false,
    sensor_reading_chart_end timestamp with time zone
);


ALTER TABLE public."showedSpotlight" OWNER TO postgres;

--
-- Name: social_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_task (
    type text,
    task_id integer NOT NULL,
    CONSTRAINT social_task_type_check CHECK ((type = ANY (ARRAY['MEETING'::text, 'TRAIN  ING'::text, 'CEREMONY'::text])))
);


ALTER TABLE public.social_task OWNER TO postgres;

--
-- Name: soil_amendment_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.soil_amendment_task (
    task_id integer NOT NULL,
    product_quantity numeric(36,12),
    product_quantity_unit text DEFAULT 'kg'::text,
    purpose text,
    other_purpose character varying(255),
    product_id integer,
    CONSTRAINT soil_amendment_task_amount_unit_check CHECK ((product_quantity_unit = ANY (ARRAY['g'::text, 'lb'::text, 'kg'::text, 't'::text, 'mt'::text, 'oz'::text, 'l'::text, 'gal'::text, 'ml'::text, 'fl-oz'::text]))),
    CONSTRAINT soil_amendment_task_purpose_check CHECK ((purpose = ANY (ARRAY['structure'::text, 'moisture_retention'::text, 'nutrient_availability'::text, 'ph'::text, 'other'::text])))
);


ALTER TABLE public.soil_amendment_task OWNER TO postgres;

--
-- Name: soil_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.soil_task (
    task_id integer NOT NULL,
    texture text,
    k real,
    p real,
    n real,
    om real,
    ph real,
    "bulk_density_kg/m3" real,
    organic_carbon real,
    inorganic_carbon real,
    s real,
    ca real,
    mg real,
    zn real,
    mn real,
    fe real,
    cu real,
    b real,
    cec real,
    c real,
    na real,
    total_carbon real,
    depth_cm real,
    CONSTRAINT "soilDataLog_texture_check" CHECK ((texture = ANY (ARRAY['sand'::text, 'loamySand'::text, 'sandyLoam'::text, 'loam'::text, 'siltLoam'::text, 'silt'::text, 'sandyClayLoam'::text, 'clayLoam'::text, 'siltyClayLoam'::text, 'sandyClay'::text, 'siltyClay'::text, 'clay'::text])))
);


ALTER TABLE public.soil_task OWNER TO postgres;

--
-- Name: supportTicket; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."supportTicket" (
    support_ticket_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    support_type text NOT NULL,
    message text NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb,
    contact_method text NOT NULL,
    email character varying(255),
    whatsapp character varying(255),
    status text DEFAULT 'Open'::text,
    farm_id uuid,
    created_by_user_id character varying(255),
    updated_by_user_id character varying(255),
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    deleted boolean DEFAULT false,
    CONSTRAINT "supportTicket_contact_method_check" CHECK ((contact_method = ANY (ARRAY['email'::text, 'whatsapp'::text]))),
    CONSTRAINT "supportTicket_status_check" CHECK ((status = ANY (ARRAY['Open'::text, 'Closed'::text, 'In progress'::text]))),
    CONSTRAINT "supportTicket_support_type_check" CHECK ((support_type = ANY (ARRAY['Request information'::text, 'Report a bug'::text, 'Request a feature'::text, 'Other'::text])))
);


ALTER TABLE public."supportTicket" OWNER TO postgres;

--
-- Name: surface_water; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.surface_water (
    location_id uuid NOT NULL,
    used_for_irrigation boolean
);


ALTER TABLE public.surface_water OWNER TO postgres;

--
-- Name: task_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.task_type (
    task_type_id integer NOT NULL,
    task_name character varying(255) NOT NULL,
    farm_id uuid,
    deleted boolean DEFAULT false NOT NULL,
    created_by_user_id character varying(255) DEFAULT '1'::character varying,
    updated_by_user_id character varying(255) DEFAULT '1'::character varying,
    created_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    updated_at timestamp with time zone DEFAULT '2000-01-01 02:00:00+02'::timestamp with time zone NOT NULL,
    task_translation_key character varying(255)
);


ALTER TABLE public.task_type OWNER TO postgres;

--
-- Name: taskType_task_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."taskType_task_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."taskType_task_id_seq" OWNER TO postgres;

--
-- Name: taskType_task_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."taskType_task_id_seq" OWNED BY public.task_type.task_type_id;


--
-- Name: test; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.test (
    message character varying(255)
);


ALTER TABLE public.test OWNER TO postgres;

--
-- Name: transplant_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transplant_task (
    task_id integer NOT NULL,
    planting_management_plan_id uuid NOT NULL,
    prev_planting_management_plan_id uuid NOT NULL
);


ALTER TABLE public.transplant_task OWNER TO postgres;

--
-- Name: transport_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_task (
    task_id integer NOT NULL
);


ALTER TABLE public.transport_task OWNER TO postgres;

--
-- Name: userFarm; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."userFarm" (
    user_id character varying(255) NOT NULL,
    farm_id uuid NOT NULL,
    role_id integer,
    has_consent boolean,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    status text,
    consent_version character varying(255) DEFAULT '1.0'::character varying NOT NULL,
    wage jsonb DEFAULT '{"type": "hourly", "amount": 0}'::jsonb,
    step_one boolean DEFAULT false,
    step_one_end character varying(255) DEFAULT NULL::character varying,
    step_two boolean DEFAULT false,
    step_two_end character varying(255) DEFAULT NULL::character varying,
    step_three boolean DEFAULT false,
    step_three_end character varying(255) DEFAULT NULL::character varying,
    step_four boolean DEFAULT false,
    step_four_end character varying(255) DEFAULT NULL::character varying,
    step_five boolean DEFAULT false,
    step_five_end character varying(255) DEFAULT NULL::character varying,
    wage_do_not_ask_again boolean,
    CONSTRAINT "userFarm_status_check" CHECK ((status = ANY (ARRAY['Active'::text, 'Inactive'::text, 'Invited'::text])))
);


ALTER TABLE public."userFarm" OWNER TO postgres;

--
-- Name: userLog; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."userLog" (
    user_log_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(255),
    ip character varying(255),
    languages jsonb DEFAULT '[]'::jsonb,
    browser character varying(255),
    browser_version character varying(255),
    os character varying(255),
    os_version character varying(255),
    device_vendor character varying(255),
    device_model character varying(255),
    device_type character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    screen_width integer,
    screen_height integer,
    farm_id uuid,
    reason_for_failure character varying(255) DEFAULT 'n/a'::character varying
);


ALTER TABLE public."userLog" OWNER TO postgres;

--
-- Name: user_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_status (
    status_id integer NOT NULL,
    status_description character varying(255)
);


ALTER TABLE public.user_status OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id character varying(255) DEFAULT public.uuid_generate_v1() NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    profile_picture character varying(255),
    email character varying(255) NOT NULL,
    phone_number character varying(255),
    user_address character varying(255),
    notification_setting jsonb DEFAULT '{"alert_pest": true, "alert_weather": true, "alert_worker_finish": true, "alert_before_planned_date": true, "alert_action_after_scouting": true}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    language_preference character varying(5) DEFAULT 'en'::character varying NOT NULL,
    status_id integer DEFAULT 1,
    gender text DEFAULT 'PREFER_NOT_TO_SAY'::text NOT NULL,
    birth_year integer,
    do_not_email boolean DEFAULT false NOT NULL,
    sandbox_user boolean DEFAULT false,
    CONSTRAINT users_gender_check CHECK ((gender = ANY (ARRAY['OTHER'::text, 'PREFER_NOT_TO_SAY'::text, 'MALE'::text, 'FEMALE'::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: wash_and_pack_task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wash_and_pack_task (
    task_id integer NOT NULL
);


ALTER TABLE public.wash_and_pack_task OWNER TO postgres;

--
-- Name: waterBalance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."waterBalance" (
    water_balance_id integer NOT NULL,
    crop_id integer NOT NULL,
    location_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    soil_water real NOT NULL,
    plant_available_water real NOT NULL
);


ALTER TABLE public."waterBalance" OWNER TO postgres;

--
-- Name: waterBalanceSchedule; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."waterBalanceSchedule" (
    water_balance_schedule_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    farm_id uuid NOT NULL
);


ALTER TABLE public."waterBalanceSchedule" OWNER TO postgres;

--
-- Name: waterBalanceSchedule_water_balance_schedule_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."waterBalanceSchedule_water_balance_schedule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."waterBalanceSchedule_water_balance_schedule_id_seq" OWNER TO postgres;

--
-- Name: waterBalanceSchedule_water_balance_schedule_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."waterBalanceSchedule_water_balance_schedule_id_seq" OWNED BY public."waterBalanceSchedule".water_balance_schedule_id;


--
-- Name: waterBalance_water_balance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."waterBalance_water_balance_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."waterBalance_water_balance_id_seq" OWNER TO postgres;

--
-- Name: waterBalance_water_balance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."waterBalance_water_balance_id_seq" OWNED BY public."waterBalance".water_balance_id;


--
-- Name: water_valve; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.water_valve (
    location_id uuid NOT NULL,
    source text,
    flow_rate numeric(36,12),
    flow_rate_unit text DEFAULT 'l/h'::text,
    CONSTRAINT water_valve_flow_rate_unit_check CHECK ((flow_rate_unit = ANY (ARRAY['l/min'::text, 'l/h'::text, 'gal/min'::text, 'gal/h'::text]))),
    CONSTRAINT water_valve_source_check CHECK ((source = ANY (ARRAY['Municipal water'::text, 'Surface water'::text, 'Groundwater'::text, 'Rain water'::text])))
);


ALTER TABLE public.water_valve OWNER TO postgres;

--
-- Name: watercourse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.watercourse (
    location_id uuid NOT NULL,
    used_for_irrigation boolean,
    buffer_width numeric(36,12),
    buffer_width_unit text DEFAULT 'm'::text,
    CONSTRAINT creek_buffer_width_unit_check CHECK ((buffer_width_unit = ANY (ARRAY['cm'::text, 'm'::text, 'km'::text, 'in'::text, 'ft'::text, 'mi'::text])))
);


ALTER TABLE public.watercourse OWNER TO postgres;

--
-- Name: weather; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weather (
    weather_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    min_degrees real,
    max_degrees real,
    min_humidity real,
    max_humidity real,
    precipitation real,
    wind_speed real,
    data_points integer,
    station_id integer
);


ALTER TABLE public.weather OWNER TO postgres;

--
-- Name: weatherHourly; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."weatherHourly" (
    weather_hourly_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    min_degrees real,
    max_degrees real,
    precipitation real,
    wind_speed real,
    min_humidity real,
    max_humidity real,
    data_points integer,
    station_id integer
);


ALTER TABLE public."weatherHourly" OWNER TO postgres;

--
-- Name: weatherHourly_weather_hourly_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."weatherHourly_weather_hourly_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."weatherHourly_weather_hourly_id_seq" OWNER TO postgres;

--
-- Name: weatherHourly_weather_hourly_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."weatherHourly_weather_hourly_id_seq" OWNED BY public."weatherHourly".weather_hourly_id;


--
-- Name: weather_station; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.weather_station (
    id integer NOT NULL,
    name character varying(255),
    country character varying(255),
    timezone integer
);


ALTER TABLE public.weather_station OWNER TO postgres;

--
-- Name: weather_weather_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.weather_weather_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.weather_weather_id_seq OWNER TO postgres;

--
-- Name: weather_weather_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.weather_weather_id_seq OWNED BY public.weather.weather_id;


--
-- Name: yield; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.yield (
    yield_id integer NOT NULL,
    crop_id integer,
    date timestamp with time zone,
    farm_id uuid NOT NULL,
    "quantity_kg/m2" real,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.yield OWNER TO postgres;

--
-- Name: yield_yield_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.yield_yield_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.yield_yield_id_seq OWNER TO postgres;

--
-- Name: yield_yield_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.yield_yield_id_seq OWNED BY public.yield.yield_id;


--
-- Name: certifications certification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications ALTER COLUMN certification_id SET DEFAULT nextval('public.certifications_certification_id_seq'::regclass);


--
-- Name: certifier_country certifier_country_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifier_country ALTER COLUMN certifier_country_id SET DEFAULT nextval('public.certifier_country_certifier_country_id_seq'::regclass);


--
-- Name: certifiers certifier_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifiers ALTER COLUMN certifier_id SET DEFAULT nextval('public.certifiers_certifier_id_seq'::regclass);


--
-- Name: countries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries ALTER COLUMN id SET DEFAULT nextval('public.currency_table_id_seq'::regclass);


--
-- Name: crop crop_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop ALTER COLUMN crop_id SET DEFAULT nextval('public.crop_crop_id_seq'::regclass);


--
-- Name: disease disease_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disease ALTER COLUMN disease_id SET DEFAULT nextval('public.disease_disease_id_seq'::regclass);


--
-- Name: farmDataSchedule request_number; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmDataSchedule" ALTER COLUMN request_number SET DEFAULT nextval('public."farmDataSchedule_request_number_seq"'::regclass);


--
-- Name: fertilizer fertilizer_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fertilizer ALTER COLUMN fertilizer_id SET DEFAULT nextval('public.fertilizer_fertilizer_id_seq'::regclass);


--
-- Name: field_work_type field_work_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_type ALTER COLUMN field_work_type_id SET DEFAULT nextval('public.field_work_type_field_work_type_id_seq'::regclass);


--
-- Name: harvest_use harvest_use_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_use ALTER COLUMN harvest_use_id SET DEFAULT nextval('public."harvestUse_harvest_use_id_seq"'::regclass);


--
-- Name: harvest_use_type harvest_use_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_use_type ALTER COLUMN harvest_use_type_id SET DEFAULT nextval('public."harvestUseType_harvest_use_type_id_seq"'::regclass);


--
-- Name: integrating_partner partner_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integrating_partner ALTER COLUMN partner_id SET DEFAULT nextval('public.integrating_partner_partner_id_seq'::regclass);


--
-- Name: irrigation_type irrigation_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_type ALTER COLUMN irrigation_type_id SET DEFAULT nextval('public.irrigation_type_irrigation_type_id_seq'::regclass);


--
-- Name: knex_migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations ALTER COLUMN id SET DEFAULT nextval('public.knex_migrations_id_seq'::regclass);


--
-- Name: knex_migrations_lock index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock ALTER COLUMN index SET DEFAULT nextval('public.knex_migrations_lock_index_seq'::regclass);


--
-- Name: management_plan management_plan_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_plan ALTER COLUMN management_plan_id SET DEFAULT nextval('public."fieldCrop_field_crop_id_seq"'::regclass);


--
-- Name: nitrogenBalance nitrogen_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."nitrogenBalance" ALTER COLUMN nitrogen_id SET DEFAULT nextval('public."nitrogenBalance_nitrogen_id_seq"'::regclass);


--
-- Name: nitrogenSchedule nitrogen_schedule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."nitrogenSchedule" ALTER COLUMN nitrogen_schedule_id SET DEFAULT nextval('public."nitrogenSchedule_nitrogen_schedule_id_seq"'::regclass);


--
-- Name: nomination nomination_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination ALTER COLUMN nomination_id SET DEFAULT nextval('public.nomination_nomination_id_seq'::regclass);


--
-- Name: nomination_workflow workflow_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_workflow ALTER COLUMN workflow_id SET DEFAULT nextval('public.nomination_workflow_workflow_id_seq'::regclass);


--
-- Name: permissions permission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.permissions_permission_id_seq'::regclass);


--
-- Name: pesticide pesticide_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesticide ALTER COLUMN pesticide_id SET DEFAULT nextval('public.pesticide_pesticide_id_seq'::regclass);


--
-- Name: price price_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price ALTER COLUMN price_id SET DEFAULT nextval('public.price_yield_id_seq'::regclass);


--
-- Name: product product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product ALTER COLUMN product_id SET DEFAULT nextval('public.product_product_id_seq'::regclass);


--
-- Name: role role_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role ALTER COLUMN role_id SET DEFAULT nextval('public.role_role_id_seq'::regclass);


--
-- Name: sale sale_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale ALTER COLUMN sale_id SET DEFAULT nextval('public.sale_sale_id_seq'::regclass);


--
-- Name: task task_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task ALTER COLUMN task_id SET DEFAULT nextval('public."activityLog_activity_id_seq"'::regclass);


--
-- Name: task_type task_type_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_type ALTER COLUMN task_type_id SET DEFAULT nextval('public."taskType_task_id_seq"'::regclass);


--
-- Name: waterBalance water_balance_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."waterBalance" ALTER COLUMN water_balance_id SET DEFAULT nextval('public."waterBalance_water_balance_id_seq"'::regclass);


--
-- Name: waterBalanceSchedule water_balance_schedule_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."waterBalanceSchedule" ALTER COLUMN water_balance_schedule_id SET DEFAULT nextval('public."waterBalanceSchedule_water_balance_schedule_id_seq"'::regclass);


--
-- Name: weather weather_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather ALTER COLUMN weather_id SET DEFAULT nextval('public.weather_weather_id_seq'::regclass);


--
-- Name: weatherHourly weather_hourly_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."weatherHourly" ALTER COLUMN weather_hourly_id SET DEFAULT nextval('public."weatherHourly_weather_hourly_id_seq"'::regclass);


--
-- Name: yield yield_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.yield ALTER COLUMN yield_id SET DEFAULT nextval('public.yield_yield_id_seq'::regclass);


--
-- Data for Name: area; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.area (figure_id, total_area, grid_points, perimeter, total_area_unit, perimeter_unit) FROM stdin;
dc5152f6-09f3-11ee-8a72-7ac3b12dfaeb	761.000000000000	[{"lat": 49.89206480355518, "lng": -123.15865727644349}, {"lat": 49.89212701001525, "lng": -123.15830322485353}, {"lat": 49.89185744810921, "lng": -123.15822812300111}, {"lat": 49.891822888781554, "lng": -123.15859290342713}]	111.000000000000	m2	m
06048672-09f4-11ee-a5ad-7ac3b12dfaeb	1132.000000000000	[{"lat": 49.89087674203466, "lng": -123.1585365022471}, {"lat": 49.89089747804069, "lng": -123.15805370462442}, {"lat": 49.89059334905909, "lng": -123.1580322469523}, {"lat": 49.89060026110268, "lng": -123.15852577341104}]	135.000000000000	ha	m
174579c8-09f4-11ee-a5ad-7ac3b12dfaeb	2070.000000000000	[{"lat": 49.88992568745494, "lng": -123.15822924356809}, {"lat": 49.889593903608706, "lng": -123.15822924356809}, {"lat": 49.88962155234968, "lng": -123.15749968271604}, {"lat": 49.890036281563525, "lng": -123.15758551340451}]	184.000000000000	ha	m
4cf69070-09f4-11ee-a5ad-7ac3b12dfaeb	395.000000000000	[{"lat": 49.89174520206792, "lng": -123.15888850670224}, {"lat": 49.891759025824186, "lng": -123.15908162575131}, {"lat": 49.89200785275991, "lng": -123.15911381225949}, {"lat": 49.89197329353999, "lng": -123.15888850670224}]	84.000000000000	m2	m
6d95cb52-09f4-11ee-aed0-7ac3b12dfaeb	464.000000000000	[{"lat": 49.89160005238805, "lng": -123.15922406297086}, {"lat": 49.89139269494525, "lng": -123.15928843598722}, {"lat": 49.891434166505086, "lng": -123.15953519921659}, {"lat": 49.89166917133766, "lng": -123.15947082620023}]	88.000000000000	m2	m
ba9aac6a-09f4-11ee-8b51-7ac3b12dfaeb	139.000000000000	[{"lat": 49.892242854799015, "lng": -123.1593274680888}, {"lat": 49.89211153027116, "lng": -123.15929528158063}, {"lat": 49.89211844209733, "lng": -123.15916653554791}, {"lat": 49.89227050202251, "lng": -123.15922017972821}]	50.000000000000	m2	m
eac37bb0-09f4-11ee-8b51-7ac3b12dfaeb	206.000000000000	[{"lat": 49.89292283503756, "lng": -123.15994974058026}, {"lat": 49.89285371788342, "lng": -123.16013213079327}, {"lat": 49.89297812868961, "lng": -123.16020723264569}, {"lat": 49.89303342227828, "lng": -123.16003557126874}]	58.000000000000	m2	m
708b4c14-09f5-11ee-8b51-7ac3b12dfaeb	97436.000000000000	[{"lat": 49.893110764765495, "lng": -123.16094021629445}, {"lat": 49.89179752702342, "lng": -123.16002826522939}, {"lat": 49.88995202201375, "lng": -123.15924506019704}, {"lat": 49.88919859331641, "lng": -123.15962056945912}, {"lat": 49.88930918909104, "lng": -123.15634827446095}, {"lat": 49.8918389982354, "lng": -123.15671305488698}, {"lat": 49.89344252443553, "lng": -123.15862278770558}]	1374.000000000000	ha	km
\.


--
-- Data for Name: barn; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.barn (location_id, wash_and_pack, cold_storage, used_for_animals) FROM stdin;
eac2e4de-09f4-11ee-8b51-7ac3b12dfaeb	\N	\N	\N
\.


--
-- Data for Name: bed_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bed_method (planting_management_plan_id, number_of_beds, number_of_rows_in_bed, plant_spacing, plant_spacing_unit, bed_length, bed_length_unit, planting_depth, planting_depth_unit, bed_width, bed_width_unit, bed_spacing, bed_spacing_unit, specify_beds) FROM stdin;
62deed8f-c40b-4580-91ec-e4d99e1d631b	10	10	0.225000000000	cm	5.000000000000	m	0.010000000000	cm	\N	cm	\N	cm	\N
\.


--
-- Data for Name: broadcast_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.broadcast_method (planting_management_plan_id, percentage_planted, area_used, area_used_unit, seeding_rate) FROM stdin;
\.


--
-- Data for Name: buffer_zone; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.buffer_zone (location_id) FROM stdin;
8fa803ae-09f4-11ee-aed0-7ac3b12dfaeb
\.


--
-- Data for Name: ceremonial_area; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ceremonial_area (location_id) FROM stdin;
\.


--
-- Data for Name: certifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certifications (certification_id, certification_type, certification_translation_key) FROM stdin;
1	Organic	ORGANIC
2	Participatory Guarantee System	PGS
\.


--
-- Data for Name: certifier_country; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certifier_country (certifier_country_id, certifier_id, country_id) FROM stdin;
1	1	37
2	2	37
3	3	37
4	4	37
5	5	37
6	6	37
7	7	37
8	8	37
9	9	37
10	10	157
13	13	61
15	15	128
16	16	128
17	17	63
18	18	28
19	19	28
\.


--
-- Data for Name: certifiers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.certifiers (certifier_id, certification_id, certifier_name, certifier_acronym, survey_id) FROM stdin;
1	1	Islands Organic Producers Association	IOPA	\N
2	1	Kootenay Organic Growers Society	KOGS	\N
3	1	Living Earth Organic Growers	LEOGA	\N
4	1	British Columbia Association for Regenerative Agriculture	BCARA	\N
5	1	Bio-Dynamic Agricultural Society of British Columbia	BDASBC	\N
6	1	North Okanagan Organic Association	NOOA	\N
7	1	Similkameen Okanagan Organic Producers Association	SOOPA	\N
8	1	Pacific Agricultural Certification Society	PACS	\N
9	1	Fraser Valley Organic Producers	FVOPA	\N
10	2	Asociación de Productores Orgánicos	APRO	\N
13	2	Movimiento de economía Social y Solidaria del Ecuador	MESSE	\N
15	2	Centro Campesino para el Desarrollo Sustentable	CAMPESINO	\N
16	2	Tijtoca Nemiliztli	TNAC	\N
17	2	Fundación para el Desarrollo Socioeconómico y Restauración Ambiental	FUNDESYRAM	\N
18	2	Rede Ecovida de Agroecologia	Ecovida	\N
19	2	Rede de Agroecologia Povos da Mata	Povos da Mata	\N
\.


--
-- Data for Name: cleaning_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cleaning_task (task_id, product_id, cleaning_target, agent_used, water_usage, water_usage_unit, product_quantity, product_quantity_unit) FROM stdin;
2	\N	\N	f	\N	l	\N	l
\.


--
-- Data for Name: container_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.container_method (planting_management_plan_id, in_ground, plant_spacing, plant_spacing_unit, total_plants, number_of_containers, plants_per_container, planting_depth, planting_depth_unit, planting_soil, container_type) FROM stdin;
9f15afc2-2d72-4a16-84e3-14329b7adf90	t	0.050000000000	cm	500	\N	\N	0.050000000000	cm	\N	\N
\.


--
-- Data for Name: countries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.countries (id, country_name, currency, symbol, iso, unit) FROM stdin;
1	Afghanistan	Afghan afghani	؋	AFN	Metric
2	Albania	Albanian lek	L	ALL	Metric
3	Algeria	Algerian dinar	د.ج	DZD	Metric
4	Andorra	Euro	€	EUR	Metric
5	Angola	Angolan kwanza	Kz	AOA	Metric
6	Anguilla	Eastern Caribbean dollar	$	XCD	Metric
7	Antigua and Barbuda	Eastern Caribbean dollar	$	XCD	Metric
8	Argentina	Argentine peso	$	ARS	Metric
9	Armenia	Armenian dram	֏	AMD	Metric
10	Aruba	Aruban florin	ƒ	AWG	Metric
11	Australia	Australian dollar	$	AUD	Metric
12	Austria	Euro	€	EUR	Metric
13	Azerbaijan	Azerbaijani manat	₼	AZN	Metric
14	The Bahamas	Bahamian dollar	$	BSD	Metric
15	Bahrain	Bahraini dinar	.د.ب	BHD	Metric
16	Bangladesh	Bangladeshi taka	৳	BDT	Metric
17	Barbados	Barbadian dollar	$	BBD	Metric
18	Belarus	Belarusian ruble	Br	BYN	Metric
19	Belgium	Euro	€	EUR	Metric
20	Belize	Belize dollar	$	BZD	Metric
21	Benin	West African CFA franc	Fr	XOF	Metric
22	Bermuda	Bermudian dollar	$	BMD	Metric
23	Bhutan	Bhutanese ngultrum	Nu.	BTN	Metric
24	Bolivia	Bolivian boliviano	Bs.	BOB	Metric
25	Bonaire	United States dollar	$	USD	Metric
26	Bosnia and Herzegovina	Bosnia and Herzegovina convertible mark	KM	BAM	Metric
27	Botswana	Botswana pula	P	BWP	Metric
28	Brazil	Brazilian real	R$	BRL	Metric
29	British Indian Ocean Territory	United States dollar	$	USD	Metric
30	British Virgin Islands	United States dollar	$	USD	Metric
31	Brunei	Brunei dollar	$	BND	Metric
32	Bulgaria	Bulgarian lev	лв.	BGN	Metric
33	Burkina Faso	West African CFA franc	Fr	XOF	Metric
34	Burundi	Burundian franc	Fr	BIF	Metric
35	Cambodia	Cambodian riel	៛	KHR	Metric
36	Cameroon	Central African CFA franc	Fr	XAF	Metric
37	Canada	Canadian dollar	$	CAD	Metric
38	Cape Verde	Cape Verdean escudo	Esc	CVE	Metric
39	Cayman Islands	Cayman Islands dollar	$	KYD	Metric
40	Central African Republic	Central African CFA franc	Fr	XAF	Metric
41	Chad	Central African CFA franc	Fr	XAF	Metric
42	Chile	Chilean peso	$	CLP	Metric
43	China	Chinese yuan	元	CNY	Metric
44	Colombia	Colombian peso	$	COP	Metric
45	Comoros	Comorian franc	Fr	KMF	Metric
46	Democratic Republic of the Congo	Congolese franc	Fr	CDF	Metric
47	Republic of the Congo	Central African CFA franc	Fr	XAF	Metric
49	Costa Rica	Costa Rican colón	₡	CRC	Metric
50	Côte d'Ivoire	West African CFA franc	Fr	XOF	Metric
51	Croatia	Croatian kuna	kn	HRK	Metric
52	Cuba	Cuban peso	$	CUP	Metric
53	Curaçao	Netherlands Antillean guilder	ƒ	ANG	Metric
54	Cyprus	Euro	€	EUR	Metric
56	Denmark	Danish krone	kr	DKK	Metric
57	Djibouti	Djiboutian franc	Fr	DJF	Metric
58	Dominica	Eastern Caribbean dollar	$	XCD	Metric
59	Dominican Republic	Dominican peso	$	DOP	Metric
61	Ecuador	United States dollar	$	USD	Metric
62	Egypt	Egyptian pound	ج.م	EGP	Metric
63	El Salvador	United States dollar	$	USD	Metric
64	Equatorial Guinea	Central African CFA franc	Fr	XAF	Metric
65	Eritrea	Eritrean nakfa	Nfk	ERN	Metric
66	Estonia	Euro	€	EUR	Metric
67	Eswatini	Swazi lilangeni	L	SZL	Metric
68	Ethiopia	Ethiopian birr	Br	ETB	Metric
70	Faroe Islands	Danish krone	kr	DKK	Metric
71	Fiji	Fijian dollar	$	FJD	Metric
72	Finland	Euro	€	EUR	Metric
73	France	Euro	€	EUR	Metric
74	French Polynesia	CFP franc	₣	XPF	Metric
75	Gabon	Central African CFA franc	Fr	XAF	Metric
76	The Gambia	Gambian dalasi	D	GMD	Metric
77	Georgia	Georgian lari	₾	GEL	Metric
78	Germany	Euro	€	EUR	Metric
79	Ghana	Ghanaian cedi	₵	GHS	Metric
80	Greece	Euro	£	EUR	Metric
81	Grenada	Eastern Caribbean dollar	$	XCD	Metric
82	Guatemala	Guatemalan quetzal	Q	GTQ	Metric
83	Guinea	Guinean franc	Fr	GNF	Metric
84	Guinea-Bissau	West African CFA franc	Fr	XOF	Metric
85	Guyana	Guyanese dollar	$	GYD	Metric
86	Haiti	Haitian gourde	G	HTG	Metric
87	Honduras	Honduran lempira	L	HNL	Metric
88	Hong Kong	Hong Kong dollar	$	HKD	Metric
89	Hungary	Hungarian forint	Ft	HUF	Metric
90	Iceland	Icelandic króna	kr	ISK	Metric
91	India	Indian rupee	₹	INR	Metric
92	Indonesia	Indonesian rupiah	Rp	IDR	Metric
93	Iran	Iranian rial	﷼	IRR	Metric
94	Iraq	Iraqi dinar	ع.د	IQD	Metric
95	Ireland	Euro	€	EUR	Metric
96	Israel	Israeli new shekel	₪	ILS	Metric
97	Italy	Euro	€	EUR	Metric
98	Jamaica	Jamaican dollar	$	JMD	Metric
99	Japan	Japanese yen	円	JPY	Metric
100	Jordan	Jordanian dinar	د.ا	JOD	Metric
101	Kazakhstan	Kazakhstani tenge	₸	KZT	Metric
102	Kenya	Kenyan shilling	Sh	KES	Metric
103	Kiribati	Kiribati dollar	$	KID[G]	Metric
104	North Korea	North Korean won	₩	KPW	Metric
105	South Korea	South Korean won	₩	KRW	Metric
106	Kosovo	Euro	€	EUR	Metric
107	Kuwait	Kuwaiti dinar	د.ك	KWD	Metric
108	Kyrgyzstan	Kyrgyzstani som	с	KGS	Metric
109	Laos	Lao kip	₭	LAK	Metric
110	Latvia	Euro	€	EUR	Metric
111	Lebanon	Lebanese pound	ل.ل	LBP	Metric
112	Lesotho	Lesotho loti	L	LSL	Metric
113	Liberia	Liberian dollar	$	LRD	Metric
114	Libya	Libyan dinar	ل.د	LYD	Metric
115	Liechtenstein	Swiss franc	Fr.	CHF	Metric
116	Lithuania	Euro	€	EUR	Metric
117	Luxembourg	Euro	€	EUR	Metric
119	Madagascar	Malagasy ariary	Ar	MGA	Metric
120	Malawi	Malawian kwacha	MK	MWK	Metric
121	Malaysia	Malaysian ringgit	RM	MYR	Metric
122	Maldives	Maldivian rufiyaa	.ރ	MVR	Metric
123	Mali	West African CFA franc	Fr	XOF	Metric
124	Malta	Euro	€	EUR	Metric
125	Marshall Islands	United States dollar	$	USD	Metric
126	Mauritania	Mauritanian ouguiya	UM	MRU	Metric
127	Mauritius	Mauritian rupee	₨	MUR	Metric
128	Mexico	Mexican peso	$	MXN	Metric
129	Micronesia	United States dollar	$	USD	Metric
130	Moldova	Moldovan leu	L	MDL	Metric
131	Monaco	Euro	€	EUR	Metric
132	Mongolia	Mongolian tögrög	₮	MNT	Metric
133	Montenegro	Euro	€	EUR	Metric
134	Montserrat	Eastern Caribbean dollar	$	XCD	Metric
135	Morocco	Moroccan dirham	د.م.	MAD	Metric
136	Mozambique	Mozambican metical	MT	MZN	Metric
138	Namibia	Namibian dollar	$	NAD	Metric
139	Nauru	Australian dollar	$	AUD	Metric
140	Nepal	Nepalese rupee	रू	NPR	Metric
141	Netherlands	Euro	€	EUR	Metric
142	New Caledonia	CFP franc	₣	XPF	Metric
143	New Zealand	New Zealand dollar	$	NZD	Metric
144	Nicaragua	Nicaraguan córdoba	C$	NIO	Metric
145	Niger	West African CFA franc	Fr	XOF	Metric
146	Nigeria	Nigerian naira	₦	NGN	Metric
147	Niue	New Zealand dollar	$	NZD	Metric
148	North Macedonia	Macedonian denar	ден	MKD	Metric
149	Northern Cyprus	Turkish lira	₺	TRY	Metric
150	Norway	Norwegian krone	kr	NOK	Metric
151	Oman	Omani rial	ر.ع.	OMR	Metric
152	Pakistan	Pakistani rupee	₨	PKR	Metric
153	Palau	United States dollar	$	USD	Metric
154	Palestine	Israeli new shekel	₪	ILS	Metric
155	Panama	Panamanian balboa	B/.	PAB	Metric
156	Papua New Guinea	Papua New Guinean kina	K	PGK	Metric
157	Paraguay	Paraguayan guaraní	₲	PYG	Metric
158	Peru	Peruvian sol	S/.	PEN	Metric
159	Philippines	Philippine peso	₱	PHP	Metric
160	Pitcairn Islands	New Zealand dollar	$	NZD	Metric
161	Poland	Polish złoty	zł	PLN	Metric
162	Portugal	Euro	€	EUR	Metric
163	Qatar	Qatari riyal	ر.ق	QAR	Metric
164	Romania	Romanian leu	lei	RON	Metric
165	Russia	Russian ruble	₽	RUB	Metric
166	Rwanda	Rwandan franc	Fr	RWF	Metric
167	Saint Helena	Saint Helena pound	£	SHP	Metric
168	Saint Kitts and Nevis	Eastern Caribbean dollar	$	XCD	Metric
169	Saint Lucia	Eastern Caribbean dollar	$	XCD	Metric
170	Saint Vincent and the Grenadines	Eastern Caribbean dollar	$	XCD	Metric
171	Samoa	Samoan tālā	T	WST	Metric
172	San Marino	Euro	€	EUR	Metric
173	São Tomé and Príncipe	São Tomé and Príncipe dobra	Db	STN	Metric
174	Saudi Arabia	Saudi riyal	﷼	SAR	Metric
175	Senegal	West African CFA franc	Fr	XOF	Metric
176	Serbia	Serbian dinar	дин.	RSD	Metric
177	Seychelles	Seychellois rupee	₨	SCR	Metric
178	Sierra Leone	Sierra Leonean leone	Le	SLL	Metric
179	Singapore	Singapore dollar	$	SGD	Metric
180	Sint Eustatius	United States dollar	$	USD	Metric
181	Sint Maarten	Netherlands Antillean guilder	ƒ	ANG	Metric
182	Slovakia	Euro	€	EUR	Metric
183	Slovenia	Euro	€	EUR	Metric
184	Solomon Islands	Solomon Islands dollar	$	SBD	Metric
185	Somalia	Somali shilling	Sh	SOS	Metric
186	Somaliland	Somaliland shilling	Sl	SLS[G]	Metric
187	South Africa	South African rand	R	ZAR	Metric
188	Spain	Euro	€	EUR	Metric
189	South Sudan	South Sudanese pound	£	SSP	Metric
190	Sri Lanka	Sri Lankan rupee	ரூ	LKR	Metric
191	Sudan	Sudanese pound	ج.س.	SDG	Metric
192	Suriname	Surinamese dollar	$	SRD	Metric
193	Sweden	Swedish krona	kr	SEK	Metric
194	Switzerland	Swiss franc	Fr.	CHF	Metric
195	Syria	Syrian pound	ل.س	SYP	Metric
196	Taiwan	New Taiwan dollar	$	TWD	Metric
197	Tajikistan	Tajikistani somoni	ЅМ	TJS	Metric
198	Tanzania	Tanzanian shilling	Sh	TZS	Metric
199	Thailand	Thai baht	฿	THB	Metric
200	Togo	West African CFA franc	Fr	XOF	Metric
201	Tonga	Tongan paʻanga	T$	TOP	Metric
202	Trinidad and Tobago	Trinidad and Tobago dollar	р.	TTD	Metric
203	Tunisia	Tunisian dinar	$	TND	Metric
205	Turkmenistan	Turkmenistan manat	₺	TMT	Metric
206	Turks and Caicos Islands	United States dollar	m	USD	Metric
207	Tuvalu	Tuvaluan dollar	$	TVD[G]	Metric
208	Uganda	Ugandan shilling	Sh	UGX	Metric
209	Ukraine	Ukrainian hryvnia	₴	UAH	Metric
210	United Arab Emirates	United Arab Emirates dirham	د.إ	AED	Metric
211	United Kingdom	British pound	£	GBP	Metric
212	United States	United States dollar	$	USD	Imperial
213	Uruguay	Uruguayan peso	$	UYU	Metric
214	Uzbekistan	Uzbekistani soʻm	сўм	UZS	Metric
215	Vanuatu	Vanuatu vatu	Vt	VUV	Metric
216	Vatican City	Euro	€	EUR	Metric
217	Venezuela	Venezuelan bolívar soberano	Bs.	VES	Metric
218	Vietnam	Vietnamese đồng	₫	VND	Metric
219	Wallis and Futuna	CFP franc	₣	XPF	Metric
220	Yemen	Yemeni rial	ر.ي	YER	Metric
221	Zambia	Zambian kwacha	ZK	ZMW	Metric
222	Zimbabwe	RTGS dollar	(none)	(none)	Metric
55	Czechia	Czech koruna	Kč	CZK	Metric
137	Myanmar (Burma)	Burmese kyat	Ks	MMK	Metric
118	Macao	Macanese pataca	P	MOP	Metric
60	Timor-Leste	United States dollar	$	USD	Metric
69	Falkland Islands (Islas Malvinas)	Falkland Islands pound	£	FKP	Metric
223	Greenland	Danish krone	kr	DKK	Metric
224	Gibraltar	Gibraltar pound	£	GIP	Metric
225	Puerto Rico	United States dollar	$	USD	Imperial
226	Guam	United States dollar	$	USD	Imperial
227	Caribbean Netherlands	Netherlands Antillean guilder	ƒ	ANG	Metric
48	Cook Islands	New Zealand dollar	$	NZD	Metric
204	Türkiye	Turkish lira	د.ت	TRY	Metric
\.


--
-- Data for Name: crop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crop (crop_id, crop_common_name, crop_genus, crop_specie, crop_group, crop_subgroup, max_rooting_depth, depletion_fraction, is_avg_depth, initial_kc, mid_kc, end_kc, max_height, is_avg_kc, nutrient_notes, percentrefuse, refuse, protein, lipid, energy, ca, fe, mg, ph, k, na, zn, cu, fl, mn, se, vita_rae, vite, vitc, thiamin, riboflavin, niacin, pantothenic, vitb6, folate, vitb12, vitk, is_avg_nutrient, farm_id, user_added, deleted, nutrient_credits, created_by_user_id, updated_by_user_id, created_at, updated_at, crop_translation_key, crop_photo_url, reviewed, can_be_cover_crop, planting_depth, yield_per_area, average_seed_weight, yield_per_plant, lifecycle, seeding_type, needs_transplant, germination_days, transplant_days, harvest_days, termination_days, planting_method, plant_spacing, seeding_rate, hs_code_id) FROM stdin;
176	Angico vermelho	Anadenanthera	colubrina	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANGICO_VERMELHO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	4	\N	\N	\N	\N	\N	\N	\N
28	Avocado	Persea	americana	Fruit and nuts	Tropical and subtropical fruits	0.75	0.7	f	0.6	0.85	0.75	3	f	\N	26	\N	2	14.66	160	12	0.55	29	52	485	7	0.64	0.19	\N	0.142	\N	7	\N	10	0.067	0.13	1.738	\N	0.257	81	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	AVOCADO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/avocado.webp	t	f	\N	2.550000000000	\N	34.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	28	\N	1825	\N	\N	3.250000000000	\N	\N
198	Brazilian grape tree	Myrciaria	cauliflora	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BRAZILIAN_GRAPE_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/brazilian_grape_tree.webp	t	f	\N	\N	\N	453.600000000000	PERENNIAL	SEED	t	60	\N	\N	\N	\N	\N	\N	\N
202	Buriti palm (Buriti)	Mauritia	flexuosa	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BURITI_PALM_BURITI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
210	Cega machado	Physocalymma	scaberrimum pohl	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CEGA_MACHADO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
213	Cherry barbados (Barbados cherry)	Malpighia	emarginata	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHERRY_BARBADOS_BARBADOS_CHERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/barbados_cherry.webp	t	f	\N	4.500000000000	\N	24.750000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	365	\N	\N	\N	\N	\N
214	Cherry surinam (Surinam cherry)	Eugenia	uniflora	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHERRY_SURINAM_SURINAM_CHERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/surinam_cherry.webp	t	f	\N	\N	\N	3.180000000000	PERENNIAL	SEED	t	21	\N	\N	\N	\N	\N	\N	\N
216	Chichá do cerrado	Sterculia	chicha	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICHÁ_DO_CERRADO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
220	Chupa-chupa	Quararibea	cordata	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHUPA_CHUPA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chupa-chupa.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	14	\N	\N	\N	\N	\N	\N	\N
226	Cochineal cactus (Palma / nopal)	Opuntia	cochenillifera	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COCHINEAL_CACTUS_PALMA_NOPAL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cochineal_cactus.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
232	Corn salad	Valerianella	locusta	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CORN_SALAD	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/corn_salad.webp	t	t	0.035000000000	\N	0.000010000000	\N	ANNUAL	SEED	t	7	35	\N	\N	\N	0.225000000000	0.008406000000	\N
130	Cowpea, for grain	Vigna	unguiculata	Leguminous crops	Leguminous crops	0.75	0.5	t	0.4	1.05	0.325	\N	t	\N	0	\N	23.85	2.07	343	85	9.95	333	438	1375	58	6.11	1.059	\N	1.544	\N	2	\N	1.5	0.68	0.17	2.795	\N	0.361	639	0	\N	f	\N	f	f	60	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COWPEA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cowpea.webp	t	t	\N	0.055000000000	0.000070000000	\N	ANNUAL	SEED	f	8	\N	\N	\N	\N	\N	0.005604000000	\N
236	Cupuaçu	Theobroma	grandiflorum	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUPUAÇU	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cupuaçu.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
156	Endive	Cichorium	endivia	Vegetables and melons	Leafy or stem vegetables	0.76	0.39333335	t	0.68333334	1.0204667	0.91333336	\N	t	\N	14	\N	1.25	0.2	17	52	0.83	15	28	314	22	0.79	0.099	\N	0.42	\N	108	\N	6.5	0.08	0.075	0.4	\N	0.02	142	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ENDIVE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/endive.webp	t	f	0.006300000000	1.946000000000	0.000010000000	0.250000000000	ANNUAL	SEED	t	2	\N	\N	\N	\N	0.375000000000	\N	\N
241	Espinheira santa	Maytenus	illicifolia	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ESPINHEIRA_SANTA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
242	Ethiopian nightshade	Solanum	aethiopicum	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ETHIOPIAN_NIGHTSHADE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/ethiopian_nightshade.webp	t	f	\N	\N	\N	\N	ANNUAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
250	Gooseberry barbados (Barbados gooseberry)	Pereskia	aculeata	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GOOSEBERRY_BARBADOS_BARBADOS_GOOSEBERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/barbados_gooseberry.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
259	Guaraná	Paullinia	cupana	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GUARANÁ	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/guaraná.webp	t	f	\N	0.037000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
260	Gueroba	Syagrus	oleracea	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GUEROBA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	60	\N	\N	\N	\N	\N	\N	\N
264	Henequen	Agave	fourcroydes	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HENEQUEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/henequen.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
267	Ice-cream bean	Inga	edulis	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ICE_CREAM_BEAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/ice_cream_bean.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
268	Imburana de cheiro, cumaru nordestino	Amburana	cearensis	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	IMBURANA_DE_CHEIRO_CUMARU_NORDESTINO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	15	\N	\N	\N	\N	\N	\N	\N
274	Jatobá do cerrado	Hymenaea	stigonocarpa	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JATOBÁ_DO_CERRADO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
276	Jointed flatsedge	Cyperus	articulatus	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JOINTED_FLATSEDGE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	\N
279	Lamb's-ear	Stachys	byzantina	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LAMB_S_EAR	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lambs_ear.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
286	Lipstick tree	Bixa	orellana	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LIPSTICK_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lipstick_tree.webp	t	f	\N	0.115000000000	\N	2.250000000000	PERENNIAL	SEED	t	14	\N	365	\N	ROW_METHOD	2.500000000000	\N	\N
288	Loquat	Eriobotrya	japonica	Fruit and nuts	Pome fruits and stone fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LOQUAT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/loquat.webp	t	f	\N	1.600000000000	\N	50.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	90	\N	\N	\N	\N	\N
291	Macaw palm (Macaúba)	Acrocomia	aculeata	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MACAW_PALM_MACAÚBA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	0.250000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
293	Maize for silage	Zea	mays	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_FOR_SILAGE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maize_for_silage.webp	t	t	0.035000000000	0.990000000000	\N	\N	ANNUAL	SEED	f	7	\N	\N	\N	\N	0.075000000000	\N	\N
299	Marang	Artocarpus	odoratissimus	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MARANG	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/marang.webp	t	f	\N	0.500000000000	\N	\N	PERENNIAL	SEED	t	28	\N	\N	\N	\N	\N	\N	\N
300	Marcela	Achyrocline	satureioides	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MARCELA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	f	\N	\N	\N	\N	\N	\N	\N	\N
304	Mignonette vine	Andredera	cordifolia	Other crops	Flower crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MIGNONETTE_VINE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mignonette_vine.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
307	Mocambo tree	Theobroma	bicolor	Stimulant, spice and aromatic crops	Stimulant crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MOCAMBO_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mocambo_tree.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
308	Mombin purple (Purple mombin or Spanish plum)	Spondias	purpurea	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MOMBIN_PURPLE_PURPLE_MOMBIN_OR_SPANISH_PLUM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/purple_mombin.webp	t	f	\N	\N	\N	540.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	0.082500000000	\N	\N
309	Mombin yellow (Yellow mombin)	Spondias	mombin	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MOMBIN_YELLOW_YELLOW_MOMBIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/yellow_mombin.webp	t	f	\N	\N	\N	540.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	0.082500000000	\N	\N
311	Monkey pepper (Pimenta de macaco)	Xylopia	aromatica	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MONKEY_PEPPER_PIMENTA_DE_MACACO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
312	Mulberry for silkworms	Morus	alba	Fruit and nuts	Other fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MULBERRY_FOR_SILKWORMS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mulberry_for_silkworms.webp	t	f	\N	0.900000000000	\N	151.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	9	\N	84	\N	\N	\N	\N	\N
313	Mulberry indian (Indian mulberry)	Morinda	citrifolia	Fruit and nuts	Other fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MULBERRY_INDIAN_INDIAN_MULBERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/indian_mulberry.webp	t	f	\N	7.801000000000	\N	226.800000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	60	\N	270	\N	\N	\N	\N	\N
314	Mulungu	Erythrina	verna	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MULUNGU	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	10	\N	\N	\N	\N	\N	\N	\N
132	Mustard, for seed	Brassica	nigra	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	1.19	0.56	t	0.37	1.14	0.37	\N	t	\N	7	\N	2.86	0.42	27	115	1.64	32	58	384	20	0.25	0.165	\N	\N	\N	151	\N	70	0.08	0.11	0.8	\N	0.18	12	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MUSTARD_FOR_SEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mustard.webp	t	t	0.007500000000	0.368000000000	0.000010000000	\N	ANNUAL	SEED	f	5	\N	80	\N	\N	0.125000000000	0.000580000000	\N
316	Oca	Oxalis	tuberosus	High starch root/tuber crops	Other roots and tubers	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OCA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	0.850000000000	\N	1.360000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
134	Oil palm	Elaeis	guineensis	Oilseed crops and oleaginous fruits	Permanent oilseed crops	1.45	0.65	t	0.65	0.7	0.7	\N	t	\N	0	\N	0	100	884	0	0.01	0	0	0	0	0	0	\N	\N	\N	0	\N	0	0	0	0	\N	0	0	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OIL_PALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/oil_palm.webp	t	f	\N	0.220000000000	\N	9071.850000000000	PERENNIAL	SEED	t	\N	\N	1095	\N	\N	\N	\N	\N
321	Oppositeleaf Russian thistle	Salsola	soda	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OPPOSITELEAF_RUSSIAN_THISTLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/salsola_soda.webp	t	f	\N	0.060000000000	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	\N
108	Persimmon	Diospyros	virginiana	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	16	\N	0.58	0.19	70	8	0.15	9	17	161	1	0.11	0.113	\N	0.355	\N	81	\N	7.5	0.03	0.02	0.1	\N	0.1	8	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PERSIMMON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/persimmon.webp	t	f	0.020000000000	1.000000000000	\N	28.000000000000	PERENNIAL	SEED	t	10	\N	730	\N	\N	3.962400000000	\N	\N
224	Clove	Syzygium	aromaticum	Stimulant, spice and aromatic crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CLOVE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/clove.webp	t	f	0.025400000000	\N	\N	11.340000000000	PERENNIAL	SEED	t	21	\N	1825	\N	\N	0.393700000000	\N	90700
335	Pumpkin, for fodder	Cucurbita	spp.	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PUMPKIN_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pumpkin.webp	t	f	0.020000000000	2.522000000000	0.000090000000	79.380000000000	ANNUAL	SEED	t	7	25	110	\N	\N	1.050000000000	\N	\N
338	Quickstick	Gliricidia	sepium	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	QUICKSTICK	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/quickstick.webp	t	f	\N	2.450000000000	\N	2.600000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
341	Redtop	Agrostis	spp.	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	REDTOP	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/redtop.webp	t	t	0.003800000000	0.008000000000	0.000010000000	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	\N	0.000056000000	\N
345	Rose apple	Syzygium	spp.	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROSE_APPLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rose_gum_eucalyptus.webp	t	f	\N	\N	\N	2.270000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
346	Rose Gum Eucalyptus (Eucalipto grandis)	Eucalyptus	grandis	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROSE_GUM_EUCALYPTUS_EUCALIPTO_GRANDIS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rose_apple.webp	t	f	\N	1.660000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
347	Roselle	Hibiscus	sabdariffa	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROSELLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/roselle.webp	t	f	\N	1.883000000000	\N	4.280000000000	ANNUAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
349	Saba Nut (Castanha do maranhão)	Bombacopsis	glabra	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SABA_NUT_CASTANHA_DO_MARANHÃO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
353	Satsuma (manderine/tangerine)	Citrus	unshiu	Fruit and nuts	Citrus fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SATSUMA_MANDERINE_TANGERINE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/satsuma.webp	t	f	\N	0.024000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	\N
355	Scorzonera black salsify	Scorzonera	hispanica	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SCORZONERA_BLACK_SALSIFY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/scorzonera_black_salsify.webp	t	f	0.013800000000	\N	\N	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	0.025400000000	0.001233000000	\N
367	Strawberry guava	Psidium	cattleianum	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STRAWBERRY_GUAVA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/strawberry_guava.webp	t	f	\N	\N	\N	14.200000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
374	Tahitian gooseberry tree	Phyllanthus	acidus	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TAHITIAN_GOOSEBERRY_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tahitian_gooseberry_tree.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	\N
378	Tingui	Magonia	pubescens A.	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TINGUI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	15	\N	\N	\N	\N	\N	\N	\N
379	Tree spinach	Cnidoscolus	aconitifolius	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TREE_SPINACH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tree_spinach.webp	t	f	\N	\N	\N	0.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	365	\N	\N	2.743200000000	\N	\N
385	Urena (congo jute)	Urena	lobata	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	URENA_CONGO_JUTE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/urena_congo_jute.webp	t	f	0.015000000000	0.205000000000	\N	\N	PERENNIAL	SEED	f	5	\N	\N	\N	ROW_METHOD	\N	\N	\N
386	Uvaia	Eugenia	pyriformis	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	UVAIA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/uvaia.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	10	\N	1095	\N	\N	\N	\N	\N
143	Tobacco	Nicotiana	tabacum	Other crops	Tobacco	1.32	0.58	t	0.52	0.94	0.66	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOBACCO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tobacco.webp	t	f	\N	\N	0.000010000000	\N	ANNUAL	SEED	t	10	\N	\N	\N	\N	\N	\N	2401
390	West Indian locust (Jatobá da mata)	Hymenaea	courbaril	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WEST_INDIAN_LOCUST_JATOBÁ_DA_MATA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	8	\N	\N	\N	\N	\N	\N	\N
1	Tea	Camellia	sinensis	Stimulant, spice and aromatic crops	Stimulant crops	1.2	0.4	f	0.95	1	1	1.5	f	\N	\N	\N	0	0	6.23125	0	0.124625	18.69375	6.23125	230.55624	18.69375	0.124625	0.0623125	\N	1.3646437	\N	0	\N	0	0	0.0872375	0	\N	0	31.15625	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TEA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tea.webp	t	f	\N	0.395000000000	\N	0.230000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	90200
2	Coffee	Coffea	spp.	Stimulant, spice and aromatic crops	Stimulant crops	1.2	0.4	f	0.9	0.95	0.95	2.5	f	\N	\N	\N	1.9878	0.3313	16.565	33.13	0.16565	49.695	49.695	811.685	33.13	0.3313	0.03313	\N	0.380995	\N	0	\N	0	0.23191	1.25894	3.163915	\N	0.016565	33.13	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COFFEE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/coffee.webp	t	f	\N	0.211000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	90100
3	Hops	Humulus	lupulus	Stimulant, spice and aromatic crops	Spice and aromatic crops	1.1	0.5	f	0.3	1.05	0.85	5	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HOPS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/hops.webp	t	f	0.100000000000	0.138000000000	\N	0.790000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	49	\N	120	\N	\N	1.219200000000	\N	121010
4	Mint (all varieties)	Mentha	spp.	Other crops	Medicinal, pesticidal or similar crops	0.6	0.4	f	0.6	1.15	1.1	0.7	f	\N	39	\N	3.75	0.94	70	243	5.08	80	73	569	31	1.11	0.329	\N	1.176	\N	212	\N	31.8	0.082	0.266	1.706	\N	0.129	114	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MINT_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mint_all_varieties.webp	t	f	0.006300000000	\N	0.000010000000	0.140000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	10	\N	60	\N	ROW_METHOD	0.525000000000	\N	1211908630
5	Cacao (cocoa)	Theobroma	cacao	Stimulant, spice and aromatic crops	Stimulant crops	0.85	0.3	f	1	1.05	1.05	3	f	\N	0	\N	19.6	13.7	228	128	13.86	499	734	1524	21	6.81	3.788	\N	3.837	\N	0	\N	0	0.078	0.241	2.185	\N	0.118	32	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COCOA_CACAO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cacao_cocoa.webp	t	f	\N	0.064000000000	0.001000000000	98.000000000000	PERENNIAL	SEED	t	20	\N	531	\N	ROW_METHOD	3.500000000000	\N	18010000
6	Oats, for grain	Avena	sativa	Cereals	Cereals	1.25	0.55	f	0.3	1.15	0.25	1	f	\N	0	\N	16.89	6.9	389	54	4.72	177	523	429	2	3.97	0.626	\N	4.916	\N	0	\N	0	0.763	0.139	0.961	\N	0.119	56	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OATS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/oats.webp	t	t	0.030000000000	0.564000000000	0.000030000000	\N	ANNUAL	SEED	f	\N	\N	100	\N	\N	\N	0.007137000000	100490
7	Millet (Japanese)	Echinochloa	esculenta	Cereals	Cereals	1.5	0.55	f	0.3	1	0.3	1.5	f	\N	0	\N	11.02	4.22	378	8	3.01	114	285	195	5	1.68	0.75	\N	1.632	\N	0	\N	0	0.421	0.29	4.72	\N	0.384	85	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_JAPANESE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/millet_broom.webp	t	t	\N	0.897000000000	0.000010000000	\N	ANNUAL	SEED	f	15	\N	\N	\N	\N	\N	0.003080000000	10082920
8	Millet (finger)	Eleusine	coracana	Cereals	Cereals	1.5	0.55	f	0.3	1	0.3	1.5	f	\N	0	\N	11.02	4.22	378	8	3.01	114	285	195	5	1.68	0.75	\N	1.632	\N	0	\N	0	0.421	0.29	4.72	\N	0.384	85	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_FINGER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/millet_broom.webp	t	t	\N	0.213000000000	\N	\N	ANNUAL	SEED	f	2	\N	\N	\N	\N	\N	0.002522000000	10082130
9	Barley	Hordeum	vulgare	Cereals	Cereals	1.25	0.55	f	0.3	1.15	0.25	1	f	\N	0	\N	12.48	2.3	354	33	3.6	133	264	452	12	2.77	0.498	\N	1.943	\N	1	\N	0	0.646	0.285	4.604	\N	0.318	19	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BARLEY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/barley.webp	t	t	0.030000000000	0.300000000000	0.000030000000	0.010000000000	ANNUAL	SEED	f	1	\N	90	\N	ROW_METHOD	0.063500000000	\N	100300
10	Rice (African)	Oryza	glaberrima	Cereals	Cereals	0.75	0.204	f	1.05	1.2	0.75	1	f	\N	0	\N	6.5	0.52	358	3	4.23	23	95	76	1	1.1	0.21	\N	1.037	\N	0	\N	0	0.565	0.048	4.113	\N	0.171	\N	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_AFRICAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rice_african.webp	t	\N	\N	\N	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	1006
11	Rice	Oryza	sativa	Cereals	Cereals	0.75	0.204	f	1.05	1.2	0.75	1	f	\N	0	\N	6.5	0.52	358	3	4.23	23	95	76	1	1.1	0.21	\N	1.037	\N	0	\N	0	0.565	0.048	4.113	\N	0.171	\N	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rice.webp	t	f	\N	0.460000000000	\N	\N	ANNUAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	100620
12	Millet (proso)	Panicum	miliaceum	Cereals	Cereals	1.5	0.55	f	0.3	1	0.3	1.5	f	\N	0	\N	11.02	4.22	378	8	3.01	114	285	195	5	1.68	0.75	\N	1.632	\N	0	\N	0	0.421	0.29	4.72	\N	0.384	85	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_PROSO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/millet_broom.webp	t	t	0.050800000000	0.336000000000	0.000010000000	\N	ANNUAL	SEED	f	15	\N	70	\N	\N	\N	0.002522000000	10082920
13	Millet (bajra, pearl)	Pennisetum	glaucum	Cereals	Cereals	1.5	0.55	f	0.3	1	0.3	1.5	f	\N	0	\N	11.02	4.22	378	8	3.01	114	285	195	5	1.68	0.75	\N	1.632	\N	0	\N	0	0.421	0.29	4.72	\N	0.384	85	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_BAJRA_PEARL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/millet_bajra_pearl.webp	t	t	\N	0.448000000000	\N	\N	ANNUAL	SEED	f	10	\N	75	\N	\N	\N	0.000280000000	10082920
14	Rye	Secale	cereale	Cereals	Cereals	0.8	0.6	f	0.95	1.05	1	0.3	f	\N	0	\N	10.34	1.63	338	24	2.63	110	332	510	2	2.65	0.367	\N	2.577	\N	1	\N	0	0.316	0.251	4.27	\N	0.294	38	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RYE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rye.webp	t	t	0.030000000000	0.276000000000	0.000030000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	0.011208000000	11042985
15	Millet (foxtail)	Setaria	italica	Cereals	Cereals	1.5	0.55	f	0.3	1	0.3	1.5	f	\N	0	\N	11.02	4.22	378	8	3.01	114	285	195	5	1.68	0.75	\N	1.632	\N	0	\N	0	0.421	0.29	4.72	\N	0.384	85	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_FOXTAIL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/millet_bajra_pearl.webp	t	t	\N	0.560000000000	0.000010000000	\N	ANNUAL	SEED	f	7	\N	75	\N	\N	\N	0.003080000000	10082920
17	Sorghum broom (broom corn)	Sorghum	vulgare var. technicum	Cereals	Cereals	1.5	0.55	f	0.3	1.1	0.55	1.5	f	\N	0	\N	10.62	3.46	329	13	3.36	165	289	363	2	1.67	0.284	\N	1.605	\N	0	\N	0	0.332	0.096	3.688	\N	0.443	20	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROOM_SORGHUM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sorghum.webp	t	t	0.015000000000	0.150000000000	\N	\N	ANNUAL	SEED	f	11	\N	90	\N	\N	0.034500000000	0.002802000000	100790
19	Sorghum	Sorghum	bicolor	Cereals	Cereals	1.5	0.55	f	0.3	1.1	0.55	1.5	f	\N	0	\N	10.62	3.46	329	13	3.36	165	289	363	2	1.67	0.284	\N	1.605	\N	0	\N	0	0.332	0.096	3.688	\N	0.443	20	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SORGHUM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sorghum.webp	t	t	0.015000000000	0.150000000000	0.000020000000	\N	ANNUAL	SEED	f	11	\N	90	\N	\N	0.034500000000	0.002802000000	100790
20	Wheat	Triticum	aestivum	Cereals	Cereals	1.25	0.55	f	0.3	1.15	0.3	1	f	\N	0	\N	15.4	1.92	329	25	3.6	124	332	340	2	2.78	0.41	\N	4.055	\N	0	\N	0	0.504	0.11	5.71	\N	0.336	43	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHEAT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/wheat.webp	t	t	0.020000000000	0.340000000000	0.000040000000	\N	ANNUAL	SEED	f	2	\N	130	\N	\N	\N	0.007845000000	100199
21	Pineapple	Ananas	comosus	Fruit and nuts	Tropical and subtropical fruits	0.45	0.5	f	0.5	0.3	0.3	0.8	f	\N	49	\N	0.54	0.12	50	13	0.29	12	8	109	1	0.12	0.11	\N	0.927	\N	3	\N	47.8	0.079	0.032	0.5	\N	0.112	18	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PINEAPPLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pineapple.webp	t	f	\N	6.550000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	10	\N	480	\N	\N	\N	\N	8043000
22	Grapefruit	Citrus	paradisi	Fruit and nuts	Citrus fruits	1.5	0.35	f	0.3	0.85	0.45	2	f	\N	50	\N	0.63	0.1	32	12	0.09	8	8	139	0	0.07	0.047	\N	0.012	\N	46	\N	34.4	0.036	0.02	0.25	\N	0.042	10	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPEFRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grapefruit.webp	t	f	\N	\N	\N	158.760000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	80540
23	Strawberry	Fragaria	spp.	Fruit and nuts	Berries	0.25	0.2	f	0.4	0.85	0.75	0.2	f	\N	6	\N	0.67	0.3	32	16	0.41	13	24	153	1	0.14	0.048	\N	0.386	\N	1	\N	58.8	0.024	0.022	0.386	\N	0.047	24	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STRAWBERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/strawberry.webp	t	f	0.005000000000	1.120000000000	\N	0.790000000000	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	10	\N	100	\N	ROW_METHOD	0.304800000000	\N	8101000
24	Walnut	Juglans	spp.	Fruit and nuts	Nuts	2.05	0.5	f	0.5	1.1	0.6518	4.5	f	\N	76	\N	24.06	59.33	619	61	3.12	201	513	523	2	3.37	1.36	\N	3.896	\N	2	\N	1.7	0.057	0.13	0.47	\N	0.583	31	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WALNUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/walnut.webp	t	f	\N	0.265000000000	\N	83.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	2920	\N	\N	\N	\N	80231
25	Apple	Malus	domestica	Fruit and nuts	Pome fruits and stone fruits	0.45	0.5	f	0.5	0.3	0.3	0.8	f	\N	10	\N	0.26	0.17	52	6	0.12	5	11	107	1	0.04	0.027	\N	0.035	\N	3	\N	4.6	0.017	0.026	0.091	\N	0.041	3	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APPLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp	t	f	\N	10.725000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	730	\N	ROW_METHOD	\N	\N	8081000
26	Banana	Musa	paradisiaca	Fruit and nuts	Tropical and subtropical fruits	0.7	0.35	f	0.5	1.1	1	3	f	\N	36	\N	1.09	0.33	89	5	0.26	27	22	358	1	0.15	0.078	\N	0.27	\N	3	\N	8.7	0.031	0.073	0.665	\N	0.367	20	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/banana.webp	t	f	\N	2.087000000000	\N	12.140000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	405	\N	ROW_METHOD	0.020000000000	\N	8039010
27	Plantain	Musa	paradisiaca	Fruit and nuts	Tropical and subtropical fruits	0.95	0.45	f	0.6	1.05	0.9	0.8	f	\N	35	\N	1.3	0.37	122	3	0.6	37	34	499	4	0.14	0.081	\N	\N	\N	56	\N	18.4	0.052	0.054	0.686	\N	0.299	22	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PLANTAIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/plantain.webp	t	f	\N	0.700000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8039010
29	Dates	Phoenix	dactylifera	Fruit and nuts	Tropical and subtropical fruits	2	0.5	f	0.9	0.95	0.95	8	f	\N	10	\N	2.45	0.39	282	39	1.02	43	62	656	2	0.29	0.206	\N	0.262	\N	0	\N	0.4	0.052	0.066	1.274	\N	0.165	19	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DATES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/dates.webp	t	f	\N	0.006000000000	\N	120.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	21	\N	\N	\N	\N	\N	\N	8041000
30	Pistachio nut	Pistacia	vera	Fruit and nuts	Nuts	1.25	0.4	f	0.4	1.1	0.45	4	f	\N	47	\N	20.27	45.39	562	105	3.92	121	490	1025	1	2.2	1.3	\N	1.2	\N	21	\N	5.6	0.87	0.16	1.3	\N	1.7	51	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PISTACHIO_NUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pistachio_nut.webp	t	f	0.025400000000	0.140000000000	\N	15.880000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	45	\N	1825	\N	\N	1.828800000000	\N	8025100
32	Almond	Prunus	dulcis	Fruit and nuts	Nuts	1.5	0.4	f	0.4	0.9	0.6518	5	f	\N	60	\N	21.15	49.93	579	269	3.71	270	481	733	1	3.12	1.031	\N	2.179	\N	0	\N	0	0.205	1.138	3.618	\N	0.137	44	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALMOND	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/almond.webp	t	f	0.038100000000	0.110000000000	\N	19.280000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	60	\N	1095	\N	ROW_METHOD	0.381000000000	\N	80212
33	Peach	Prunus	persica	Fruit and nuts	Pome fruits and stone fruits	1.5	0.5	f	0.55	0.9	0.6518	3	f	\N	4	\N	0.91	0.25	39	6	0.25	9	20	190	0	0.17	0.068	\N	0.061	\N	16	\N	6.6	0.024	0.031	0.806	\N	0.025	4	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEACH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/peach.webp	t	f	\N	\N	\N	110.120000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	98	\N	730	\N	\N	\N	\N	80930
34	Pear	Pyrus	communis	Fruit and nuts	Pome fruits and stone fruits	1.5	0.5	f	0.6	0.95	0.7518	4	f	\N	10	\N	0.36	0.14	57	9	0.18	7	12	116	1	0.1	0.082	\N	0.048	\N	1	\N	4.3	0.012	0.026	0.161	\N	0.029	7	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEAR	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pear.webp	t	f	\N	0.024000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	80830
35	Grapes	Vitis	vinifera	Fruit and nuts	Grapes	1.5	0.35	f	0.3	0.85	0.45	2	f	\N	42	\N	0.63	0.35	67	14	0.29	5	10	191	2	0.04	0.04	\N	0.718	\N	5	\N	4	0.092	0.057	0.3	\N	0.11	4	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPES_	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grapes_.webp	t	f	\N	1.000000000000	\N	11.340000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	1095	\N	ROW_METHOD	2.438400000000	\N	8061010
342	Rhea, Ramie	Boehmeria	nivea	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RHEA_RAMIE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rhea.webp	t	f	\N	0.100000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	53089010
36	Chickpea (gram pea)	Cicer	arietinum	Leguminous crops	Leguminous crops	0.8	0.5	f	0.4	1	0.35	0.4	f	\N	0	\N	20.47	6.04	378	57	4.31	79	252	718	24	2.76	0.656	\N	21.306	\N	3	\N	4	0.477	0.212	1.541	\N	0.535	557	0	\N	f	\N	f	f	50	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICKPEA_GRAM_PEA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chickpea_gram_pea.webp	t	f	0.006300000000	0.050000000000	0.000500000000	\N	ANNUAL	SEED	f	14	\N	90	\N	\N	0.150000000000	\N	71320
37	Lentil	Lens	culinaris	Leguminous crops	Lentils	0.7	0.5	f	0.4	1.1	0.3	0.5	f	\N	0	\N	24.63	1.06	352	35	6.51	47	281	677	6	3.27	0.754	\N	1.393	\N	2	\N	4.5	0.873	0.211	2.605	\N	0.54	479	0	\N	f	\N	f	f	40	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LENTIL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lentil.webp	t	t	0.025400000000	0.173000000000	0.000050000000	0.230000000000	ANNUAL	SEED	f	10	\N	70	\N	\N	0.025400000000	\N	7134000
38	Groundnut (peanut)	Arachis	hypogaea	Oilseed crops and oleaginous fruits	Oilseed crops and oleaginous fruits	0.75	0.5	f	0.4	1.15	0.6	0.4	f	\N	0	\N	25.8	49.24	567	92	4.58	168	376	705	18	3.27	1.144	\N	1.934	\N	0	\N	0	0.64	0.135	12.066	\N	0.348	240	0	\N	f	\N	f	f	80	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GROUNDNUT_PEANUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/groundnut_peanut.webp	t	f	\N	0.170000000000	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	1202
142	Alfalfa for fodder	Medicago	sativa	Other crops	Grasses and other fodder crops	2	0.55	t	0.6	0.85	0.85	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	200	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALFALFA_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/alfalfa_for_fodder.webp	t	t	0.019000000000	4.000000000000	0.000010000000	\N	PERENNIAL	SEED	f	3	\N	60	\N	ROW_METHOD	0.600000000000	\N	12149090
39	Safflower	Carthamus	tinctorius	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	1.5	0.6	f	0.35	1.15	0.25	0.8	f	\N	49	\N	16.18	38.45	517	78	4.9	353	644	687	3	5.05	1.747	\N	2.014	\N	3	\N	0	1.163	0.415	2.284	\N	1.17	160	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SAFFLOWER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/safflower.webp	t	t	\N	0.080000000000	0.000030000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	151219
40	Soybean	Glycine	max	Oilseed crops and oleaginous fruits	Oilseed crops and oleaginous fruits	0.95	0.5	f	0.4	1.15	0.5	0.7	f	\N	0	\N	36.49	19.94	446	277	15.7	280	704	1797	2	4.89	1.658	\N	2.517	\N	1	\N	6	0.874	0.87	1.623	\N	0.377	375	0	\N	f	\N	f	f	80	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOYBEAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/soybean.webp	t	t	0.035000000000	0.270000000000	0.000130000000	0.090000000000	ANNUAL	SEED	f	8	\N	50	\N	\N	0.075000000000	0.005604000000	120190
41	Sunflower (girasol)	Helianthus	annuus	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	1.5	0.6	f	0.35	1.15	0.25	0.8	f	\N	46	\N	20.78	51.46	584	78	5.25	325	660	645	9	5	1.8	\N	1.95	\N	3	\N	1.4	1.48	0.355	8.335	\N	1.345	227	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUNFLOWER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sunflower-girasol.webp	t	t	0.007500000000	0.180000000000	0.000070000000	\N	ANNUAL	SEED	f	10	\N	\N	\N	\N	0.650000000000	0.001121000000	120600
42	Olive	Olea	europaea	Oilseed crops and oleaginous fruits	Permanent oilseed crops	1.45	0.65	f	0.65	0.7	0.7	4	f	\N	0	\N	0.84	10.68	115	88	3.3	4	3	8	735	0.22	0.251	\N	0.02	\N	20	\N	0.9	0.003	0	0.037	\N	0.009	0	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/olive.webp	t	f	\N	0.795000000000	\N	50.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	180	\N	\N	\N	\N	70992
43	Sesame	Sesamum	indicum	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	1.25	0.6	f	0.35	1.1	0.25	1	f	\N	0	\N	20.45	61.21	631	60	6.36	345	667	370	47	6.73	1.4	\N	1.44	\N	3	\N	0	0.699	0.09	5.8	\N	0.4	115	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SESAME	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sesame.webp	t	t	0.025400000000	0.140000000000	\N	\N	ANNUAL	SEED	t	\N	\N	90	\N	\N	0.150000000000	0.000336000000	33049910
44	Sisal	Agave	sisalana	Other crops	Fibre crops	0.75	0.8	f	0.35	0.6	0.6	1.5	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SISAL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sisal.webp	t	f	\N	0.250000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	100790
45	Cotton (all varieties)	Gossypium	spp.	Other crops	Fibre crops	1.35	0.65	f	0.35	1.15	0.6	1.3	f	\N	0	\N	32.59	36.29	506	100	5.4	440	800	1350	25	6	1.2	\N	2.181	\N	22	\N	9	0.75	0.255	3	\N	0.782	233	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COTTON_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cotton_all_varieties.webp	t	f	\N	0.157000000000	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	520100
46	Rubber	Hevea	brasiliensis	Other crops	Rubber	1.25	0.4	f	0.95	1	1	10	f	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RUBBER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rubber.webp	t	f	\N	0.250000000000	\N	8.620000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	4001
47	Flax for fibre	Linum	usitatissimum	Other crops	Fibre crops	1.25	0.5	f	0.35	1.1	0.25	1.2	f	\N	0	\N	18.29	42.16	534	255	5.73	392	642	813	30	4.34	1.22	\N	2.482	\N	0	\N	0.6	1.644	0.161	3.08	\N	0.473	87	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FLAX_	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/flax_for_fibre.webp	t	f	0.027500000000	0.070000000000	0.000010000000	\N	ANNUAL	SEED	f	\N	\N	90	\N	\N	\N	\N	5306
48	Sweet potato	Ipomoea	batatas	High starch root/tuber crops	High starch root/tuber crops	0.5	0.35	f	0.5	1.15	0.754	0.6	f	\N	28	\N	1.57	0.05	86	30	0.61	25	47	337	55	0.3	0.151	\N	0.258	\N	709	\N	2.4	0.078	0.061	0.557	\N	0.209	11	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SWEET_POTATO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sweet_potato.webp	t	f	0.088900000000	1.221000000000	\N	1.360000000000	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	90	\N	BED_METHOD	0.355600000000	\N	7142000
49	Cassava	Manihot	esculenta	Potatoes and yams	High starch root/tuber crops	0.75	0.38	f	0.3	0.803	0.3	1	f	\N	16	\N	1.36	0.28	160	16	0.27	21	27	271	14	0.34	0.1	\N	0.384	\N	1	\N	20.6	0.087	0.048	0.854	\N	0.088	27	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_MANIOC	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cassava.webp	t	f	\N	2.250000000000	\N	2.250000000000	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	180	\N	\N	\N	\N	190300
50	Potato	Solamum	tuberosum	High starch root/tuber crops	High starch root/tuber crops	0.5	0.35	f	0.5	1.15	0.754	0.6	f	\N	25	\N	2.14	0.08	79	13	0.86	23	55	417	5	0.29	0.103	\N	0.157	\N	0	\N	5.7	0.082	0.033	1.035	\N	0.345	14	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/potato.webp	t	f	0.080000000000	1.881000000000	\N	0.160000000000	ANNUAL	SEEDLING_OR_PLANTING_STOCK	f	12	\N	70	\N	ROW_METHOD	0.300000000000	\N	70993
51	Sugarcane for sugar or alcohol	Saccharum	officinarum	Sugar crops	Sugar crops	1.6	0.65	f	0.4	1.25	0.75	3	f	\N	0	\N	0	0	399	12	0.37	2	1	29	3	0.03	0.009	\N	0.046	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sugarcane_for_sugar_or_alcohol.webp	t	f	\N	6.500000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	121930
52	Onion, yellow/white	Allium	cepa	Vegetables and melons	Root, bulb or tuberous vegetables	0.45	0.3	f	1.05	1.05	0.75	0.4	f	\N	10	\N	1.1	0.1	40	23	0.21	10	29	146	4	0.17	0.039	\N	0.129	\N	0	\N	7.4	0.046	0.027	0.116	\N	0.12	19	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ONION	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/onion-dry.webp	t	f	0.007500000000	3.037000000000	0.000010000000	0.230000000000	ANNUAL	SEED	t	10	63	90	\N	\N	0.080000000000	\N	7122000
53	Garlic, dry	Allium	sativum	Vegetables and melons	Root, bulb or tuberous vegetables	0.4	0.3	f	0.7	1	0.7	0.3	f	\N	13	\N	6.36	0.5	149	181	1.7	25	153	401	17	1.16	0.299	\N	1.672	\N	0	\N	31.2	0.2	0.11	0.7	\N	1.235	3	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GARLIC	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/garlic.webp	t	f	0.035000000000	\N	\N	0.250000000000	ANNUAL	SEEDLING_OR_PLANTING_STOCK	f	28	\N	180	\N	ROW_METHOD	0.125000000000	\N	7032000
54	Celery	Apium	graveolens	Vegetables and melons	Leafy or stem vegetables	0.4	0.2	f	0.7	1.05	1	0.6	f	\N	11	\N	0.69	0.17	16	40	0.2	11	24	260	80	0.13	0.035	\N	0.103	\N	22	\N	3.1	0.021	0.057	0.32	\N	0.074	36	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CELERY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/celery.webp	t	f	0.006300000000	\N	0.000010000000	0.680000000000	ANNUAL	SEED	t	16	77	85	\N	ROW_METHOD	0.300000000000	\N	70940
55	Celeriac	Apium	graveolens var. rapaceum	Vegetables and melons	Root, bulb or tuberous vegetables	0.4	0.2	f	0.7	1.05	1	0.6	f	\N	14	\N	1.5	0.3	42	43	0.7	20	115	300	100	0.33	0.07	\N	0.158	\N	0	\N	8	0.05	0.06	0.7	\N	0.165	8	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CELERIAC	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/celeriac.webp	t	f	0.006300000000	\N	0.000010000000	0.680000000000	ANNUAL	SEED	t	16	77	100	\N	\N	0.300000000000	\N	7069010
56	Asparagus	Asparagus	officinalis	Vegetables and melons	Leafy or stem vegetables	1.5	0.45	f	0.5	0.957	0.3	0.5	f	\N	47	\N	2.2	0.12	20	24	2.14	14	52	202	2	0.54	0.189	\N	0.158	\N	38	\N	5.6	0.143	0.141	0.978	\N	0.091	52	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ASPARAGUS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/asparagus.webp	t	f	0.010000000000	0.325000000000	0.000040000000	0.570000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	50	1095	\N	BED_METHOD	0.500000000000	0.000350000000	70920
57	Cabbage, Chinese	Brassica	pekinensis	Vegetables and melons	Leafy or stem vegetables	0.65	0.45	f	0.7	1.05	0.95	0.4	f	\N	12	\N	1.5	0.2	13	105	0.8	19	37	252	65	0.19	0.021	\N	0.159	\N	223	\N	45	0.04	0.07	0.5	\N	0.194	66	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CABBAGE_CHINESE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cabbage_chinese.webp	t	f	0.006300000000	\N	0.000010000000	3.180000000000	ANNUAL	SEED	t	6	42	\N	\N	ROW_METHOD	0.254000000000	\N	704
58	Broccoli	Brassica	oleracea	Vegetables and melons	Leafy or stem vegetables	0.5	0.45	f	0.7	1.05	0.95	0.3	f	\N	39	\N	2.82	0.37	34	47	0.73	21	66	316	33	0.41	0.049	\N	0.21	\N	31	\N	89.2	0.071	0.117	0.639	\N	0.175	63	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROCCOLI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/broccoli.webp	t	f	0.006300000000	2.050000000000	0.000010000000	1.130000000000	ANNUAL	SEED	t	8	42	\N	\N	ROW_METHOD	0.525000000000	\N	7041000
59	Cauliflower	Brassica	oleracea var. botrytis	Vegetables and melons	Leafy or stem vegetables	0.55	0.45	f	0.7	1.05	0.95	0.4	f	\N	61	\N	1.92	0.28	25	22	0.42	15	44	299	30	0.27	0.039	\N	0.155	\N	0	\N	48.2	0.05	0.06	0.507	\N	0.184	57	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CAULIFLOWER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cauliflower.webp	t	f	0.006300000000	2.026000000000	0.000010000000	0.680000000000	ANNUAL	SEED	t	7	42	\N	\N	ROW_METHOD	0.525000000000	\N	7041000
60	Cabbage (red, white, Savoy)	Brassica	oleracea var. capitata	Vegetables and melons	Leafy or stem vegetables	0.65	0.45	f	0.7	1.05	0.95	0.4	f	\N	12	\N	1.5	0.2	13	105	0.8	19	37	252	65	0.19	0.021	\N	0.159	\N	223	\N	45	0.04	0.07	0.5	\N	0.194	66	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CABBAGE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cabbage.webp	t	f	0.006300000000	3.050000000000	0.000010000000	2.040000000000	ANNUAL	SEED	t	6	42	\N	\N	ROW_METHOD	0.525000000000	\N	704
61	Brussels sprouts	Brassica	oleracea var. gemmifera	Vegetables and melons	Cereals	0.5	0.45	f	0.7	1.05	0.95	0.4	f	\N	10	\N	3.38	0.3	43	42	1.4	23	69	389	25	0.42	0.07	\N	0.337	\N	38	\N	85	0.139	0.09	0.745	\N	0.219	61	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BRUSSELS_SPROUTS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	0.006300000000	1.540000000000	0.000010000000	0.450000000000	ANNUAL	SEED	t	7	\N	\N	\N	ROW_METHOD	0.525000000000	\N	70420
62	Watermelon	Citrullus	lanatus	Vegetables and melons	Fruit-bearing vegetables	1.15	0.4	f	0.4	1	0.75	0.4	f	\N	48	\N	0.61	0.15	30	7	0.24	10	11	112	1	0.1	0.042	\N	0.038	\N	28	\N	8.1	0.033	0.021	0.178	\N	0.045	3	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WATERMELON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/watermelon.webp	t	f	0.020000000000	4.483000000000	0.000080000000	30.620000000000	ANNUAL	SEED	t	7	25	80	\N	ROW_METHOD	1.346200000000	\N	8071100
63	Cantaloupe	Cucumis	melo	Vegetables and melons	Melons	1.2	0.45	f	0.5	0.85	0.6	0.3	f	\N	49	\N	0.84	0.19	34	9	0.21	12	15	267	16	0.18	0.041	\N	0.041	\N	169	\N	36.7	0.041	0.019	0.734	\N	0.072	21	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CANTALOUPE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cantaloupe.webp	t	f	0.010000000000	0.400000000000	0.000020000000	\N	ANNUAL	SEED	t	7	35	\N	\N	\N	0.750000000000	\N	80719
64	Cucumber	Cucumis	sativus	Vegetables and melons	Fruit-bearing vegetables	0.95	0.5	f	0.6	1	0.8	0.3	f	\N	3	\N	0.65	0.11	15	16	0.28	13	24	147	2	0.2	0.041	\N	0.079	\N	5	\N	2.8	0.027	0.033	0.098	\N	0.04	7	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUCUMBER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cucumber.webp	t	f	0.020000000000	1.220000000000	0.000030000000	\N	ANNUAL	SEED	t	5	25	\N	\N	ROW_METHOD	0.230000000000	\N	70700
65	Squash	Cucurbita	spp.	Vegetables and melons	Fruit-bearing vegetables	1.25	0.35	f	0.6	1	0.8	0.4	f	\N	5	\N	1.21	0.18	16	15	0.35	17	38	262	2	0.29	0.051	\N	0.175	\N	10	\N	17	0.048	0.142	0.487	\N	0.218	29	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SQUASH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/squash.webp	t	f	0.020000000000	1.538000000000	0.000090000000	7.140000000000	ANNUAL	SEED	t	7	25	75	\N	ROW_METHOD	0.700000000000	\N	70993
66	Artichoke	Cynara	cardunculus var. scolymus	Vegetables and melons	Leafy or stem vegetables	0.75	0.45	f	0.5	1	0.95	0.7	f	\N	60	\N	3.27	0.15	47	44	1.28	60	90	370	94	0.49	0.231	\N	0.256	\N	1	\N	11.7	0.072	0.066	1.046	\N	0.116	68	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ARTICHOKE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/artichoke.webp	t	f	0.006300000000	1.758000000000	0.000040000000	1.450000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	10	56	125	\N	\N	1.050000000000	\N	70991
67	Carrot, edible	Daucus	carota ssp. sativa	Vegetables and melons	Root, bulb or tuberous vegetables	0.75	0.35	f	0.7	1.05	0.95	0.3	f	\N	11	\N	0.93	0.24	41	33	0.3	12	35	320	69	0.24	0.045	\N	0.143	\N	835	\N	5.9	0.066	0.058	0.983	\N	0.138	19	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CARROT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carrot.webp	t	f	0.006300000000	3.174000000000	0.000010000000	\N	ANNUAL	SEED	f	14	\N	\N	\N	ROW_METHOD	0.070000000000	\N	7061010
68	Jerusalem artichoke	Helianthus	tuberosus	Vegetables and melons	Leafy or stem vegetables	0.75	0.45	f	0.5	1	0.95	0.7	f	\N	31	\N	2	0.01	73	14	3.4	17	78	429	4	0.12	0.14	\N	0.06	\N	1	\N	4	0.2	0.06	1.3	\N	0.077	13	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JERUSALEM_ARTICHOKE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/jerusalem_artichoke.webp	t	f	\N	3.363000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	f	10	\N	\N	\N	\N	\N	\N	7149090
69	Lettuce	Lactuca	sativa var. capitata	Vegetables and melons	Leafy or stem vegetables	0.4	0.3	f	0.7	1	0.95	0.3	f	\N	26	\N	1.35	0.22	13	35	1.24	13	33	238	5	0.2	0.016	\N	0.179	\N	166	\N	3.7	0.057	0.062	0.357	\N	0.082	73	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LETTUCE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lettuce.webp	t	f	0.007500000000	1.782000000000	0.000010000000	0.180000000000	ANNUAL	SEED	t	5	31	65	\N	ROW_METHOD	0.300000000000	\N	705
70	Tomato	Lycopersicon	esculentum	Vegetables and melons	Fruit-bearing vegetables	1.1	0.4	f	0.6	1.152	0.8	0.6	f	\N	9	\N	0.88	0.2	18	10	0.27	11	24	237	5	0.17	0.059	\N	0.114	\N	42	\N	13.7	0.037	0.019	0.594	\N	0.08	15	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOMATO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tomato.webp	t	f	0.007500000000	3.662000000000	0.000010000000	0.440000000000	ANNUAL	SEED	t	6	49	60	\N	ROW_METHOD	0.750000000000	\N	70200
71	Parsnip	Pastinaca	sativa	Vegetables and melons	Root, bulb or tuberous vegetables	0.75	0.4	f	0.5	1.05	0.95	0.4	f	\N	15	\N	1.2	0.3	75	36	0.59	29	71	375	10	0.59	0.12	\N	0.56	\N	0	\N	17	0.09	0.05	0.7	\N	0.09	67	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PARSNIP	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/parsnip.webp	t	f	0.007500000000	2.612000000000	0.000010000000	0.160000000000	ANNUAL	SEED	f	14	\N	100	\N	\N	0.080000000000	\N	1209918054
72	Radish	Raphanus	sativus	Vegetables and melons	Root, bulb or tuberous vegetables	0.4	0.3	f	0.7	0.9	0.85	0.3	f	\N	9	\N	1.43	0.25	23	19	0.57	13	40	302	22	0.62	0.341	\N	0.138	\N	1	\N	8	0.016	0.028	0.255	\N	0.057	60	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RADISH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/radish.webp	t	t	0.006300000000	1.250000000000	0.000010000000	0.010000000000	ANNUAL	SEED	f	4	\N	22	\N	ROW_METHOD	0.040000000000	\N	70690
73	Spinach	Spinacia	oleracea	Vegetables and melons	Leafy or stem vegetables	0.4	0.2	f	0.7	1	0.95	0.3	f	\N	28	\N	2.86	0.39	23	99	2.71	79	49	558	79	0.53	0.13	\N	0.897	\N	469	\N	28.1	0.078	0.189	0.724	\N	0.195	194	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SPINACH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/spinach.webp	t	f	0.015000000000	1.416000000000	0.000010000000	0.180000000000	ANNUAL	SEED	t	8	35	21	\N	ROW_METHOD	0.150000000000	\N	7103000
94	Breadfruit	Artocarpus	altilis	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	22	\N	1.07	0.23	103	17	0.54	25	30	490	2	0.12	0.084	\N	0.06	\N	0	\N	29	0.11	0.03	0.9	\N	0.1	14	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BREADFRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/breadfruit.webp	t	f	\N	3.300000000000	0.010000000000	300.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	1110	\N	ROW_METHOD	13.000000000000	\N	810902090
74	Chili, dry (all varieties)	Capsicum	spp.	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.6	0.4	t	0.6	1.15	1.1	\N	t	\N	27	\N	1.87	0.44	40	14	1.03	23	43	322	9	0.26	0.129	\N	0.187	\N	48	\N	143.7	0.072	0.086	1.244	\N	0.506	23	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHILI_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chili_dry_all_varieties.webp	t	f	0.007500000000	1.220000000000	0.000010000000	0.450000000000	ANNUAL	SEED	t	10	56	60	\N	\N	0.450000000000	\N	9042211
75	Caraway seeds	Carum	carvi	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.6	0.4	t	0.6	1.15	1.1	\N	t	\N	0	\N	19.77	14.59	333	689	16.23	258	568	1351	17	5.5	0.91	\N	1.3	\N	18	\N	21	0.383	0.379	3.606	\N	0.36	10	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CARAWAY_SEEDS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/caraway_seeds.webp	t	f	0.007500000000	0.001000000000	0.000010000000	0.010000000000	ANNUAL	SEED	f	10	\N	\N	\N	ROW_METHOD	0.200000000000	\N	9096131
76	Cinnamon	Cinnamomum	verum	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	0	\N	3.99	1.24	247	1002	8.32	60	64	431	10	1.83	0.339	\N	17.466	\N	15	\N	3.8	0.022	0.041	1.332	\N	0.158	6	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CINNAMON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	0.018000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	906
77	Cardamom	Elettaria	cardamomum	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	0	\N	10.76	6.7	311	383	13.97	229	178	1119	18	7.47	0.383	\N	28	\N	0	\N	21	0.198	0.182	1.102	\N	0.23	\N	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CARDAMOM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cardamom.webp	t	f	\N	133.700000000000	0.000030000000	2.830000000000	PERENNIAL	SEED	t	20	\N	730	\N	ROW_METHOD	1.500000000000	\N	908
78	Drumstick tree	Moringa	oleifera	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	38	\N	9.4	1.4	64	185	4	147	112	337	9	0.6	0.105	\N	1.063	\N	378	\N	51.7	0.257	0.66	2.22	\N	1.2	40	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DRUMSTICK_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/drumstick_tree.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	12119029
79	Mace	Myristica	fragrans	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	0	\N	6.71	32.38	475	252	13.9	163	110	463	80	2.3	2.467	\N	1.5	\N	40	\N	21	0.312	0.448	1.35	\N	0.16	76	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MACE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mace.webp	t	f	\N	0.049000000000	\N	9.000000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	908
80	Nutmeg	Myristica	fragrans	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	0	\N	5.84	36.31	525	184	3.04	183	213	350	16	2.15	1.027	\N	2.9	\N	5	\N	3	0.346	0.057	1.299	\N	0.16	76	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NUTMEG	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/nutmeg.webp	t	f	\N	0.049000000000	\N	14.500000000000	PERENNIAL	SEED	t	\N	\N	1460	\N	\N	\N	\N	908
81	Anise seeds	Pimpinella	anisum	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.6	0.4	t	0.6	1.15	1.1	\N	t	\N	0	\N	17.6	15.9	337	646	36.96	170	440	1441	16	5.3	0.91	\N	2.3	\N	16	\N	21	0.34	0.29	3.06	\N	0.65	10	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANISE_SEEDS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/anise_seeds.webp	t	f	0.006300000000	0.056000000000	0.000010000000	\N	ANNUAL	SEED	f	6	\N	130	\N	ROW_METHOD	0.152400000000	\N	909
82	Pepper, black	Piper	nigrum	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	18	\N	1.66	0.45	27	14	0.46	17	32	256	13	0.25	0.094	\N	0.1	\N	17	\N	82.7	0.081	0.054	1.242	\N	0.357	29	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_PEPPER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pepper_black.webp	t	f	0.010000000000	0.500000000000	\N	2.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	30	\N	780	\N	\N	0.076200000000	\N	90411
83	Vanilla	Vanilla	planifolia	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	0	\N	0.06	0.06	288	11	0.12	12	6	148	9	0.11	0.072	\N	0.23	\N	0	\N	0	0.011	0.095	0.425	\N	0.026	0	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VANILLA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/vanilla.webp	t	f	\N	0.325000000000	\N	2.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	730	\N	\N	2.000000000000	\N	90500
84	Ginger	Zingiber	officinale	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.99	0.4	t	0.75	1.04	0.99	\N	t	\N	0	\N	8.98	4.24	335	114	19.8	214	168	1320	27	3.64	0.48	\N	33.3	\N	2	\N	0.7	0.046	0.17	9.62	\N	0.626	13	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GINGER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/ginger.webp	t	f	\N	1.793000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	120	\N	ROW_METHOD	0.177800000000	\N	91010
85	Quinoa	Chenopodium	quinoa	Cereals	Cereals	1.3033333	0.5072	t	0.44333333	1.0733334	0.43333334	\N	t	\N	0	\N	14.12	6.07	368	47	4.57	197	457	563	5	3.1	0.59	\N	2.033	\N	1	\N	\N	0.36	0.318	1.52	\N	0.487	184	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	QUINOA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/quinoa.webp	t	f	0.006300000000	0.129000000000	0.000010000000	0.050000000000	ANNUAL	SEED	f	4	\N	90	\N	\N	0.300000000000	\N	10085000
86	Tef	Eragrostis	abyssinica	Cereals	Cereals	1.3033333	0.5072	t	0.44333333	1.0733334	0.43333334	\N	t	\N	0	\N	13.3	2.38	367	180	7.63	184	429	427	12	3.63	0.81	\N	9.24	\N	0	\N	\N	0.39	0.27	3.363	\N	0.482	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TEF	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	t	\N	0.175000000000	\N	\N	ANNUAL	SEED	f	3	\N	60	\N	\N	\N	0.000784000000	10089000
87	Buckwheat	Fagopyrum	esculentum	Cereals	Cereals	1.3033333	0.5072	t	0.44333333	1.0733334	0.43333334	1	t	\N	0	\N	13.25	3.4	343	18	2.2	231	347	460	1	2.4	1.1	\N	1.3	\N	0	\N	0	0.101	0.425	7.02	\N	0.21	30	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BUCKWHEAT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/buckwheat.webp	t	t	0.030000000000	0.153000000000	0.000020000000	\N	ANNUAL	SEED	f	3	\N	21	\N	\N	\N	0.005604000000	10081000
88	Durum wheat	Triticum	durum	Cereals	Cereals	1.3033333	0.5072	t	0.44333333	1.0733334	0.43333334	1	t	\N	0	\N	13.68	2.47	339	34	3.52	144	508	431	2	4.16	0.553	\N	3.012	\N	0	\N	0	0.419	0.121	6.738	\N	0.419	43	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DURUM_WHEAT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/durum_wheat.webp	t	f	\N	0.282000000000	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	100119
89	Maize for cereals	Zea	mays	Cereals	Cereals	1.3033333	0.5072	t	0.44333333	1.0733334	0.43333334	\N	t	\N	0	\N	9.42	4.74	365	7	2.71	127	210	287	35	2.21	0.314	\N	0.485	\N	11	\N	0	0.385	0.201	3.627	\N	0.622	19	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_GRAIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maize_for_cereals.webp	t	t	0.035000000000	0.990000000000	\N	\N	ANNUAL	SEED	f	7	\N	\N	\N	\N	0.075000000000	\N	110313
90	Maize (corn)	Zea	mays	Cereals	Cereals	1.3033333	0.5072	t	0.44333333	1.0733334	0.43333334	\N	t	\N	64	\N	3.27	1.35	86	2	0.52	37	89	270	15	0.46	0.054	\N	0.163	\N	9	\N	6.8	0.155	0.055	1.77	\N	0.093	42	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_SWEET_CORN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maize_corn.webp	t	t	0.035000000000	0.990000000000	\N	\N	ANNUAL	SEED	f	7	\N	50	\N	\N	0.075000000000	\N	100590
91	Sapodilla	Manilkara	sapota	Fruit and nuts	Other fruits	1.171875	0.45	t	0.509375	0.865625	0.6536875	\N	t	\N	20	\N	0.44	1.1	83	21	0.8	12	12	193	12	0.1	0.086	\N	\N	\N	3	\N	14.7	0	0.02	0.2	\N	0.037	14	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SAPODILLA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sapodilla.webp	t	f	\N	\N	\N	147.420000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8052100
92	Cashew nuts	Anacardium	occidentale	Fruit and nuts	Nuts	1.6	0.43333334	t	0.43333334	1.0333333	0.58453333	\N	t	\N	28	\N	18.22	43.85	553	37	6.68	292	593	660	12	5.78	2.195	\N	1.655	\N	0	\N	0.5	0.423	0.058	1.062	\N	0.417	25	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASHEW_NUTS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cashew_nuts.webp	t	f	\N	0.068000000000	\N	9.070000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8013
93	Custard apple	Annona	reticulata	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	42	\N	1.7	0.6	101	30	0.71	18	21	382	4	\N	\N	\N	\N	\N	2	\N	19.2	0.08	0.1	0.5	\N	0.221	\N	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUSTARD_APPLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/custard_apple.webp	t	f	\N	\N	\N	39.690000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	8109040
95	Brazil nut	Bertholletia	excelsa	Fruit and nuts	Nuts	1.6	0.43333334	t	0.43333334	1.0333333	0.58453333	\N	t	\N	49	\N	14.32	67.1	659	160	2.43	376	725	659	3	4.06	1.743	\N	1.223	\N	0	\N	0.7	0.617	0.035	0.295	\N	0.101	22	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BRAZIL_NUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/brazil_nut.webp	t	f	\N	0.820000000000	0.010000000000	24.000000000000	PERENNIAL	SEED	t	14	\N	2190	\N	\N	\N	\N	8012
96	Papaya (pawpaw)	Carica	papaya	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	38	\N	0.47	0.26	43	20	0.25	21	10	182	8	0.08	0.045	\N	0.04	\N	47	\N	60.9	0.023	0.027	0.357	\N	0.038	37	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PAPAYA_PAWPAW	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/papaya_pawpaw.webp	t	f	\N	3.900000000000	\N	29.000000000000	PERENNIAL	SEED	t	21	\N	180	\N	\N	\N	\N	8072000
97	Pecan nut	Carya	illinoinensis	Fruit and nuts	Nuts	1.6	0.43333334	t	0.43333334	1.0333333	0.58453333	\N	t	\N	47	\N	9.17	71.97	691	70	2.53	121	277	410	0	4.53	1.2	\N	4.5	\N	3	\N	1.1	0.66	0.13	1.167	\N	0.21	22	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PECAN_NUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pecan_nut.webp	t	f	\N	\N	\N	20.410000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	150	\N	\N	\N	\N	8029010
192	Bell pepper	Capsicum	annuum	Fruit and nuts	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BELL_PEPPER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/bell_peppers.webp	t	f	0.007500000000	1.220000000000	\N	\N	ANNUAL	SEED	t	10	56	65	\N	ROW_METHOD	0.450000000000	\N	7096010
98	Chestnut	Castanea	sativa	Fruit and nuts	Nuts	1.6	0.43333334	t	0.43333334	1.0333333	0.58453333	\N	t	\N	20	\N	6.39	4.45	374	67	2.38	74	175	986	37	0.35	0.65	\N	1.3	\N	0	\N	15	0.295	0.36	0.85	\N	0.663	109	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHESTNUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chestnut.webp	t	f	\N	0.370000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	80242
99	Orange (bitter)	Citrus	aurantium	Fruit and nuts	Citrus fruits	1.5	0.35	t	0.3	0.85	0.45	\N	t	\N	27	\N	0.94	0.12	47	40	0.1	10	14	181	0	0.07	0.045	\N	0.025	\N	11	\N	53.2	0.087	0.04	0.282	\N	0.06	30	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ORANGE_BITTER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/orange_bitter.webp	t	f	\N	\N	\N	13.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	1095	\N	\N	\N	\N	8055000
100	Pomelo	Citrus	grandis	Fruit and nuts	Citrus fruits	1.5	0.35	t	0.3	0.85	0.45	\N	t	\N	44	\N	0.76	0.04	38	4	0.11	6	17	216	1	0.08	0.048	\N	0.017	\N	0	\N	61	0.034	0.027	0.22	\N	0.036	\N	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POMELO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pomelo.webp	t	f	\N	2.000000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	3.750000000000	\N	80540
101	Lemon	Citrus	limon	Fruit and nuts	Citrus fruits	1.5	0.35	t	0.3	0.85	0.45	\N	t	\N	47	\N	1.1	0.3	29	26	0.6	8	16	138	2	0.06	0.037	\N	0.03	\N	1	\N	53	0.04	0.02	0.1	\N	0.08	11	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEMON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lemon.webp	t	f	0.012700000000	\N	\N	54.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	28	\N	1825	\N	\N	4.876800000000	\N	8055000
102	Clementine	Citrus	clementina	Fruit and nuts	Citrus fruits	1.5	0.35	t	0.3	0.85	0.45	\N	t	\N	23	\N	0.85	0.15	47	30	0.14	10	21	177	1	0.06	0.043	\N	0.023	\N	\N	\N	48.8	0.086	0.03	0.636	\N	0.075	24	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CLEMENTINE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/clementine.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	805100040
103	Orange	Citrus	sinensis	Fruit and nuts	Citrus fruits	1.5	0.35	t	0.3	0.85	0.45	\N	t	\N	27	\N	0.94	0.12	47	40	0.1	10	14	181	0	0.07	0.045	\N	0.025	\N	11	\N	53.2	0.087	0.04	0.282	\N	0.06	30	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ORANGE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/orange.webp	t	f	\N	16.000000000000	\N	94.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	80510
104	Lime, sour	Citrus	aurantifolia	Fruit and nuts	Citrus fruits	1.5	0.35	t	0.3	0.85	0.45	\N	t	\N	16	\N	0.7	0.2	30	33	0.6	6	18	102	2	0.11	0.065	\N	0.008	\N	2	\N	29.1	0.03	0.02	0.2	\N	0.043	8	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LIME	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lime.webp	t	f	0.012700000000	\N	\N	1.360000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	1095	\N	\N	4.572000000000	\N	8055000
105	Hazelnut (filbert)	Corylus	avellana	Fruit and nuts	Nuts	1.6	0.43333334	t	0.43333334	1.0333333	0.58453333	\N	t	\N	59	\N	14.95	60.75	628	114	4.7	163	290	680	0	2.45	1.725	\N	6.175	\N	1	\N	6.3	0.643	0.113	1.8	\N	0.563	113	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HAZELNUT_FILBERT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/hazelnut_filbert.webp	t	f	\N	0.130000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	80221
106	Quince	Cydonia	oblonga	Fruit and nuts	Pome fruits and stone fruits	1.2375	0.5	t	0.55	0.7625	0.58885	\N	t	\N	39	\N	0.4	0.1	57	11	0.7	8	17	197	4	0.04	0.13	\N	\N	\N	2	\N	15	0.02	0.03	0.2	\N	0.04	3	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	QUINCE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/quince.webp	t	f	\N	2.900000000000	\N	125.000000000000	PERENNIAL	SEED	t	\N	\N	730	\N	\N	\N	\N	8084000
107	Persimmon (kaki)	Diospyros	kaki	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	16	\N	0.58	0.19	70	8	0.15	9	17	161	1	0.11	0.113	\N	0.355	\N	81	\N	7.5	0.03	0.02	0.1	\N	0.1	8	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PERSIMMON_KAKI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/persimmon_kaki.webp	t	\N	\N	\N	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	8107000
109	Fig	Ficus	carica	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	1	\N	0.75	0.3	74	35	0.37	17	14	232	1	0.15	0.07	\N	0.128	\N	7	\N	2	0.06	0.05	0.4	\N	0.113	6	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FIG	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/fig.webp	t	f	\N	1.200000000000	\N	11.340000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	10	\N	1460	\N	\N	5.334000000000	\N	80420
110	Lychee	Litchi	chinensis	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	40	\N	0.83	0.44	66	5	0.31	10	31	171	1	0.07	0.148	\N	0.055	\N	0	\N	71.5	0.011	0.065	0.603	\N	0.1	14	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LITCHI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/litchi.webp	t	f	0.025400000000	1.000000000000	\N	82.780000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	1825	\N	\N	7.620000000000	\N	8109060
111	Macadamia (Queensland nut)	Macadamia	spp	Fruit and nuts	Nuts	1.6	0.43333334	t	0.43333334	1.0333333	0.58453333	\N	t	\N	69	\N	7.91	75.77	718	85	3.69	130	188	368	5	1.3	0.756	\N	4.131	\N	0	\N	1.2	1.195	0.162	2.473	\N	0.275	11	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MACADAMIA_NUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/macadamia.webp	t	f	\N	0.405000000000	\N	11.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	30	\N	180	\N	\N	\N	\N	8026100
112	Mango	Mangifera	indica	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	29	\N	0.82	0.38	60	11	0.16	10	14	168	1	0.09	0.111	\N	0.063	\N	54	\N	36.4	0.028	0.038	0.669	\N	0.119	43	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mango.webp	t	f	\N	2.750000000000	\N	113.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	80450
113	Mulberry for fruit (all varieties)	Morus	spp.	Fruit and nuts	Other fruits	1.171875	0.45	t	0.509375	0.865625	0.6536875	\N	t	\N	0	\N	1.44	0.39	43	39	1.85	18	38	194	10	0.12	0.06	\N	\N	\N	1	\N	36.4	0.029	0.101	0.62	\N	0.05	6	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MULBERRY_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mulberry_for_fruit_all_varieties.webp	t	f	\N	0.900000000000	\N	151.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	9	\N	84	\N	\N	\N	\N	8102090
114	Plum	Prunus	domestica	Fruit and nuts	Pome fruits and stone fruits	1.2375	0.5	t	0.55	0.7625	0.58885	\N	t	\N	6	\N	0.7	0.28	46	6	0.17	7	16	157	0	0.1	0.057	\N	0.052	\N	17	\N	9.5	0.028	0.026	0.417	\N	0.029	5	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PLUM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/plum.webp	t	f	\N	\N	\N	114.530000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	130	\N	\N	4.572000000000	\N	8132000
115	Nectarine	Prunus	persica var. nectarina	Fruit and nuts	Pome fruits and stone fruits	1.2375	0.5	t	0.55	0.7625	0.58885	\N	t	\N	9	\N	1.06	0.32	44	6	0.28	9	26	201	0	0.17	0.086	\N	0.054	\N	17	\N	5.4	0.034	0.027	1.125	\N	0.025	5	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NECTARINE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/nectarine.webp	t	f	\N	2.102000000000	\N	92.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	100	\N	\N	\N	\N	80930
222	Citron	Citrus	medica	Fruit and nuts	Citrus fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/citron.webp	t	f	\N	\N	0.000090000000	66.220000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8055000
116	Cherry (all varieties)	Prunus	spp.	Fruit and nuts	Pome fruits and stone fruits	1.2375	0.5	t	0.55	0.7625	0.58885	\N	t	\N	10	\N	1	0.3	50	16	0.32	9	15	173	3	0.1	0.104	\N	0.112	\N	64	\N	10	0.03	0.04	0.4	\N	0.044	8	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHERRY_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cherry_all_varieties.webp	t	f	0.035000000000	2.200000000000	0.000080000000	17.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	ROW_METHOD	2.600000000000	\N	80920
117	Guava	Psidium	guajava	Fruit and nuts	Tropical and subtropical fruits	0.97	0.5	t	0.62	0.85	0.78	\N	t	\N	22	\N	2.55	0.95	68	18	0.26	22	40	417	2	0.23	0.23	\N	0.15	\N	31	\N	228.3	0.067	0.04	1.084	\N	0.11	49	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GUAVA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/guava.webp	t	f	0.008400000000	2.775000000000	\N	72.680000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	28	\N	1095	\N	\N	0.304800000000	\N	80450
270	Indigo	Indigofera	tinctoria	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	INDIGO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/indigo.webp	t	t	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	121190
118	Pomegranate	Punica	granatum	Fruit and nuts	Other fruits	1.171875	0.45	t	0.509375	0.865625	0.6536875	\N	t	\N	44	\N	1.67	1.17	83	10	0.3	12	36	236	3	0.35	0.158	\N	0.119	\N	0	\N	10.2	0.067	0.053	0.293	\N	0.075	38	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POMEGRANATE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pomegranate.webp	t	f	0.020000000000	\N	\N	40.820000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	30	\N	2190	\N	\N	4.114800000000	\N	8109094
119	Currants (all varieties)	Ribes	spp.	Fruit and nuts	Berries	0.575	0.35	t	0.475	0.875	0.775	\N	t	\N	2	\N	1.4	0.41	63	55	1.54	24	59	322	2	0.27	0.086	\N	0.256	\N	12	\N	181	0.05	0.05	0.3	\N	0.066	\N	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CURRANTS_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/currants_all_varieties.webp	t	f	\N	\N	\N	2.950000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8103000
120	Gooseberry (all varieties)	Ribes	spp.	Fruit and nuts	Berries	0.575	0.35	t	0.475	0.875	0.775	\N	t	\N	0	\N	0.88	0.58	44	25	0.31	10	27	198	1	0.12	0.07	\N	0.144	\N	15	\N	27.7	0.04	0.03	0.3	\N	0.08	6	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GOOSEBERRY_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/gooseberry_all_varieties.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	60	\N	\N	\N	\N	8103000
121	Blackberries	Rubus	spp.	Fruit and nuts	Berries	0.575	0.35	f	0.475	0.875	0.775	\N	t	\N	4	\N	1.39	0.49	43	29	0.62	20	22	162	1	0.53	0.165	\N	0.646	\N	11	\N	21	0.02	0.026	0.646	\N	0.03	25	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACKBERRIES_	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blackberries.webp	t	f	\N	0.800000000000	\N	53.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	60	\N	BED_METHOD	1.066800000000	\N	8102090
122	Raspberry (all varieties)	Rubus	spp.	Fruit and nuts	Berries	0.575	0.35	t	0.475	0.875	0.775	\N	t	\N	4	\N	1.2	0.65	52	25	0.69	22	29	151	1	0.42	0.09	\N	0.67	\N	2	\N	26.2	0.032	0.038	0.598	\N	0.055	21	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RASPBERRY_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/raspberry_all_varieties.webp	t	f	\N	0.056000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	730	\N	BED_METHOD	0.812800000000	\N	8102010
123	Blueberry	Vaccinium	spp.	Fruit and nuts	Berries	0.575	0.35	t	0.475	0.875	0.775	\N	t	\N	5	\N	0.74	0.33	57	6	0.28	6	12	77	1	0.16	0.057	\N	0.336	\N	3	\N	9.7	0.037	0.041	0.418	\N	0.052	6	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLUEBERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp	t	f	0.025400000000	0.670000000000	\N	2.220000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	30	\N	1095	\N	BED_METHOD	0.600000000000	\N	8104000
124	Cranberry	Vaccinium	spp.	Fruit and nuts	Berries	0.575	0.35	t	0.475	0.875	0.775	\N	t	\N	2	\N	0.39	0.13	46	8	0.25	6	13	85	2	0.1	0.061	\N	0.36	\N	3	\N	13.3	0.012	0.02	0.101	\N	0.057	1	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CRANBERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cranberry.webp	t	f	\N	2.225000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8104000
125	Pigeon pea (guandu)	Cajanus	cajan	Leguminous crops	Leguminous crops	0.75	0.5	t	0.4	1.05	0.325	\N	t	\N	0	\N	21.7	1.49	343	130	5.23	183	367	1392	17	2.76	1.057	\N	1.791	\N	1	\N	0	0.643	0.187	2.965	\N	0.283	456	0	\N	f	\N	f	f	60	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PIGEON_PEA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pigeon_pea.webp	t	f	\N	0.085000000000	\N	\N	ANNUAL	SEED	t	\N	\N	150	\N	\N	\N	\N	71360
126	Pea, edible dry, for grain	Pisum	sativum	Leguminous crops	Leguminous crops	0.75	0.5	t	0.4	1.05	0.325	\N	t	\N	0	\N	23.82	1.16	352	37	4.82	49	321	823	15	3.55	0.815	\N	1.22	\N	7	\N	1.8	0.726	0.215	2.889	\N	0.174	274	0	\N	f	\N	f	f	60	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pea.webp	t	t	0.040000000000	0.659000000000	0.000220000000	0.090000000000	ANNUAL	SEED	f	7	25	60	\N	ROW_METHOD	0.050000000000	\N	7131000
127	Fenugreek	Trigonella	foenum-graecum	Stimulant, spice and aromatic crops	Spice and aromatic crops	0.75	0.5	t	0.4	1.05	0.325	\N	t	\N	0	\N	23	6.41	323	176	33.53	191	296	770	67	2.5	1.11	\N	1.228	\N	3	\N	3	0.322	0.366	1.64	\N	0.6	57	0	\N	f	\N	f	f	40	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FENUGREEK	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/fenugreek.webp	t	f	0.006300000000	0.155000000000	0.000010000000	\N	ANNUAL	SEED	f	7	\N	30	\N	\N	0.100000000000	\N	7099990
128	Broad bean, dry	Vicia	faba	Leguminous crops	Leguminous crops	0.75	0.5	t	0.4	1.05	0.325	\N	t	\N	0	\N	23.58	0.83	333	143	8.2	140	407	1406	24	2.79	0.958	\N	1.021	\N	0	\N	4.5	0.529	0.219	2.06	\N	0.397	394	0	\N	f	\N	f	f	100	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROAD_BEAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/broad_bean.webp	t	f	0.035000000000	\N	0.001000000000	0.140000000000	ANNUAL	SEED	f	10	\N	\N	\N	\N	0.125000000000	\N	7135000
129	Beans, dry, edible, for grains	Phaseolus	vulgaris	Leguminous crops	Leguminous crops	0.75	0.5	t	0.4	1.05	0.325	\N	t	\N	0	\N	23.58	0.83	333	143	8.2	140	407	1406	24	2.79	0.958	\N	1.021	\N	0	\N	4.5	0.529	0.219	2.06	\N	0.397	394	0	\N	f	\N	f	f	40	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEANS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beans-dry_for_grains.webp	t	f	0.035000000000	0.086000000000	0.000250000000	\N	ANNUAL	SEED	f	6	\N	\N	\N	ROW_METHOD	0.084000000000	\N	71339
131	Rapeseed (colza)	Brassica	napus	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	1.19	0.56	t	0.37	1.14	0.37	\N	t	\N	0	\N	0	100	884	0	0	0	0	0	0	0	0	\N	0	\N	0	\N	0	0	0	0	\N	0	0	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RAPESEED_COLZA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rapeseed_colza.webp	t	t	\N	0.210000000000	0.000010000000	\N	ANNUAL	SEED	f	4	\N	74	\N	\N	\N	0.000672000000	1514
133	Coconut	Cocos	nucifera	Oilseed crops and oleaginous fruits	Permanent oilseed crops	1.45	0.65	t	0.65	0.7	0.7	\N	t	\N	48	\N	3.33	33.49	354	14	2.43	32	113	356	20	1.1	0.435	\N	1.5	\N	0	\N	3.3	0.066	0.02	0.54	\N	0.054	26	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COCONUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/coconut.webp	t	f	\N	0.475000000000	\N	18.750000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	8011
136	Poppy seed	Papaver	somniferum	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	1.19	0.56	t	0.37	1.14	0.37	\N	t	\N	0	\N	17.99	41.56	525	1438	9.76	347	870	719	26	7.9	1.627	\N	6.707	\N	0	\N	1	0.854	0.1	0.896	\N	0.247	82	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POPPY_SEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/poppy_seed.webp	t	f	\N	0.174000000000	\N	\N	ANNUAL	SEED	f	20	\N	80	\N	\N	0.150000000000	0.000500000000	120791
137	Mustard	Sinapis	alba	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	1.19	0.56	t	0.37	1.14	0.37	\N	t	\N	7	\N	2.86	0.42	27	115	1.64	32	58	384	20	0.25	0.165	\N	\N	\N	151	\N	70	0.08	0.11	0.8	\N	0.18	12	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MUSTARD	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mustard.webp	t	\N	\N	\N	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	9109927
138	Hemp fibre	Cannabis	sativa	Other crops	Fibre crops	1.1166667	0.65	t	0.35	0.95	0.48333332	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HEMP_	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/hemp_fibre.webp	t	f	\N	1.797000000000	\N	0.600000000000	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	5302
139	Jute	Corchorus	spp.	Other crops	Fibre crops	1.1166667	0.65	t	0.35	0.95	0.48333332	\N	t	\N	38	\N	4.65	0.25	34	208	4.76	64	83	559	8	0.79	0.255	\N	0.123	\N	278	\N	37	0.133	0.546	1.26	\N	0.6	123	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JUTE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/jicama.webp	t	f	\N	4.750000000000	\N	\N	ANNUAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	5303
140	Lemon grass	Cymbopogon	citratus	Other crops	Fibre crops	1.1166667	0.65	t	0.35	0.95	0.48333332	\N	t	\N	35	\N	1.82	0.49	99	65	8.17	60	101	723	6	2.23	0.266	\N	5.224	\N	0	\N	2.6	0.065	0.135	1.101	\N	0.08	75	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEMON_GRASS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lemon_balm.webp	t	f	0.006300000000	\N	\N	1.250000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	5	\N	120	\N	\N	0.711200000000	\N	8055000
141	Ryegrass	Lolium	spp.	Other crops	Grasses and other fodder crops	1.32	0.58	t	0.52	0.94	0.66	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RYEGRASS_	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/ryegrass_seed.webp	t	t	0.030000000000	0.101000000000	0.000010000000	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	\N	0.002017000000	12092500
191	Beet, table/red	Beta	vulgaris	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEET_TABLE_RED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beet_red.webp	t	f	0.010000000000	4.760000000000	0.000020000000	\N	ANNUAL	SEED	f	6	35	50	\N	ROW_METHOD	0.075000000000	\N	7069030
144	Clover for fodder (all varieties)	Trifolium	spp.	Other crops	Grasses and other fodder crops	2	0.55	t	0.6	0.85	0.85	\N	t	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	\N	f	f	150	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CLOVER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/clover_for_fodder.webp	t	t	0.006300000000	0.034000000000	0.000010000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	0.000900000000	12149090
145	Dasheen	Colocasia	esculenta	Potatoes and yams	High starch root/tuber crops	0.5833333	0.36	t	0.43333334	1.0343333	0.6026667	\N	t	\N	14	\N	1.5	0.2	112	43	0.55	33	84	591	11	0.23	0.172	\N	0.383	\N	4	\N	4.5	0.095	0.025	0.6	\N	0.283	22	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DASHEEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/dasheen.webp	t	f	\N	\N	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	7144000
146	Yam	Dioscorea	spp.	High starch root/tuber crops	High starch root/tuber crops	0.5833333	0.36	t	0.43333334	1.0343333	0.6026667	\N	t	\N	14	\N	1.53	0.17	118	17	0.54	21	55	816	9	0.24	0.178	\N	0.397	\N	7	\N	17.1	0.112	0.032	0.552	\N	0.293	23	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	YAM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/yam.webp	t	f	0.038100000000	0.002000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	21	\N	220	\N	\N	1.219200000000	\N	71430
147	Arrowroot	Maranta	arundinacea	High starch root/tuber crops	High starch root/tuber crops	0.5833333	0.36	t	0.43333334	1.0343333	0.6026667	\N	t	\N	15	\N	4.24	0.2	65	6	2.22	25	98	454	26	0.63	0.121	\N	0.174	\N	1	\N	1.9	0.143	0.059	1.693	\N	0.266	338	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ARROWROOT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	0.127000000000	0.845000000000	\N	2.040000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	300	\N	\N	0.342900000000	\N	714
148	Beet, fodder (mangel)	Beta	vulgaris	Other crops	Grasses and other fodder crops	0.8	0.5	t	0.4	1.25	0.75	\N	t	\N	33	\N	1.61	0.17	43	16	0.8	23	40	325	78	0.35	0.075	\N	0.329	\N	2	\N	4.9	0.031	0.04	0.334	\N	0.067	109	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEET	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beet_fodder_(mangel).webp	t	f	0.010000000000	4.760000000000	0.000020000000	\N	ANNUAL	SEED	f	6	\N	50	\N	ROW_METHOD	0.075000000000	\N	12092960
149	Okra	Abelmoschus	esculentus	Vegetables and melons	Fruit-bearing vegetables	1.13	0.42	t	0.54	1.0004	0.75	\N	t	\N	14	\N	1.93	0.19	33	82	0.62	57	61	299	7	0.58	0.109	\N	0.788	\N	36	\N	23	0.2	0.06	1	\N	0.215	60	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OKRA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/okra.webp	t	f	0.010000000000	1.514000000000	0.000050000000	0.180000000000	ANNUAL	SEED	t	2	35	60	\N	\N	0.406400000000	\N	709999020
150	Mushrooms	Agaricus	spp.	Vegetables and melons	Mushrooms and truffles	0.7204546	0.375	t	0.6431818	1.0163182	0.8545455	\N	t	\N	3	\N	3.09	0.34	22	3	0.5	9	86	318	5	0.52	0.318	\N	0.047	\N	0	\N	2.1	0.081	0.402	3.607	\N	0.104	17	0.04	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MUSHROOMS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mushrooms.webp	t	f	\N	\N	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	3	\N	28	\N	\N	\N	\N	70951
151	Leek	Allium	ampeloprasum	Vegetables and melons	Root, bulb or tuberous vegetables	0.525	0.30833334	t	0.725	1.0166667	0.8666667	\N	t	\N	56	\N	1.5	0.3	61	59	2.1	28	35	180	20	0.12	0.12	\N	0.481	\N	83	\N	12	0.06	0.03	0.4	\N	0.233	64	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEEK	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/leek.webp	t	f	0.006300000000	4.645000000000	0.000010000000	0.570000000000	ANNUAL	SEED	t	8	63	120	\N	\N	0.175000000000	\N	7039000
152	Rutabaga (swede)	Brassica	napus var. napobrassica	Vegetables and melons	Root, bulb or tuberous vegetables	0.525	0.30833334	t	0.725	1.0166667	0.8666667	\N	t	\N	15	\N	1.08	0.16	37	43	0.44	20	53	305	12	0.24	0.032	\N	0.131	\N	0	\N	25	0.09	0.04	0.7	\N	0.1	21	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RUTABAGA_SWEDE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rutabaga_swede.webp	t	f	0.007500000000	1.345000000000	\N	1.810000000000	ANNUAL	SEED	f	6	\N	80	\N	ROW_METHOD	0.140000000000	0.010115000000	12149
153	Kale	Brassica	oleracea var. acephala	Vegetables and melons	Leafy or stem vegetables	0.76	0.39333335	t	0.68333334	1.0204667	0.91333336	\N	t	\N	28	\N	4.28	0.93	49	150	1.47	47	92	491	38	0.56	1.499	\N	0.659	\N	500	\N	120	0.11	0.13	1	\N	0.271	141	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	KALE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/kale.webp	t	f	0.006300000000	2.441000000000	0.000010000000	0.750000000000	ANNUAL	SEED	t	6	35	55	\N	ROW_METHOD	0.375000000000	\N	7049090
154	Kohlrabi	Brassica	oleracea var. gongylodes	Vegetables and melons	Root, bulb or tuberous vegetables	0.525	0.30833334	t	0.725	1.0166667	0.8666667	\N	t	\N	54	\N	1.7	0.1	27	24	0.4	19	46	350	20	0.03	0.129	\N	0.139	\N	2	\N	62	0.05	0.02	0.4	\N	0.15	16	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	KOHLRABI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/kohlrabi.webp	t	f	0.006300000000	2.392000000000	0.000010000000	0.230000000000	ANNUAL	SEED	t	5	35	56	\N	\N	0.125000000000	\N	7049090
155	Turnip, for fodder	Brassica	rapa	Other crops	Grasses and other fodder crops	0.525	0.30833334	t	0.725	1.0166667	0.8666667	\N	t	\N	19	\N	0.9	0.1	28	30	0.3	11	27	191	67	0.27	0.085	\N	0.134	\N	0	\N	21	0.04	0.03	0.4	\N	0.09	15	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TURNIP	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/turnip_-_for_fodder.webp	t	t	0.007500000000	2.392000000000	0.000010000000	0.680000000000	ANNUAL	SEED	f	6	\N	55	\N	\N	0.125000000000	0.000728000000	1214
157	Chicory	Cichorium	intybus	Stimulant, spice and aromatic crops	Stimulant crops	0.76	0.39333335	t	0.68333334	1.0204667	0.91333336	\N	t	\N	11	\N	0.9	0.1	17	19	0.24	10	26	211	2	0.16	0.051	\N	0.1	\N	1	\N	2.8	0.062	0.027	0.16	\N	0.042	37	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICORY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chicory.webp	t	f	\N	0.750000000000	0.000010000000	\N	PERENNIAL	SEED	t	7	\N	\N	\N	\N	\N	\N	705
158	Melon (except watermelon)	Cucumis	melo	Vegetables and melons	Fruit-bearing vegetables	1.13	0.42	t	0.54	1.0004	0.75	0.4	t	\N	49	\N	0.84	0.19	34	9	0.21	12	15	267	16	0.18	0.041	\N	0.041	\N	169	\N	36.7	0.041	0.019	0.734	\N	0.072	21	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MELON_	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/melon_except_watermelon.webp	t	f	0.010000000000	\N	\N	6.580000000000	ANNUAL	SEED	t	5	25	80	\N	ROW_METHOD	0.750000000000	\N	8071
159	Gourd	Cucurbita	spp.	Vegetables and melons	Fruit-bearing vegetables	1.13	0.42	t	0.54	1.0004	0.75	\N	t	\N	30	\N	1	0.1	26	21	0.8	12	44	340	1	0.32	0.127	\N	0.125	\N	426	\N	9	0.05	0.11	0.6	\N	0.061	16	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GOURD_AMERICAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/gourd.webp	t	f	\N	0.613000000000	0.000030000000	\N	ANNUAL	SEED	t	\N	\N	90	\N	\N	\N	\N	70993
160	Pumpkin, edible	Cucurbita	spp.	Vegetables and melons	Fruit-bearing vegetables	1.13	0.42	t	0.54	1.0004	0.75	\N	t	\N	30	\N	1	0.1	26	21	0.8	12	44	340	1	0.32	0.127	\N	0.125	\N	426	\N	9	0.05	0.11	0.6	\N	0.061	16	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PUMPKIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pumpkin.webp	t	f	0.020000000000	2.522000000000	0.000090000000	79.380000000000	ANNUAL	SEED	t	7	25	110	\N	\N	1.050000000000	\N	1214
161	Cardoon	Cynara	cardunculus	Vegetables and melons	Leafy or stem vegetables	0.76	0.39333335	t	0.68333334	1.0204667	0.91333336	\N	t	\N	51	\N	0.7	0.1	17	70	0.7	42	23	400	170	0.17	0.231	\N	0.256	\N	0	\N	2	0.02	0.03	0.3	\N	0.116	68	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CARDOON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cardoon.webp	t	f	\N	0.750000000000	\N	\N	PERENNIAL	SEED	t	10	49	\N	\N	\N	1.000000000000	\N	709992000
162	Fennel	Foeniculum	vulgare	Vegetables and melons	Leafy or stem vegetables	0.76	0.39333335	t	0.68333334	1.0204667	0.91333336	\N	t	\N	28	\N	1.24	0.2	31	49	0.73	17	50	414	52	0.2	0.066	\N	0.191	\N	48	\N	12	0.01	0.032	0.64	\N	0.047	27	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FENNEL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/fennel.webp	t	f	0.010000000000	0.004000000000	0.000010000000	0.160000000000	ANNUAL	SEED	t	8	28	75	\N	\N	0.225000000000	\N	7099990
163	Gourd (African)	Lagenaria	spp.	Vegetables and melons	Fruit-bearing vegetables	1.13	0.42	t	0.54	1.0004	0.75	\N	t	\N	30	\N	1	0.1	26	21	0.8	12	44	340	1	0.32	0.127	\N	0.125	\N	426	\N	9	0.05	0.11	0.6	\N	0.061	16	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GOURD_AFRICAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/gourd_african.webp	t	\N	\N	\N	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	70993
164	Cress	Lepidium	sativum	Vegetables and melons	Leafy or stem vegetables	0.76	0.39333335	t	0.68333334	1.0204667	0.91333336	\N	t	\N	29	\N	2.6	0.7	32	81	1.3	38	76	606	14	0.23	0.17	\N	0.553	\N	346	\N	69	0.08	0.26	1	\N	0.247	80	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CRESS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cress.webp	t	f	\N	\N	0.000010000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	7099990
165	Rhubarb	Rheum	spp.	Vegetables and melons	Leafy or stem vegetables	0.76	0.39333335	t	0.68333334	1.0204667	0.91333336	\N	t	\N	25	\N	0.9	0.2	21	86	0.22	12	14	288	4	0.1	0.021	\N	0.196	\N	5	\N	8	0.02	0.03	0.3	\N	0.024	7	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RHUBARB	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rhubarb.webp	t	f	0.020000000000	3.138000000000	0.000010000000	0.200000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	5	\N	600	\N	\N	0.900000000000	\N	7099990
166	Eggplant	Solanum	gilo	Vegetables and melons	Fruit-bearing vegetables	1.13	0.42	t	0.54	1.0004	0.75	\N	t	\N	19	\N	0.98	0.18	25	9	0.23	14	24	229	2	0.16	0.081	\N	0.232	\N	1	\N	2.2	0.039	0.037	0.649	\N	0.084	22	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EGGPLANT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/eggplant.webp	t	f	0.007500000000	2.026000000000	0.000010000000	1.360000000000	ANNUAL	SEED	t	7	63	\N	\N	ROW_METHOD	0.525000000000	\N	70930
167	Salsify	Tragopogon	porrifolius	Vegetables and melons	Root, bulb or tuberous vegetables	0.525	0.30833334	t	0.725	1.0166667	0.8666667	\N	t	\N	13	\N	3.3	0.2	82	60	0.7	23	75	380	20	0.38	0.089	\N	0.268	\N	0	\N	8	0.08	0.22	0.5	\N	0.277	26	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SALSIFY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	0.010000000000	\N	0.000020000000	\N	ANNUAL	SEED	f	7	\N	\N	\N	\N	0.070000000000	\N	706
168	Abiu	Pouteria	caimito	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ABIU	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/abiu.webp	t	f	0.010000000000	2.100000000000	0.008500000000	77.000000000000	PERENNIAL	SEED	t	15	180	1460	\N	ROW_METHOD	\N	\N	8109099
169	Acai palm	Euterpe	oleracea	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ACAI_PALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/acai_palm.webp	t	f	0.025400000000	1.352000000000	0.001500000000	24.040000000000	PERENNIAL	SEED	t	25	\N	730	\N	ROW_METHOD	0.304800000000	\N	22029020
170	Achacha	Garcinia	humilis	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ACHACHA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/achacha.webp	t	f	\N	0.010000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	150	\N	\N	\N	\N	8109099
171	Alfalfa for seed	Medicago	sativa	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALFALFA_FOR_SEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/alfalfa_for_fodder.webp	t	t	0.019000000000	0.023000000000	0.000010000000	\N	ANNUAL	SEED	f	3	\N	60	\N	ROW_METHOD	0.600000000000	\N	12092100
172	Alfalfa sprouts	Medicago	sativa	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALFALFA_SPROUTS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/alfalfa_sprouts.webp	t	f	\N	\N	0.000010000000	\N	ANNUAL	SEED	f	3	\N	4	\N	CONTAINER_METHOD	\N	\N	7099990
173	Allspice	Pimenta	dioica	Stimulant, spice and aromatic crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALLSPICE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/allspice.webp	t	f	0.009800000000	0.970000000000	\N	19.280000000000	PERENNIAL	SEED	t	14	365	2190	\N	ROW_METHOD	0.635000000000	\N	97112233
174	Aloe vera	Aloe	vera	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALOE_VERA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/aloe_vera.webp	t	f	0.150000000000	3.500000000000	\N	2.960000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	210	\N	ROW_METHOD	0.550000000000	\N	1211
175	Amaranth	Amaranthus	spp.	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	AMARANTH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/amaranth.webp	t	f	0.006300000000	2.500000000000	\N	0.450000000000	ANNUAL	SEED	t	4	21	40	\N	ROW_METHOD	0.300000000000	\N	10089090
177	Apple banana	Musa	balbisiana  ×  acuminata	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APPLE_BANANA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple_banana.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	365	\N	\N	\N	\N	8039010
178	Apple malay (Malay apple)	Syzgium	malaccense	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APPLE_MALAY_MALAY_APPLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/malay_apple.webp	t	f	0.040000000000	0.850000000000	\N	53.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	240	\N	\N	ROW_METHOD	0.090000000000	\N	8109099
179	Araza fruit	Eugenia	stipitata	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ARAZA_FRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	0.500000000000	2.500000000000	0.002100000000	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	80	365	1095	\N	ROW_METHOD	0.020000000000	\N	80450
180	Areca (betel nut)	Areca	catechu	Fruit and nuts	Nuts	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ARECA_BETEL_NUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/areca_betel_nut.webp	t	f	\N	0.123000000000	\N	0.870000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	45	\N	\N	\N	\N	\N	\N	21069030
181	Arracacha	Arracacia	xanthorrhiza	High starch root/tuber crops	High starch root/tuber crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ARRACACHA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/arracacha.webp	t	f	\N	4.196000000000	\N	1.890000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	8	\N	300	\N	\N	\N	\N	70690
182	Arugula	Eruca	sativa	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ARUGULA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/arugula.webp	t	f	0.006300000000	1.700000000000	\N	0.230000000000	ANNUAL	SEED	f	4	\N	38	\N	ROW_METHOD	0.125000000000	\N	709
183	Bambara groundnut	Vigna	subterranea	Oilseed crops and oleaginous fruits	Oilseed crops and oleaginous fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BAMBARA_GROUNDNUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/bambara_groundnut.webp	t	f	0.040000000000	0.085000000000	\N	3.200000000000	ANNUAL	SEED	f	5	\N	140	\N	ROW_METHOD	0.120000000000	\N	7133400
184	Bamboo, common	Bambusa	vulgaris	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BAMBOO_COMMON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/bamboo_common.webp	t	f	\N	1.250000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	10	\N	\N	\N	\N	\N	\N	14011000
185	Banana passionfruit	Passiflora	spp.	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_PASSIONFRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	4.371000000000	\N	0.020000000000	PERENNIAL	SEED	t	70	90	\N	\N	\N	\N	\N	810
186	Basil	Ocimum	basilicum	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BASIL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/basil.webp	t	f	0.010000000000	\N	0.000010000000	\N	ANNUAL	SEED	t	5	42	40	\N	ROW_METHOD	0.225000000000	\N	12119094
223	Citronella	Cymbopogon	spp.	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRONELLA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/citronella.webp	t	f	\N	0.013000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	33012942
187	Beans, harvested green	Phaseolus	vulgaris	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEANS_HARVESTED_GREEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beans-harvested_green,dry.webp	t	f	0.035000000000	0.086000000000	0.000250000000	\N	ANNUAL	SEED	f	7	\N	52	\N	ROW_METHOD	0.065000000000	\N	71333
188	Beet, sugar	Beta	vulgaris	Sugar crops	Sugar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEET_SUGAR	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beet_sugar.webp	t	f	0.010000000000	4.760000000000	0.000020000000	\N	ANNUAL	SEED	t	6	35	50	\N	ROW_METHOD	0.075000000000	\N	17011200
189	Beet, sugar for fodder	Beta	vulgaris	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEET_SUGAR_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beet_sugar.webp	t	f	0.010000000000	4.760000000000	\N	\N	ANNUAL	SEED	f	6	\N	50	\N	ROW_METHOD	0.075000000000	\N	1214
190	Beet, sugar for seeds	Beta	vulgaris	Sugar crops	Sugar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEET_SUGAR_FOR_SEEDS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beet_sugar.webp	t	f	0.010000000000	4.760000000000	\N	\N	ANNUAL	SEED	t	6	35	50	\N	ROW_METHOD	0.075000000000	\N	12091000
193	Bergamot orange	Citrus	bergamia	Fruit and nuts	Citrus fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BERGAMOT_ORANGE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/bergamot.webp	t	f	\N	1.800000000000	\N	42.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	10	\N	\N	\N	\N	0.550000000000	\N	33019090
194	Big Leaf Mahogany (Mogno brasileiro)	Swietenia	macrophylla	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BIG_LEAF_MAHOGANY_MOGNO_BRASILEIRO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	10	\N	\N	\N	\N	\N	\N	44072100
195	Bilimbi	Averrhoa	bilimbi	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BILIMBI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/bilimbi.webp	t	f	\N	\N	0.000160000000	45.360000000000	PERENNIAL	SEED	f	14	\N	50	\N	\N	\N	\N	1319
196	Black oats	Avena	strigosa	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_OATS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/black_oats.webp	t	t	\N	0.123000000000	\N	\N	ANNUAL	SEED	f	14	\N	\N	\N	\N	\N	0.008967000000	100490
197	Black wattle	Acacia	mearnsii	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_WATTLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/black_wattle.webp	t	f	\N	4.700000000000	\N	2.750000000000	PERENNIAL	SEED	t	10	90	3650	\N	ROW_METHOD	1.500000000000	\N	320120
199	Brazilwood tree	Paubrasilia	echinata	Other crops	Flower crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BRAZILWOOD_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	4407290185
200	Broad bean, harvested green	Vicia	faba	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROAD_BEAN_HARVESTED_GREEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/broad_bean.webp	t	f	0.035000000000	\N	0.001000000000	0.140000000000	ANNUAL	SEED	f	10	\N	\N	\N	\N	0.125000000000	\N	71333
201	Brown salwood (Acácia mangium)	Acacia	mangium	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_SALWOOD_ACÁCIA_MANGIUM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	1.059000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	1211
203	Butterfly pea	Clitoria	ternatea	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BUTTERFLY_PEA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/butterfly_pea.webp	t	f	0.035000000000	2.300000000000	\N	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	0.250000000000	\N	7131010
204	Cabbage, for fodder	Brassica	spp.	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CABBAGE_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cabbage_fodder.webp	t	f	0.006300000000	3.050000000000	0.000010000000	\N	ANNUAL	SEED	t	6	42	\N	\N	ROW_METHOD	0.525000000000	\N	704
205	Calendula	Calendula	officinalis	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CALENDULA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/calendula.webp	t	f	\N	0.056000000000	0.000010000000	\N	ANNUAL	SEED	t	6	\N	\N	\N	\N	\N	0.002241000000	6029060
206	Cape gooseberry	Physalis	peruviana	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CAPE_GOOSEBERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cape_gooseberry.webp	t	f	\N	0.336000000000	0.000010000000	24.000000000000	PERENNIAL	SEED	f	14	\N	\N	\N	\N	\N	\N	8103000
207	Carob	Ceratonia	siliqua	Fruit and nuts	Other fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CAROB	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carob.webp	t	f	\N	0.275000000000	\N	60.000000000000	PERENNIAL	SEED	t	16	\N	\N	\N	\N	\N	\N	121292
208	Carrot, for fodder	Daucus	carota ssp. sativa	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CARROT_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carrot.webp	t	f	0.006300000000	3.174000000000	0.000010000000	\N	ANNUAL	SEED	f	14	\N	\N	\N	ROW_METHOD	0.070000000000	\N	1214
209	Castor bean	Ricinus	communis	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASTOR_BEAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/castor_bean.webp	t	f	\N	0.140000000000	0.000200000000	\N	PERENNIAL	SEED	t	7	49	\N	\N	ROW_METHOD	2.500000000000	\N	15153090
211	Chard	Beta	vulgaris	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHARD	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chard.webp	t	f	0.010000000000	\N	\N	1.130000000000	ANNUAL	SEED	t	6	35	35	\N	\N	0.225000000000	0.000504000000	7099990
212	Chayote	Sechium	edule	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHAYOTE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chayote.webp	t	f	\N	2.500000000000	0.000500000000	87.500000000000	PERENNIAL	SEED	t	\N	\N	90	\N	ROW_METHOD	1.500000000000	\N	7099910
215	Chia	Salvia	hispanica	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHIA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chia.webp	t	f	\N	\N	\N	\N	ANNUAL	SEED	f	14	\N	\N	\N	\N	\N	\N	19053290
217	Chicory for greens	Cichorium	intybus	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICORY_FOR_GREENS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chicory_for_greens.webp	t	f	\N	0.750000000000	0.000010000000	\N	ANNUAL	SEED	t	7	\N	\N	\N	\N	\N	\N	7052900
218	Chili, fresh (all varieties)	Capsicum	spp.	Stimulant, spice and aromatic crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHILI_FRESH_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chili_fresh.webp	t	f	0.007500000000	1.220000000000	0.000010000000	0.450000000000	ANNUAL	SEED	t	10	56	60	\N	\N	0.450000000000	\N	7096010
219	Chive	Allium	schoenoprasum	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHIVE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chive.webp	t	f	0.006300000000	\N	0.000010000000	0.100000000000	PERENNIAL	SEED	t	7	\N	60	\N	ROW_METHOD	0.127000000000	\N	703900000
221	Cilantro	Coriandrum	sativum	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CILANTRO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cilantro.webp	t	f	0.020000000000	2.150000000000	0.000010000000	0.090000000000	ANNUAL	SEED	f	5	\N	\N	\N	ROW_METHOD	0.075000000000	\N	709
225	Clover for seed (all varieties)	Trifolium	spp.	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CLOVER_FOR_SEED_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/clover_for_fodder.webp	t	t	0.006300000000	0.034000000000	0.000010000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	0.000900000000	12092280
227	Cocoyam (New cocoyam) (Xanthosoma spp.)	Xanthosoma	sagittifolium	High starch root/tuber crops	Other roots and tubers	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COCOYAM_NEW_COCOYAM_XANTHOSOMA_SPP	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cocoyam.webp	t	f	\N	1.750000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	7144000
228	Cola nut	Cola	spp.	Fruit and nuts	Nuts	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COLA_NUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cola_nut_all_varieties.webp	t	f	\N	0.056000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	8027000
229	Collards	Brassica	oleracea var. viridis	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COLLARDS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/collards.webp	t	f	0.006300000000	1.650000000000	0.000010000000	\N	ANNUAL	SEED	t	7	35	\N	\N	\N	0.525000000000	\N	704
230	Copaíba	Copaifera	langsdorfii	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COPAÍBA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	20	\N	\N	\N	\N	\N	\N	33013099
231	Coriander long (Long coriander)	Eryngium	antihystericum	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CORIANDER_LONG_LONG_CORIANDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	0.000010000000	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	9092100
233	Corn sweet for vegetable	Zea	mays	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CORN_SWEET_FOR_VEGETABLE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/corn_sweet_for_vegetable.webp	t	f	0.035000000000	0.560000000000	0.000110000000	1.250000000000	ANNUAL	SEED	f	7	21	\N	\N	ROW_METHOD	0.225000000000	\N	7099990
234	Cottonseed (all varieties)	Gossypium	spp.	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COTTONSEED_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cottonseed_all_varieties.webp	t	f	\N	0.157000000000	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	120721
235	Cowpea, harvested green	Vigna	unguiculata	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COWPEA_HARVESTED_GREEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/cowpea.webp	t	t	\N	0.055000000000	0.000070000000	\N	ANNUAL	SEED	f	8	\N	\N	\N	\N	\N	0.005604000000	7133500
237	Daikon radish (nabo forrajero, forage)	Raphanus	sativus var. longipinnatus	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAIKON_RADISH_NABO_FORRAJERO_FORAGE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/daikon_radish.webp	t	t	0.006300000000	1.250000000000	\N	\N	ANNUAL	SEED	f	5	\N	\N	\N	\N	0.125000000000	0.001400000000	7069020
238	Dragonfruit	Selenicereus	undatus	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DRAGONFRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/dragonfruit.webp	t	f	\N	0.854000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	810902090
239	Eddo (eddoe)	Colocasia	spp.	High starch root/tuber crops	Other roots and tubers	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EDDO_EDDOE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/edo_eddoe.webp	t	f	\N	2.500000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	7144000
240	Epazote	Dysphania	ambrosioides	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EPAZOTE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	ANNUAL	SEED	f	7	\N	40	\N	\N	0.127000000000	\N	902
243	Fique	Furcraea	macrophylla	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FIQUE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/fique.webp	t	f	\N	0.200000000000	\N	2.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	53089090
244	Flax for oil seed (linseed)	Linum	usitatissimum	Oilseed crops and oleaginous fruits	Oilseed crops and oleaginous fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FLAX_FOR_OIL_SEED_LINSEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/flax_for_oil_seed_linseed.webp	t	f	0.027500000000	0.152000000000	0.000010000000	\N	ANNUAL	SEED	f	\N	\N	90	\N	\N	\N	\N	15159091
245	Formio (New Zealand flax)	Phormium	tenax	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FORMIO_NEW_ZEALAND_FLAX	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/formio_new_zealand_flax.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	53089090
246	Garlic, green	Allium	sativum	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GARLIC_GREEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/garlic.webp	t	f	0.035000000000	\N	\N	0.250000000000	ANNUAL	SEEDLING_OR_PLANTING_STOCK	f	28	\N	180	\N	ROW_METHOD	0.125000000000	\N	7032000
247	Genipap tree	Genipa	americana	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GENIPAP_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/genipap_tree.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	25	180	\N	\N	\N	\N	\N	810
248	Geranium spp.	Geranium	spp.	Other crops	Flower crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GERANIUM_SPP	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/geranium.webp	t	f	\N	0.005000000000	\N	\N	ANNUAL	SEED	t	10	\N	\N	\N	\N	\N	\N	330121
249	Gingko biloba	Gingko	biloba	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GINGKO_BILOBA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/gingko_biloba.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	13021990
251	Grapes for raisins	Vitis	vinifera	Fruit and nuts	Grapes	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPES_FOR_RAISINS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grapes_for_raisins.webp	t	f	\N	1.000000000000	\N	11.340000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	1095	\N	ROW_METHOD	2.438400000000	\N	80620
252	Grapes for table use	Vitis	vinifera	Fruit and nuts	Grapes	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPES_FOR_TABLE_USE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grapes_for_table_use.webp	t	f	\N	1.000000000000	\N	11.340000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	1095	\N	ROW_METHOD	2.438400000000	\N	8061010
253	Grapes for wine	Vitis	vinifera	Fruit and nuts	Grapes	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPES_FOR_WINE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grapes_for_wine.webp	t	f	\N	1.000000000000	\N	11.340000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	1095	\N	ROW_METHOD	2.438400000000	\N	8061010
254	Grass, esparto	Lygeum\n\nStipa	spartum\n\ntenacissum	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRASS_ESPARTO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grass_sudan.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	46
255	Grass, orchard	Dactylis	glomerata	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRASS_ORCHARD	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grass_esparto.webp	t	t	\N	0.673000000000	\N	\N	PERENNIAL	SEED	f	7	\N	\N	\N	\N	\N	0.001401000000	12149090
256	Grass, Sudan	Sorghum	drumondii	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRASS_SUDAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/grass_orchard.webp	t	t	\N	0.620000000000	0.000010000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	0.002522000000	12092990
257	Groundcherry	Physalis	spp.	Fruit and nuts	Berries	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GROUNDCHERRY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/groundcherry.webp	t	f	\N	\N	\N	\N	ANNUAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	8134090
258	Guaco	Mikania	spp.	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GUACO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	12119029
261	Hemp, manila (abaca)	Musa	textilis	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HEMP_MANILA_ABACA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/hemp_manila_abaca.webp	t	f	\N	0.102000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	540	\N	\N	\N	\N	530500
262	Hemp, sunn (crotalaria)	Crotalaria	juncea	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HEMP_SUNN_CROTALARIA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/hemp_sun.webp	t	t	\N	1.600000000000	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	12119099
263	Hempseed	Cannabis	sativa	Oilseed crops and oleaginous fruits	Permanent oilseed crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HEMPSEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/hempseed.webp	t	f	\N	0.154000000000	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	12079991
265	Henna	Lawsonia	inermis	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HENNA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/hen.webp	t	f	\N	1.250000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	1095	\N	\N	\N	\N	14041019
266	Horseradish	Armoracia	rusticana	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HORSERADISH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/horseradish.webp	t	f	0.007500000000	0.841000000000	\N	0.450000000000	PERENNIAL	SEED	t	7	\N	\N	\N	\N	0.200000000000	\N	706909020
269	Inca peanut	Plukenetia	volubilis	Fruit and nuts	Nuts	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	INCA_PEANUT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/inca_peanut.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	80200
271	Jack bean	Canavalia	ensiformis	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JACK_BEAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/jack_bean.webp	t	t	\N	\N	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	71339
272	Jackfruit	Artocarpus	heterophyllus	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JACKFRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/jackfruit.webp	t	f	\N	2.900000000000	\N	90.500000000000	PERENNIAL	SEED	t	21	\N	90	\N	\N	\N	\N	8109090
273	Jasmine	Jasminum	spp.	Other crops	Flower crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JASMINE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/jasmine.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	6031901
275	Jícama	Pachyrhizus	erosus	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JÍCAMA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/jointed_flatsedge.webp	t	f	\N	1.345000000000	\N	\N	ANNUAL	SEED	f	12	\N	150	\N	\N	0.127000000000	\N	709990500
277	Kapok	Ceiba	pentandra	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	KAPOK	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/kapok.webp	t	f	\N	0.058000000000	\N	16.500000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	53089090
278	Kenaf	Hibiscus	cannabinus	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	KENAF	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/kenaf.webp	t	f	\N	1.121000000000	0.000030000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	0.000800000000	53089090
280	Laurel	Laurus	nobilis	Other crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LAUREL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/laurel.webp	t	f	\N	\N	\N	41.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	121190
281	Lavender	Lavandula	spp.	Other crops	Flower crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LAVENDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lavender.webp	t	f	0.127000000000	0.112000000000	0.000010000000	0.060000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	12	\N	50	\N	ROW_METHOD	0.381000000000	\N	33012979
282	Lemon balm	Melissa	officinalis	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEMON_BALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lemon_balm.webp	t	f	\N	\N	0.000010000000	0.180000000000	PERENNIAL	SEED	t	10	\N	70	\N	\N	0.304800000000	\N	121190
283	Lemon Scented Gum (Eucalipto cheiroso)	Eucalyptus	citriodora	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEMON_SCENTED_GUM_EUCALIPTO_CHEIROSO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lemon_grass.webp	t	f	\N	0.530000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	3301
284	Lespedeza (all varieties)	Lespedeza	spp.	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LESPEDEZA_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lespedeza_all_varieties.webp	t	t	\N	0.028000000000	0.000010000000	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	\N	0.002522000000	1214
285	Lime, sweet	Citrus	limetta	Fruit and nuts	Citrus fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LIME_SWEET	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lime.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8055000
287	Liquorice	Glycyrrhiza	glabra	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LIQUORICE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/liquorice.webp	t	f	\N	0.280000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	7	\N	365	\N	\N	0.006350000000	\N	17049010
289	Lupin (lupino)	Lupinus	albus	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LUPIN_LUPINO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lupin.webp	t	t	\N	2.550000000000	0.000140000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	1214
290	Lupine (all varieties)	Lupinus	spp.	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LUPINE_ALL_VARIETIES	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lupine.webp	t	t	0.006300000000	\N	0.000140000000	\N	PERENNIAL	SEED	t	14	\N	\N	\N	\N	0.558800000000	\N	1214
292	Maguey	Agave	americana	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAGUEY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maguey.webp	t	f	\N	12.000000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	1460	\N	\N	1.500000000000	\N	17026090
294	Maize hybrid	Zea	mays	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_HYBRID	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maize_hybrid.webp	t	t	0.035000000000	0.990000000000	\N	\N	ANNUAL	SEED	f	7	\N	50	\N	\N	0.075000000000	\N	10051018
295	Maize ordinary	Zea	mays	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_ORDINARY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maize_ordinary.webp	t	t	0.035000000000	0.990000000000	\N	\N	ANNUAL	SEED	f	7	\N	50	\N	\N	0.075000000000	\N	100590
296	Mandarin	Citrus	reticulata	Fruit and nuts	Citrus fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANDARIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mandarin.webp	t	f	\N	1.233000000000	\N	72.570000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	ROW_METHOD	2.743200000000	\N	8052100
297	Mangosteen	Garcinia	mangostana	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGOSTEEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mangosteen.webp	t	f	\N	0.500000000000	\N	\N	PERENNIAL	SEED	t	43	\N	2555	\N	\N	\N	\N	80450
298	Mangosteen false (False mangosteen)	Garcinia	xanthochymus	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGOSTEEN_FALSE_FALSE_MANGOSTEEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/mangosteen.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	80450
301	Marjoram	Origanum	majorana	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MARJORAM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/marjoram.webp	t	f	\N	\N	0.000010000000	0.180000000000	ANNUAL	SEED	t	7	\N	60	\N	CONTAINER_METHOD	0.177800000000	\N	7129050
302	Maslin (mixed cereals)	Mixture	spp.	Cereals	Mixed cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MASLIN_MIXED_CEREALS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maslin_mixed_cereals.webp	t	t	\N	\N	\N	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	11010000
303	Medlar	Mespilus	germanica	Fruit and nuts	Pome fruits and stone fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MEDLAR	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/medlar.webp	t	f	\N	\N	\N	85.000000000000	PERENNIAL	SEED	t	\N	\N	730	\N	\N	\N	\N	8119
305	Millet (bulrush)	Pennisetum	glaucum	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_BULRUSH	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/millet_bajra_pearl.webp	t	t	0.019100000000	0.448000000000	0.000010000000	\N	ANNUAL	SEED	f	10	\N	75	\N	\N	\N	0.000280000000	10082920
306	Miracle fruit	Synsepalum	dulcificum	Fruit and nuts	Berries	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MIRACLE_FRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/miracle_fruit.webp	t	f	\N	\N	\N	1.750000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	8119
310	Momoqui (Sibipiruna)	Caesalpinia	pluviosa	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MOMOQUI_SIBIPIRUNA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	10	\N	\N	\N	\N	\N	\N	4403
315	Niger seed	Guizotia	abyssinica	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NIGER_SEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/niger_seed.webp	t	t	\N	0.055000000000	\N	\N	ANNUAL	SEED	f	2	\N	90	\N	BROADCAST_METHOD	\N	0.001000000000	12099100
317	Onion, green	Allium	cepa	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ONION_GREEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/onion-green.webp	t	f	0.007500000000	2.687000000000	0.000010000000	\N	ANNUAL	SEED	t	10	63	\N	\N	\N	0.080000000000	\N	70310
318	Onion, red	Allium	cepa	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ONION_RED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/onion-red.webp	t	f	0.007500000000	3.174000000000	0.000010000000	0.450000000000	ANNUAL	SEED	t	10	63	115	\N	\N	0.080000000000	\N	70310
319	Onion, welsh (Welsh onion)	Allium	fistulosum	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ONION_WELSH_WELSH_ONION	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/welsh_onion.webp	t	f	0.007500000000	1.109000000000	0.000010000000	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	6	\N	90	\N	\N	0.080000000000	\N	70310
320	Opium	Papaver	somniferum	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OPIUM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/opium.webp	t	f	\N	0.837000000000	0.000010000000	\N	ANNUAL	SEED	f	7	\N	80	\N	\N	\N	0.000500000000	130211
322	Oregano	Origanum	vulgare	Stimulant, spice and aromatic crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OREGANO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/oregano.webp	t	f	0.006300000000	0.489000000000	0.000010000000	0.180000000000	PERENNIAL	SEED	t	7	\N	90	\N	ROW_METHOD	0.250000000000	\N	7129050
323	Palm bahia piassaba (Bahia piassaba palm)	Attalea	funifera	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PALM_BAHIA_PIASSABA_BAHIA_PIASSABA_PALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/bahia_piassaba_palm.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	12071000
324	Palm jussara (Jussara palm)	Euterpe	edulis	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PALM_JUSSARA_JUSSARA_PALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/jussara_palm.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	12071000
325	Palm palmyra	Borassus	flabellifer	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PALM_PALMYRA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/palm_palmyra.webp	t	f	0.100000000000	1.900000000000	\N	0.040000000000	PERENNIAL	SEED	t	45	\N	\N	\N	\N	5.000000000000	\N	12071000
326	Palm peach (Peach palm)	Bactris	gasipaes	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PALM_PEACH_PEACH_PALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/peach_palm.webp	t	f	\N	1.550000000000	\N	45.400000000000	PERENNIAL	SEED	t	60	\N	730	\N	\N	\N	\N	12071000
327	Palm, sago (Metroxylon sagu)	Metroxylon	sagu	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PALM_SAGO_METROXYLON_SAGU	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/palm_sago.webp	t	f	\N	\N	\N	225.000000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	12071000
328	Parsley	Petroselinum	crispum	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PARSLEY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/parsley.webp	t	f	0.010000000000	0.952000000000	0.000010000000	0.100000000000	ANNUAL	SEED	t	14	66	70	\N	ROW_METHOD	0.150000000000	\N	12099150
329	Passionfruit	Passiflora	edulis	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PASSIONFRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/passionfruit.webp	t	f	\N	2.350000000000	\N	33.500000000000	PERENNIAL	SEED	t	14	\N	365	\N	\N	\N	\N	810
330	Pea, harvested green	Pisum	sativum	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEA_HARVESTED_GREEN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pea.webp	t	t	0.040000000000	0.659000000000	0.000220000000	0.090000000000	ANNUAL	SEED	f	7	25	60	\N	ROW_METHOD	0.050000000000	\N	7131010
331	Pennyroyal	Mentha	pulegium	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PENNYROYAL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	0.020000000000	\N	\N	0.340000000000	PERENNIAL	SEED	t	10	\N	60	\N	\N	0.152400000000	\N	3301
332	Pepper Brazilian (Brazilian pepper)	Schinus	terebinthifolia	Stimulant, spice and aromatic crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEPPER_BRAZILIAN_BRAZILIAN_PEPPER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	9041190
333	Plum java (Java palm)	Syzygium	cumini	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PLUM_JAVA_JAVA_PALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/java_palm.webp	t	f	0.045000000000	\N	\N	90.000000000000	PERENNIAL	SEED	t	10	\N	1825	\N	\N	\N	\N	80940
334	Plum june (June palm)	Spondias	dulcis	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PLUM_JUNE_JUNE_PALM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/june_palm.webp	t	f	\N	\N	\N	244.940000000000	PERENNIAL	SEED	t	\N	\N	1460	\N	\N	\N	\N	80940
336	Purslane	Portulaca	oleracea	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PURSLANE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/purslane.webp	t	f	0.008400000000	\N	0.000010000000	0.340000000000	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	7	\N	30	\N	\N	0.228600000000	\N	12119026
337	Pyrethrum	Chrysanthemum	cinerariaefolium	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PYRETHRUM	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/pyrethum.webp	t	f	\N	0.050000000000	\N	\N	PERENNIAL	SEED	t	14	\N	\N	\N	\N	\N	0.000250000000	32011000
339	Quinine	Cinchona	spp.	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	QUININE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/quinine.webp	t	f	\N	1.000000000000	\N	\N	PERENNIAL	SEED	t	14	365	\N	\N	\N	\N	\N	12119039
340	Rambutan	Nephelium	lappaceum	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RAMBUTAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rambutan.webp	t	f	\N	\N	\N	124.000000000000	PERENNIAL	SEED	t	9	\N	1825	\N	\N	\N	\N	810
343	Rocoto pepper	Capsicum	pubescens	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROCOTO_PEPPER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	70960
344	Rose	Rosa	spp.	Other crops	Flower crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROSE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rose.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	60240
348	Rosemary	Salvia	rosmarinus	Beverage and spice crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROSEMARY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/rosemary.webp	t	f	0.038100000000	\N	0.000010000000	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	80	\N	ROW_METHOD	0.406400000000	\N	12119094
350	Saffron	Crocus	sativus	Stimulant, spice and aromatic crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SAFFRON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/saffron.webp	t	f	\N	0.001000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	910
351	Sainfoin	Onobrychis	viciifolia	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SAINFOIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sainfoin.webp	t	t	\N	0.067000000000	0.000020000000	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	\N	0.003000000000	1214
352	Sangra d'agua	Croton	urucurana	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SANGRA_D_AGUA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	15	\N	\N	\N	\N	\N	\N	8109093
354	Schott (Mangarito)	Xanthosoma	riedelianum	Potatoes and yams	High starch root/tuber crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SCHOTT_MANGARITO	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	120740
356	Sessile joyweed	Alternanthera	sessilis	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SESSILE_JOYWEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sessile_joyweed.webp	t	f	\N	\N	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	f	\N	\N	\N	\N	\N	\N	\N	53041010
357	Shea tree	Vitellaria	paradoxa	Oilseed crops and oleaginous fruits	Permanent oilseed crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SHEA_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/shea_butter_nut.webp	t	f	\N	0.110000000000	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	100790
358	Soapberry (Saboneteira)	Sapindus	saponaria	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOAPBERRY_SABONETEIRA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	20	\N	\N	\N	\N	\N	\N	100790
359	Sorrel	Rumex	acetosa	Vegetables and melons	Leafy or stem vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SORREL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sorrel.webp	t	f	0.006300000000	\N	0.000010000000	0.290000000000	PERENNIAL	SEED	t	2	\N	35	\N	\N	0.304800000000	\N	100790
360	Soursop	Annona	muricata	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOURSOP	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/soursop.webp	t	f	\N	0.729000000000	\N	60.250000000000	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	48070090
361	Southern Blue Gum (Eucalipto glóbulus)	Eucalyptus	globulus	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOUTHERN_BLUE_GUM_EUCALIPTO_GLÓBULUS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEED	t	\N	\N	\N	\N	\N	\N	\N	8109094
362	Soybean hay	Glycine	max	Oilseed crops and oleaginous fruits	Oilseed crops and oleaginous fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOYBEAN_HAY	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/soybean_hay.webp	t	t	0.035000000000	0.270000000000	0.000130000000	0.090000000000	ANNUAL	SEED	f	8	\N	50	\N	\N	0.075000000000	0.005604000000	120190
363	Spelt	Triticum	spelta	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SPELT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/spelt_wheat.webp	t	t	\N	0.639000000000	0.000040000000	\N	ANNUAL	SEED	f	\N	\N	\N	\N	\N	\N	0.010087000000	10019110
364	St John's Wort	Hypericum	perforatum	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ST_JOHN_S_WORT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/st_john_s_wort.webp	t	f	\N	0.093000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	10	\N	\N	\N	\N	\N	\N	1302
365	Starfruit	Averrhoa	carambola	Fruit and nuts	Tropical and subtropical fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STARFRUIT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/starfruit.webp	t	f	\N	4.700000000000	\N	90.720000000000	PERENNIAL	SEED	t	14	\N	300	\N	\N	6.000000000000	\N	810902010
366	Stevia	Stevia	rebaudiana	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STEVIA	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/stevia.webp	t	f	\N	0.250000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	7	\N	125	\N	\N	0.304800000000	\N	2938900000
368	Sugarcane for fodder	Saccharum	officinarum	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sugarcane_for_fodder.webp	t	f	\N	6.500000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	121930
369	Sugarcane for thatching	Saccharum	officinarum	Other crops	Fibre crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_FOR_THATCHING	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sugarcane_for_thatching.webp	t	f	\N	6.500000000000	\N	\N	ANNUAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	121930
370	Sunflower for fodder	Helianthus	annuus	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUNFLOWER_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sunflower_for_fodder.webp	t	t	0.007500000000	0.180000000000	0.000070000000	\N	ANNUAL	SEED	f	10	\N	\N	\N	\N	0.650000000000	0.001121000000	1214
371	Sunflower for oil seed	Helianthus	annuus	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUNFLOWER_FOR_OIL_SEED	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sunflower_for_fodder.webp	t	t	0.007500000000	0.180000000000	0.000070000000	\N	ANNUAL	SEED	f	10	\N	\N	\N	\N	0.650000000000	0.001121000000	151219
372	Swede for fodder	Brassica	napus var. napobrassica	Vegetables and melons	Root, bulb or tuberous vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SWEDE_FOR_FODDER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/swede_for_fodder.webp	t	f	0.007500000000	1.345000000000	\N	1.810000000000	ANNUAL	SEED	f	6	\N	80	\N	ROW_METHOD	0.150000000000	0.010115000000	1214
373	Sweet pepper	Capsicum	annuum	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SWEET_PEPPER	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/sweet_pepper.webp	t	f	0.007500000000	1.221000000000	\N	1.630000000000	ANNUAL	SEED	t	10	56	\N	\N	\N	0.450000000000	\N	7096010
375	Tangerine	Citrus	tangerina	Fruit and nuts	Citrus fruits	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TANGERINE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tangerine.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	8052100
376	Thyme	Thymus	vulgaris	Stimulant, spice and aromatic crops	Stimulant crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	THYME	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/thyme.webp	t	f	0.006300000000	\N	0.000010000000	0.060000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	84	\N	ROW_METHOD	0.177800000000	\N	9109931
377	Timothy Grass	Phleum	pratense	Other crops	Grasses and other fodder crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TIMOTHY_GRASS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/timothy.webp	t	t	0.010000000000	0.035000000000	0.000010000000	\N	PERENNIAL	SEED	f	7	\N	\N	\N	ROW_METHOD	\N	0.000150000000	1214900018
380	Trefoil	Lotus	spp.	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TREFOIL	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/trefoil.webp	t	t	\N	0.009000000000	0.000010000000	\N	PERENNIAL	SEED	f	\N	\N	\N	\N	\N	\N	\N	1209299130
381	Triticale	Tritocosecale	spp.	Cereals	Cereals	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TRITICALE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/triticale.webp	t	t	\N	1.448000000000	0.000020000000	\N	ANNUAL	SEED	f	6	\N	124	\N	\N	\N	0.007584000000	10086000
382	Tropical almond tree (Amendoeira da praia, sete copas)	Terminalia	catappa	Other crops	Other crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TROPICAL_ALMOND_TREE_AMENDOEIRA_DA_PRAIA_SETE_COPAS	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tropical_almond.webp	t	f	\N	\N	\N	5.000000000000	PERENNIAL	SEED	t	20	\N	\N	\N	\N	\N	\N	1211
383	Tung tree	Vernicia	fordii	Oilseed crops and oleaginous fruits	Other temporary oilseed crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TUNG_TREE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/tung_tree.webp	t	f	\N	0.475000000000	\N	\N	PERENNIAL	SEED	t	60	\N	\N	\N	\N	0.175000000000	\N	15159011
384	Turmeric	Curcuma	longa	Stimulant, spice and aromatic crops	Spice and aromatic crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TURMERIC	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/turmeric.webp	t	f	0.127000000000	\N	\N	0.450000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	14	\N	240	\N	\N	0.305400000000	\N	91030
387	Velvet bean	Mucuna	pruriens	Other crops	Medicinal, pesticidal or similar crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VELVET_BEAN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/velvet_bean.webp	t	t	0.050000000000	0.750000000000	\N	\N	ANNUAL	SEED	t	\N	\N	\N	90	\N	0.350000000000	0.003750000000	70920
388	Vetch for grain	Vicia	sativa	Leguminous crops	Leguminous crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VETCH_FOR_GRAIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/vetch.webp	t	t	0.008400000000	\N	0.000040000000	\N	PERENNIAL	SEED	f	\N	\N	60	\N	\N	\N	0.002007000000	1214
389	West indian gherkin	Cucumis	anguria	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WEST_INDIAN_GHERKIN	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	ANNUAL	SEED	f	14	\N	60	\N	\N	0.300000000000	0.000350000000	70700
391	Yacon	Smallanthus	sonchifolius	High starch root/tuber crops	High starch root/tuber crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	YACON	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/default.webp	t	f	\N	\N	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	130219
392	Yerba mate	Ilex	paraguariensis	Stimulant, spice and aromatic crops	Stimulant crops	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	YERBA_MATE	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/yerba_mate.webp	t	f	\N	0.215000000000	\N	\N	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	\N	\N	\N	\N	\N	90300
393	Zucchini	Cucurbita	pepo	Vegetables and melons	Fruit-bearing vegetables	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ZUCCHINI	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/zucchini.webp	t	f	\N	0.202000000000	0.000170000000	\N	ANNUAL	SEED	t	7	\N	50	\N	\N	0.525000000000	\N	7099990
31	Apricot	Prunus	armeniaca	Fruit and nuts	Pome fruits and stone fruits	1.5	0.5	f	0.55	0.9	0.6518	3	f	\N	7	\N	1.4	0.39	48	13	0.39	10	23	259	1	0.2	0.078	\N	0.077	\N	96	\N	10	0.03	0.04	0.6	\N	0.054	9	0	\N	f	\N	f	f	\N	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APRICOT	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apricot.webp	t	f	\N	0.650000000000	\N	47.500000000000	PERENNIAL	SEEDLING_OR_PLANTING_STOCK	t	\N	\N	730	\N	ROW_METHOD	4.572000000000	\N	8091000
\.


--
-- Data for Name: cropDisease; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."cropDisease" (disease_id, crop_id) FROM stdin;
267	58
295	58
163	58
10	58
252	58
377	58
316	58
370	58
264	58
429	58
89	58
296	58
290	58
269	58
280	58
460	58
400	58
465	58
71	58
186	58
174	58
448	58
351	58
292	58
416	58
83	58
453	58
458	22
458	99
458	100
458	101
458	102
458	103
458	104
462	22
462	99
462	100
462	101
462	102
462	103
462	104
69	22
69	99
69	100
69	101
69	102
69	103
69	104
61	22
61	99
61	100
61	101
61	102
61	103
61	104
250	22
250	99
250	100
250	101
250	102
250	103
250	104
267	22
267	99
267	100
267	101
267	102
267	103
267	104
26	22
26	99
26	100
26	101
26	102
26	103
26	104
303	22
303	99
303	100
303	101
303	102
303	103
303	104
358	22
358	99
358	100
358	101
358	102
358	103
358	104
338	22
338	99
338	100
338	101
338	102
338	103
338	104
314	22
314	99
314	100
314	101
314	102
314	103
314	104
180	22
180	99
180	100
180	101
180	102
180	103
180	104
14	22
14	99
14	100
14	101
14	102
14	103
14	104
252	22
252	99
252	100
252	101
252	102
252	103
252	104
423	22
423	99
423	100
423	101
423	102
423	103
423	104
258	22
258	99
258	100
258	101
258	102
258	103
258	104
438	22
438	99
438	100
438	101
438	102
438	103
438	104
23	22
23	99
23	100
23	101
23	102
23	103
23	104
479	22
479	99
479	100
479	101
479	102
479	103
479	104
475	22
475	99
475	100
475	101
475	102
475	103
475	104
353	22
353	99
353	100
353	101
353	102
353	103
353	104
38	22
38	99
38	100
38	101
38	102
38	103
38	104
276	22
276	99
276	100
276	101
276	102
276	103
276	104
508	22
508	99
508	100
508	101
508	102
508	103
508	104
454	22
454	99
454	100
454	101
454	102
454	103
454	104
501	22
501	99
501	100
501	101
501	102
501	103
501	104
431	22
431	99
431	100
431	101
431	102
431	103
431	104
49	22
49	99
49	100
49	101
49	102
49	103
49	104
21	22
21	99
21	100
21	101
21	102
21	103
21	104
349	22
349	99
349	100
349	101
349	102
349	103
349	104
506	22
506	99
506	100
506	101
506	102
506	103
506	104
37	22
37	99
37	100
37	101
37	102
37	103
37	104
279	22
279	99
279	100
279	101
279	102
279	103
279	104
328	22
328	99
328	100
328	101
328	102
328	103
328	104
429	22
429	99
429	100
429	101
429	102
429	103
429	104
288	22
288	99
288	100
288	101
288	102
288	103
288	104
171	22
171	99
171	100
171	101
171	102
171	103
171	104
208	22
208	99
208	100
208	101
208	102
208	103
208	104
335	22
335	99
335	100
335	101
335	102
335	103
335	104
116	22
116	99
116	100
116	101
116	102
116	103
116	104
234	22
234	99
234	100
234	101
234	102
234	103
234	104
287	22
287	99
287	100
287	101
287	102
287	103
287	104
327	22
327	99
327	100
327	101
327	102
327	103
327	104
229	22
229	99
229	100
229	101
229	102
229	103
229	104
371	22
371	99
371	100
371	101
371	102
371	103
371	104
422	22
422	99
422	100
422	101
422	102
422	103
422	104
465	22
465	99
465	100
465	101
465	102
465	103
465	104
248	22
248	99
248	100
248	101
248	102
248	103
248	104
90	22
90	99
90	100
90	101
90	102
90	103
90	104
71	22
71	99
71	100
71	101
71	102
71	103
71	104
195	22
195	99
195	100
195	101
195	102
195	103
195	104
86	22
86	99
86	100
86	101
86	102
86	103
86	104
\.


--
-- Data for Name: crop_management_plan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crop_management_plan (management_plan_id, estimated_revenue, seed_date, plant_date, germination_date, transplant_date, harvest_date, termination_date, already_in_ground, is_seed, needs_transplant, for_cover, is_wild, estimated_yield, estimated_yield_unit, estimated_price_per_mass, estimated_price_per_mass_unit) FROM stdin;
1	\N	2022-09-06	\N	\N	\N	2023-06-14	\N	t	\N	f	f	t	\N	kg	\N	kg
2	\N	2023-06-28	\N	2023-07-02	2023-08-08	2023-09-25	\N	f	t	t	f	\N	60.000000000000	kg	\N	kg
\.


--
-- Data for Name: crop_variety; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crop_variety (crop_variety_id, crop_id, crop_variety_name, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, supplier, seeding_type, lifecycle, compliance_file_url, organic, genetically_engineered, searched, crop_variety_photo_url, protein, lipid, ph, energy, ca, fe, mg, k, na, zn, cu, mn, vita_rae, vitc, thiamin, riboflavin, niacin, vitb6, folate, vitb12, nutrient_credits, treated, can_be_cover_crop, planting_depth, yield_per_area, average_seed_weight, yield_per_plant, planting_method, plant_spacing, needs_transplant, germination_days, transplant_days, harvest_days, termination_days, seeding_rate, hs_code_id, crop_varietal, crop_cultivar) FROM stdin;
9538fefa-09f8-11ee-b847-7ac3b12dfaeb	174	Wild aloe	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:42:55.505+02	2023-06-13 16:42:55.505+02	unknown	SEEDLING_OR_PLANTING_STOCK	PERENNIAL		f	f	f	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/aloe_vera.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	NO	f	0.150000000000	3.500000000000	\N	2.960000000000	ROW_METHOD	0.550000000000	t	14	\N	210	\N	\N	1211	\N	\N
e8d88ecc-09f8-11ee-871c-7ac3b12dfaeb	192	common	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:45:15.808+02	2023-06-13 16:45:15.808+02	New Supplier	SEED	ANNUAL		t	\N	\N	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/bell_peppers.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	YES	f	0.007500000000	1.220000000000	\N	\N	ROW_METHOD	0.450000000000	t	10	56	65	\N	\N	7096010	Red pepper	\N
6108b958-09f9-11ee-8ffe-7ac3b12dfaeb	123	Highbush	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:48:37.436+02	2023-06-13 16:48:37.436+02	The local store	SEEDLING_OR_PLANTING_STOCK	PERENNIAL		f	t	t	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/blueberry.webp	0.74	0.33	12.00	57.00	6.00	0.28	6.00	77.00	1.00	0.16	0.06	0.34	3.00	9.70	0.04	0.04	0.42	0.05	6.00	0.00	\N	NO	f	0.025400000000	0.670000000000	\N	2.220000000000	BED_METHOD	0.600000000000	t	30	\N	1095	\N	\N	8104000	\N	\N
a43deff4-09f9-11ee-9de7-7ac3b12dfaeb	25	Red delicious	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:50:30.207+02	2023-06-13 16:51:12.121+02	unknown	SEEDLING_OR_PLANTING_STOCK	PERENNIAL		t	\N	\N	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/apple.webp	0.26	0.17	11.00	52.00	6.00	0.12	5.00	107.00	1.00	0.04	0.03	0.04	3.00	4.60	0.02	0.03	0.09	0.04	3.00	0.00	\N	YES	f	\N	10.725000000000	\N	\N	ROW_METHOD	\N	t	\N	\N	730	\N	\N	8081000	\N	\N
ec60b938-09f9-11ee-9c51-7ac3b12dfaeb	188	Sugar beet	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:52:31.231+02	2023-06-13 16:52:31.231+02	unknown	SEED	ANNUAL		f	f	f	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/beet_sugar.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	NOT_SURE	f	0.010000000000	4.760000000000	0.000020000000	\N	ROW_METHOD	0.075000000000	t	6	35	50	\N	\N	17011200	\N	\N
87d678d0-09fa-11ee-bd9e-7ac3b12dfaeb	186	Dark opal	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:56:52.048+02	2023-06-13 16:56:52.048+02	Organic Supplier	SEED	ANNUAL		t	\N	\N	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/basil.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	YES	f	0.010000000000	\N	0.000010000000	\N	ROW_METHOD	0.225000000000	t	5	42	40	\N	\N	12119094	\N	\N
b031a5f2-09fa-11ee-ad29-7ac3b12dfaeb	67	Baby carrot	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:57:59.756+02	2023-06-13 16:57:59.756+02	test	SEED	ANNUAL		f	f	t	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/carrot.webp	0.93	0.24	35.00	41.00	33.00	0.30	12.00	320.00	69.00	0.24	0.05	0.14	835.00	5.90	0.07	0.06	0.98	0.14	19.00	0.00	\N	YES	f	0.006300000000	3.174000000000	0.000010000000	\N	ROW_METHOD	0.070000000000	f	14	\N	\N	\N	\N	7061010	\N	\N
a9996c36-0abb-11ee-9f9a-7ac3b12dfaeb	229	Georgia	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 15:59:21.56+02	2023-06-14 15:59:21.56+02	The store	SEED	ANNUAL		t	\N	\N	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/collards.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	YES	f	0.006300000000	1.650000000000	0.000010000000	\N	\N	0.525000000000	t	7	35	\N	\N	\N	704	\N	\N
b7ba07e8-0abc-11ee-a859-7ac3b12dfaeb	69	Iceberg	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:06:54.752+02	2023-06-14 16:06:54.752+02	unknown	SEED	ANNUAL		f	f	f	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/lettuce.webp	1.35	0.22	33.00	13.00	35.00	1.24	13.00	238.00	5.00	0.20	0.02	0.18	166.00	3.70	0.06	0.06	0.36	0.08	73.00	0.00	\N	NOT_SURE	f	0.007500000000	1.782000000000	0.000010000000	0.180000000000	ROW_METHOD	0.300000000000	t	5	31	65	\N	\N	705	\N	\N
810a4202-0abd-11ee-a025-7ac3b12dfaeb	293	Silage Master	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:12:32.504+02	2023-06-14 16:12:32.504+02	Big seed	SEED	ANNUAL		f	t	t	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/maize_for_silage.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	YES	t	0.035000000000	0.990000000000	\N	\N	\N	0.075000000000	f	7	\N	\N	\N	\N	\N	\N	\N
47049006-0abf-11ee-b485-7ac3b12dfaeb	219	Onion	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:25:14.153+02	2023-06-14 16:25:14.153+02	New Supplier	SEED	PERENNIAL		t	\N	\N	https://litefarm.nyc3.cdn.digitaloceanspaces.com/default_crop/v2/chive.webp	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	YES	f	0.006300000000	\N	0.000010000000	0.100000000000	ROW_METHOD	0.127000000000	t	7	\N	60	\N	\N	703900000	\N	\N
\.


--
-- Data for Name: crop_variety_sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.crop_variety_sale (sale_id, quantity, sale_value, crop_variety_id, quantity_unit) FROM stdin;
1	10	10	9538fefa-09f8-11ee-b847-7ac3b12dfaeb	kg
2	20	200	87d678d0-09fa-11ee-bd9e-7ac3b12dfaeb	kg
2	15	45	9538fefa-09f8-11ee-b847-7ac3b12dfaeb	kg
3	30	260	87d678d0-09fa-11ee-bd9e-7ac3b12dfaeb	kg
4	8	16	9538fefa-09f8-11ee-b847-7ac3b12dfaeb	kg
\.


--
-- Data for Name: custom_location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.custom_location (location_id, main_color, hover_color, line_type) FROM stdin;
\.


--
-- Data for Name: disease; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.disease (disease_id, disease_scientific_name, disease_common_name, disease_group, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, disease_name_translation_key, disease_group_translation_key) FROM stdin;
1	Pectobacterium carotovorum subsp. carotovorum	Bacterial Soft Rot of Pepper	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_SOFT_ROT_OF_PEPPER	BACTERIA
2	Xanthomonas axonopodis pv. mangiferaeindicae	Bacterial Black Spot of Mango	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_BLACK_SPOT_OF_MANGO	BACTERIA
3	Xanthomonas oryzae pv. oryzae	Bacterial Blight of Rice	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_BLIGHT_OF_RICE	BACTERIA
4	Pseudomonas syringae	Angular Leaf Spot Disease	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANGULAR_LEAF_SPOT_DISEASE	BACTERIA
5	Xanthomonas oryzae pv. oryzicola	Bacterial Leaf Streak	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_LEAF_STREAK	BACTERIA
6	Xanthomonas spp.	Bacterial Spot	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_SPOT	BACTERIA
7	Xanthomonas citri pv. mangiferaeindicae	Bacterial Canker of Mango	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_CANKER_OF_MANGO	BACTERIA
8	Pseudomonas savastanoi pv. phaseolicola	Halo Blight	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HALO_BLIGHT	BACTERIA
9	Erwinia amylovora	Fire Blight	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FIRE_BLIGHT	BACTERIA
10	Xanthomonas campestris pv. campestris	Black Rot	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_ROT	BACTERIA
11	Xanthomonas fragariae	Angular Leaf Spot of Strawberry	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANGULAR_LEAF_SPOT_OF_STRAWBERRY	BACTERIA
12	Pseudomonas syringae pv. syringae	Bacterial Canker	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_CANKER	BACTERIA
13	Streptomyces scabies	Potato Scab	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO_SCAB	BACTERIA
14	Pseudomonas syringae pv. syringae	Blast of Citrus	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLAST_OF_CITRUS	BACTERIA
15	Phytoplasma prunorum	Chlorotic Leaf Roll of Apricot	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHLOROTIC_LEAF_ROLL_OF_APRICOT	BACTERIA
16	Leifsonia xyli	Sugarcane Ratoon Stunting Disease	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_RATOON_STUNTING_DISEASE	BACTERIA
17	Pseudomonas syringae pv. syringae	Holcus Spot	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HOLCUS_SPOT	BACTERIA
18	Pectobacterium atrosepticum	Blackleg	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACKLEG	BACTERIA
19	Ralstonia solanacearum	Bacterial Wilt	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_WILT	BACTERIA
20	Acidovorax avenae	Bacterial Leaf Blight of Sugarcane	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_LEAF_BLIGHT_OF_SUGARCANE	BACTERIA
21	Spiroplasma citri	Citrus Stubborn Disease	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_STUBBORN_DISEASE	BACTERIA
22	Xanthomonas citri subsp. malvacearum	Bacterial Blight of Cotton	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_BLIGHT_OF_COTTON	BACTERIA
23	Xanthomonas axonopodis pv. citri	Citrus Canker	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_CANKER	BACTERIA
24	Xanthomonas musacearum	Banana Xanthomonas Wilt	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_XANTHOMONAS_WILT	BACTERIA
25	Xanthomonas arboricola	Bacterial Spot on Stone Fruits	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_SPOT_ON_STONE_FRUITS	BACTERIA
26	Xanthomonas alfalfae	Bacterial Spot of Citrus	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_SPOT_OF_CITRUS	BACTERIA
27	Pectobacterium carotovorum	Bacterial Soft Rot of Banana	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_SOFT_ROT_OF_BANANA	BACTERIA
28	Xylella fastidiosa	Phony Peach Disease	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHONY_PEACH_DISEASE	BACTERIA
29	Acidovorax citrulli	Bacterial Fruit Blotch	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_FRUIT_BLOTCH	BACTERIA
30	Clavibacter michiganensis subs. michiganensis	Bacterial Canker of Tomato	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_CANKER_OF_TOMATO	BACTERIA
31	Pseudomonas syringae pv. tomato	Bacterial Speck of Tomato	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_SPECK_OF_TOMATO	BACTERIA
32	Burkholderia spp.	Bacterial Panicle Blight	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_PANICLE_BLIGHT	BACTERIA
33	Agrobacterium	Crown Gall	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CROWN_GALL	BACTERIA
34	Ralstonia solanacearum	Moko Disease	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MOKO_DISEASE	BACTERIA
35	Phytoplasma spp.	Cassava Phytoplasma Disease	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_PHYTOPLASMA_DISEASE	BACTERIA
36	Clavibacter michiganensis	Goss's Wilt	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GOSS'S_WILT	BACTERIA
37	Xylella fastidiosa subsp. pauca	Citrus Variegated Chlorosis	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_VARIEGATED_CHLOROSIS	BACTERIA
38	Candidatus Liberibacter	Citrus Greening Disease	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_GREENING_DISEASE	BACTERIA
39	Erwinia chrysanthemi	Bacterial Stalk Rot of Maize	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_STALK_ROT_OF_MAIZE	BACTERIA
40	Pseudomonas savastanoi pv. savastanoi	Olive Knot	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_KNOT	BACTERIA
41	Xanthomonas axonopodis	Bacterial Pustule	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_PUSTULE	BACTERIA
42	Xanthomonas phaseoli	Bacterial Leaf Blight	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BACTERIAL_LEAF_BLIGHT	BACTERIA
43	Xanthomonas axonopodis pv. manihotis	Cassava Bacterial Blight	Bacteria	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_BACTERIAL_BLIGHT	BACTERIA
44	Phytophthora infestans	Tomato Late Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOMATO_LATE_BLIGHT	FUNGUS
45	Oidium mangiferae	Powdery Mildew of Mango	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_MILDEW_OF_MANGO	FUNGUS
46	Mycosphaerella spp.	Late and Early Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LATE_AND_EARLY_LEAF_SPOT	FUNGUS
47	Puccinia arachidis	Peanut Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEANUT_RUST	FUNGUS
48	Colletotrichum truncatum	Anthracnose of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_SOYBEAN	FUNGUS
49	Elsinoe fawcettii	Citrus Scab	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_SCAB	FUNGUS
50	Puccinia sorghi	Common Rust of Maize	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COMMON_RUST_OF_MAIZE	FUNGUS
51	Cochliobolus miyabeanus	Brown Spot of Rice	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_SPOT_OF_RICE	FUNGUS
52	Taphrina deformans	Peach Leaf Curl	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEACH_LEAF_CURL	FUNGUS
53	Mycosphaerella musicola	Yellow  Sigatoka	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	YELLOW__SIGATOKA	FUNGUS
54	Phytophthora capsici	Blight of Pepper	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLIGHT_OF_PEPPER	FUNGUS
55	Sarocladium oryzae	Sheath Rot of Rice	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SHEATH_ROT_OF_RICE	FUNGUS
56	Setosphaeria turcica	Turcicum Leaf Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TURCICUM_LEAF_BLIGHT	FUNGUS
57	Uromyces appendiculatus	Bean Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_RUST	FUNGUS
58	Blumeriella jaapii	Cherry Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHERRY_LEAF_SPOT	FUNGUS
59	Cercospora zeae-maydis	Corn Grey Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CORN_GREY_LEAF_SPOT	FUNGUS
60	Alternaria solani	Early Blight of Potato	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EARLY_BLIGHT_OF_POTATO	FUNGUS
61	Colletotrichum gloeosporioides	Anthracnose of Citrus	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_CITRUS	FUNGUS
62	Colletotrichum graminicola	Anthracnose Leaf Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_LEAF_BLIGHT	FUNGUS
63	Mycosphaerella fijiensis	Black Sigatoka	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_SIGATOKA	FUNGUS
64	Villosiclava virens	False Smut	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FALSE_SMUT	FUNGUS
65	Colletotrichum gloeosporioides	Anthracnose of Papaya and Mango	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_PAPAYA_AND_MANGO	FUNGUS
66	Asperisporium caricae	Black Spot Disease of Papaya	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_SPOT_DISEASE_OF_PAPAYA	FUNGUS
67	Colletotrichum musae	Anthracnose of Banana	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_BANANA	FUNGUS
68	Phaeosphaeria maydis	Phaeosphaeria Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHAEOSPHAERIA_LEAF_SPOT	FUNGUS
69	Alternaria alternata	Alternaria Brown Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALTERNARIA_BROWN_SPOT	FUNGUS
70	Alternaria solani	Early Blight of Tomato	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EARLY_BLIGHT_OF_TOMATO	FUNGUS
71	Erysiphaceae	Powdery Mildew	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_MILDEW	FUNGUS
72	Venturia carpophila	Peach Scab	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEACH_SCAB	FUNGUS
73	Cercospora sojina	Frogeye Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FROGEYE_LEAF_SPOT	FUNGUS
74	Phakopsora pachyrhizi	Rust of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RUST_OF_SOYBEAN	FUNGUS
75	Venturia inaequalis	Apple Scab	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APPLE_SCAB	FUNGUS
76	Corynespora cassiicola	Target Spot of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TARGET_SPOT_OF_SOYBEAN	FUNGUS
77	Kabatiella zeae	Eyespot of Corn	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EYESPOT_OF_CORN	FUNGUS
78	Uromyces phaseoli	Rust on Blackgram	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RUST_ON_BLACKGRAM	FUNGUS
79	Monographella albescens	Leaf Scald of Rice	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_SCALD_OF_RICE	FUNGUS
80	Athelia rolfsii	Stem rot of Peanut	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STEM_ROT_OF_PEANUT	FUNGUS
81	Rhizoctonia solani	Rice Sheath Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_SHEATH_BLIGHT	FUNGUS
82	Ustilago maydis	Maize Smut	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_SMUT	FUNGUS
83	Verticillium spp.	Verticillium Wilt	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VERTICILLIUM_WILT	FUNGUS
84	Magnaporthe oryzae	Blast of Rice	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLAST_OF_RICE	FUNGUS
85	Glomerella cingulata	Anthracnose of Pepper	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_PEPPER	FUNGUS
86	Capnodium, Fumago, Scorias spp	Sooty Mold	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOOTY_MOLD	FUNGUS
87	Cercospora canescens	Cercospora Leaf Spot of Gram	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CERCOSPORA_LEAF_SPOT_OF_GRAM	FUNGUS
88	Phyllosticta arachidis-hypogaea	Phyllosticta Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHYLLOSTICTA_LEAF_SPOT	FUNGUS
89	Peronosporales	Downy Mildew	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DOWNY_MILDEW	FUNGUS
90	Phytophthora cactorum	Phytophthora Root Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHYTOPHTHORA_ROOT_ROT	FUNGUS
91	Phytophthora cactorum	Crown Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CROWN_ROT	FUNGUS
92	Erysiphe diffusa	Powdery Mildew of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_MILDEW_OF_SOYBEAN	FUNGUS
93	Phomopsis viticola	Phomopsis Cane and Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHOMOPSIS_CANE_AND_LEAF_SPOT	FUNGUS
94	Parastagonospora nodorum	Leaf and Glume Blotch of Wheat	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_AND_GLUME_BLOTCH_OF_WHEAT	FUNGUS
95	Mycovellosiella fulva	Leaf Mold of Tomato	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_MOLD_OF_TOMATO	FUNGUS
96	Fusarium oxysporum	Fusarium Wilt	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FUSARIUM_WILT	FUNGUS
97	Ascochyta sorghi	Rough Leaf Spot Of Sorghum	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROUGH_LEAF_SPOT_OF_SORGHUM	FUNGUS
98	Macrophomina phaseolina	Root Rot of Cotton	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROOT_ROT_OF_COTTON	FUNGUS
99	Sphacelotheca reiliana	Head Smut	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HEAD_SMUT	FUNGUS
100	Fusicladium oleagineum	Olive Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_LEAF_SPOT	FUNGUS
101	Colletotrichum acutatum	Anthracnose of Almond	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_ALMOND	FUNGUS
102	Mycosphaerella gossypina	Cercospora Leaf Spot of Cotton	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CERCOSPORA_LEAF_SPOT_OF_COTTON	FUNGUS
103	Tilletia caries	Common Bunt of Wheat	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COMMON_BUNT_OF_WHEAT	FUNGUS
104	Phyllosticta maculata	Freckle of Banana	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FRECKLE_OF_BANANA	FUNGUS
105	Cercospora penniseti	Millet Cercospora Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_CERCOSPORA_LEAF_SPOT	FUNGUS
106	Pyrenophora tritici-repentis	Tan Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TAN_SPOT	FUNGUS
107	Puccinia striiformis	Yellow Stripe Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	YELLOW_STRIPE_RUST	FUNGUS
108	Gymnosporangium sabinae	European Pear Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EUROPEAN_PEAR_RUST	FUNGUS
109	Puccinia porri	Leek Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEEK_RUST	FUNGUS
110	Magnaporthe salvinii	Stem Rot of RIce	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STEM_ROT_OF_RICE	FUNGUS
111	Botrytis fabae	Chocolate Spot of Broad Bean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHOCOLATE_SPOT_OF_BROAD_BEAN	FUNGUS
112	Diaporthe phaseolorum var. caulivora	Northern Stem Canker	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NORTHERN_STEM_CANKER	FUNGUS
113	Fusarium virguliforme	Sudden Death Syndrome	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUDDEN_DEATH_SYNDROME	FUNGUS
114	Monilinia fructicola	Blossom Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLOSSOM_BLIGHT	FUNGUS
115	Mycosphaerella angulata	Angular Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANGULAR_LEAF_SPOT	FUNGUS
116	Pseudocercospora angolensis	Leaf Spot of Citrus	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_SPOT_OF_CITRUS	FUNGUS
117	Gloeocercospora sorghi	Zonate Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ZONATE_LEAF_SPOT	FUNGUS
118	Cercospora beticola	Leaf Spot of Beet	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_SPOT_OF_BEET	FUNGUS
119	Alternaria cucumerina	Leaf Blight of Cucurbits	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_BLIGHT_OF_CUCURBITS	FUNGUS
120	Claviceps fusiformis	Ergot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ERGOT	FUNGUS
121	Didymella lycopersici	Didymella Stem Rot of Tomato	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DIDYMELLA_STEM_ROT_OF_TOMATO	FUNGUS
122	Rhizoctonia solani	Black Scurf	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_SCURF	FUNGUS
123	Colletotrichum lindemuthianum	Black Spot Disease	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_SPOT_DISEASE	FUNGUS
124	Phomopsis amygdali	Constriction Canker of Peach	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CONSTRICTION_CANKER_OF_PEACH	FUNGUS
125	Olpidium brassicae	Lettuce Big-Vein Disease	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LETTUCE_BIG-VEIN_DISEASE	FUNGUS
126	Cercospora melongenae	Cercospora Leaf Spot of Eggplant	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CERCOSPORA_LEAF_SPOT_OF_EGGPLANT	FUNGUS
127	Uromyces pisi-sativi	Pea Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEA_RUST	FUNGUS
128	Thanatephorus cucumeris	Bottom Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BOTTOM_ROT	FUNGUS
129	Unknown Pathogen	Bud Necrosis	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BUD_NECROSIS	FUNGUS
130	Togninia minima	Esca	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ESCA	FUNGUS
131	Monilinia spp	Jacket Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JACKET_ROT	FUNGUS
132	Armillaria mellea	Armillaria Root Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ARMILLARIA_ROOT_ROT	FUNGUS
133	Monilinia laxa	Brown Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_ROT	FUNGUS
134	Venturia pyrina	Pear Scab	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEAR_SCAB	FUNGUS
135	Glomerella gossypii	Anthracnose of Cotton	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_COTTON	FUNGUS
136	Pseudopezicula tetraspora	Angular Leaf Scorch	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANGULAR_LEAF_SCORCH	FUNGUS
137	Helminthosporium solani	Silver Scurf	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SILVER_SCURF	FUNGUS
138	Podosphaera mors-uvae	American Gooseberry Mildew	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	AMERICAN_GOOSEBERRY_MILDEW	FUNGUS
139	Stagonosporopsis cucurbitacearum	Gummy Stem Blight of Cucurbits	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GUMMY_STEM_BLIGHT_OF_CUCURBITS	FUNGUS
140	Cladosporium cucumerinum	Cucumber Scab	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUCUMBER_SCAB	FUNGUS
141	Stromatinia cepivora	White Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHITE_ROT	FUNGUS
142	Tranzschelia pruni spinosae	Plum Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PLUM_RUST	FUNGUS
143	Tilletia indica	Karnal Bunt of Wheat	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	KARNAL_BUNT_OF_WHEAT	FUNGUS
144	Oculimacula yallundae	Eyespot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EYESPOT	FUNGUS
145	Plasmopara viticola	Downy Mildew on Grape	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DOWNY_MILDEW_ON_GRAPE	FUNGUS
146	Plasmodiophora brassicae	Clubroot of Canola	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CLUBROOT_OF_CANOLA	FUNGUS
147	Mycosphaerella fragariae	Common Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COMMON_LEAF_SPOT	FUNGUS
148	Didymella applanata	Raspberry Spur Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RASPBERRY_SPUR_BLIGHT	FUNGUS
149	Phaeoramularia manihotis	White Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHITE_LEAF_SPOT	FUNGUS
150	Puccinia polysora	Southern Rust of Maize	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOUTHERN_RUST_OF_MAIZE	FUNGUS
151	Botrytis  cinerea	Botrytis Blight in Lettuce	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BOTRYTIS_BLIGHT_IN_LETTUCE	FUNGUS
152	Taphrina pruni	Pocket Plum Gall	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POCKET_PLUM_GALL	FUNGUS
153	Puccinia hordei	Brown Rust of Barley	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_RUST_OF_BARLEY	FUNGUS
154	Ceratocystis fimbriata	Pomegranate Wilt	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POMEGRANATE_WILT	FUNGUS
155	Phytophthora sojae	Stem and Root Rot of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STEM_AND_ROOT_ROT_OF_SOYBEAN	FUNGUS
156	Cronartium ribicola	White Pine Blister Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHITE_PINE_BLISTER_RUST	FUNGUS
157	Peyronellaea glomerata	Phoma Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHOMA_BLIGHT	FUNGUS
158	Uromyces viciae-fabae	Lentil Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LENTIL_RUST	FUNGUS
159	Monilinia fructigena	Brown Rot of Fruits	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_ROT_OF_FRUITS	FUNGUS
160	Diplocarpon maculatum	Pear Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEAR_LEAF_SPOT	FUNGUS
161	Valsa cincta	Dieback of Stone Fruit	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DIEBACK_OF_STONE_FRUIT	FUNGUS
162	Podosphaera aphanis	Powdery Mildew of Strawberry	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_MILDEW_OF_STRAWBERRY	FUNGUS
163	Alternaria brassicae	Black Mold	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_MOLD	FUNGUS
164	Botryotinia squamosa	Botrytis Leaf Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BOTRYTIS_LEAF_BLIGHT	FUNGUS
165	Didymella fabae	Ascochyta Blight of Lentil	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ASCOCHYTA_BLIGHT_OF_LENTIL	FUNGUS
166	Colletotrichum truncatum	Anthracnose of Lentil	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_LENTIL	FUNGUS
167	Rhizoctonia solani	Soreshin	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SORESHIN	FUNGUS
168	Apiognomonia erythrostoma	Cherry Leaf Scorch	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHERRY_LEAF_SCORCH	FUNGUS
169	Glomerella cingulata	Bitter Rot on Apple	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BITTER_ROT_ON_APPLE	FUNGUS
170	Spongospora subterranea	Powdery Scab	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_SCAB	FUNGUS
171	Eutypa lata	Dead Arm	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DEAD_ARM	FUNGUS
172	Valsa leucostoma	Valsa Disease	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VALSA_DISEASE	FUNGUS
173	Neonectria ditissima	Fruit Tree Canker	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FRUIT_TREE_CANKER	FUNGUS
174	Athelia rolfsii	Sclerotium Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SCLEROTIUM_ROT	FUNGUS
175	Phomopsis amygdali	Constriction Canker	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CONSTRICTION_CANKER	FUNGUS
176	Erysiphe necator	Powdery Mildew of Grape	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_MILDEW_OF_GRAPE	FUNGUS
177	Pyrenophora teres	Net Blotch	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NET_BLOTCH	FUNGUS
178	Plenodomus lingam	Black Leg of Rapeseed	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_LEG_OF_RAPESEED	FUNGUS
179	Phytophthora infestans	Potato Late Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO_LATE_BLIGHT	FUNGUS
180	Phytophthora nicotianae	Black Shank	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_SHANK	FUNGUS
181	Septoria glycines	Brown Spot of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_SPOT_OF_SOYBEAN	FUNGUS
182	Rhizoctonia solani	Root Rot of Lentil	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROOT_ROT_OF_LENTIL	FUNGUS
183	Magnaporthe oryzae	Pyricularia Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PYRICULARIA_LEAF_SPOT	FUNGUS
184	Ramularia beticola	Ramularia Leaf Spot of Beet	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RAMULARIA_LEAF_SPOT_OF_BEET	FUNGUS
185	Physopella zeae	Tropical Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TROPICAL_RUST	FUNGUS
186	Sclerotinia sclerotiorum	Sclerotinia Stem Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SCLEROTINIA_STEM_ROT	FUNGUS
187	Wilsonomyces carpophilus	Shothole Disease	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SHOTHOLE_DISEASE	FUNGUS
188	Glomerella cingulata	Anthracnose of Pomegranate	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_POMEGRANATE	FUNGUS
189	Fusarium graminearum	Fusarium Head Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FUSARIUM_HEAD_BLIGHT	FUNGUS
190	Alternaria alternata	Alternaria Black Spot and Fruit Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALTERNARIA_BLACK_SPOT_AND_FRUIT_ROT	FUNGUS
191	Pseudocercospora punicae	Cercospora Fruit and Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CERCOSPORA_FRUIT_AND_LEAF_SPOT	FUNGUS
192	Drepanopeziza ribis	Anthracnose of Currant & Gooseberry	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_CURRANT_&_GOOSEBERRY	FUNGUS
193	Claviceps africana	Ergot of Sorghum	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ERGOT_OF_SORGHUM	FUNGUS
194	Gibberella fujikuroi	Bakanae and Foot Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BAKANAE_AND_FOOT_ROT	FUNGUS
195	Septoria citri	Septoria Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SEPTORIA_SPOT	FUNGUS
196	Alternaria spp.	Alternaria Leaf Spot of Peanut	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALTERNARIA_LEAF_SPOT_OF_PEANUT	FUNGUS
197	Neofabraea malicorticis	Anthracnose of Apple	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_APPLE	FUNGUS
198	Macrophomina phaseolina	Ashy Stem Blight of Bean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ASHY_STEM_BLIGHT_OF_BEAN	FUNGUS
199	Chondrostereum purpureum	Silver Leaf	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SILVER_LEAF	FUNGUS
200	Trachysphaera fructigena	Cigar End Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CIGAR_END_ROT	FUNGUS
201	Pythium aphanidermatum	Chilli Damping-off	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHILLI_DAMPING-OFF	FUNGUS
202	Sphaerulina oryzina	Narrow Brown Leaf Spot of Rice	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NARROW_BROWN_LEAF_SPOT_OF_RICE	FUNGUS
203	Pseudoperonospora cubensis	Downy Mildew on Cucurbits	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DOWNY_MILDEW_ON_CUCURBITS	FUNGUS
204	Deightoniella torulosa	Black Leaf Spot of Banana	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_LEAF_SPOT_OF_BANANA	FUNGUS
205	Corynespora cassiicola	Papaya Brown Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PAPAYA_BROWN_SPOT	FUNGUS
206	Rhizoctonia solani	Rhizoctonia Root Rot of Olive	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RHIZOCTONIA_ROOT_ROT_OF_OLIVE	FUNGUS
207	Cochliobolus carbonum	Northern Corn Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NORTHERN_CORN_LEAF_SPOT	FUNGUS
208	Mycosphaerella citri	Greasy Spot of Citrus	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREASY_SPOT_OF_CITRUS	FUNGUS
209	Macrophomina phaseolina	Charcoal Stalk Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHARCOAL_STALK_ROT	FUNGUS
210	Ustilago tritici	Loose Smut	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LOOSE_SMUT	FUNGUS
211	Alternaria macrospora	Alternaria Leaf Spot of Cotton	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALTERNARIA_LEAF_SPOT_OF_COTTON	FUNGUS
212	Mycosphaerella henningsii	Brown leaf spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_LEAF_SPOT	FUNGUS
213	Epicoccum sorghi	Phoma Sorghina in Rice	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHOMA_SORGHINA_IN_RICE	FUNGUS
214	Pyrenophora graminea	Leaf Stripe of Barley	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_STRIPE_OF_BARLEY	FUNGUS
215	Phytophthora drechsleri	Phytophthora Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHYTOPHTHORA_BLIGHT	FUNGUS
216	Puccinia melanocephala	Sugarcane Common Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_COMMON_RUST	FUNGUS
217	Oidium caricae-papayae	Powdery Mildew of Papaya	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_MILDEW_OF_PAPAYA	FUNGUS
218	Podosphaera pannosa	Rose Mildew	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROSE_MILDEW	FUNGUS
219	Gaeumannomyces graminis	Take All	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TAKE_ALL	FUNGUS
220	Rhizoctonia solani	Rhizoctonia Aerial Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RHIZOCTONIA_AERIAL_BLIGHT	FUNGUS
221	Ceratocystis paradoxa	Sugarcane Pineapple Disease	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_PINEAPPLE_DISEASE	FUNGUS
222	Cercospora kikuchii	Purple Seed Stain of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PURPLE_SEED_STAIN_OF_SOYBEAN	FUNGUS
223	Colletotrichum lindemuthianum	Anthracnose of Blackgram	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_BLACKGRAM	FUNGUS
224	Botryosphaeria dothidea	Gummosis	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GUMMOSIS	FUNGUS
225	Puccinia substriata	Millet Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MILLET_RUST	FUNGUS
226	Cercospora capsici	Chilli Cercospora Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHILLI_CERCOSPORA_LEAF_SPOT	FUNGUS
227	Blumeria graminis	Powdery Mildew of Cereals	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POWDERY_MILDEW_OF_CEREALS	FUNGUS
228	Septoria lycopersici	Septoria Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SEPTORIA_LEAF_SPOT	FUNGUS
229	Diaporthe citri	Melanose	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MELANOSE	FUNGUS
230	Puccinia recondita	Brown Rust of Rye	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_RUST_OF_RYE	FUNGUS
231	Pythium aphanidermatum	Damping-Off	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAMPING-OFF	FUNGUS
232	Fusarium oxysporum	Vascular Wilt of Banana	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VASCULAR_WILT_OF_BANANA	FUNGUS
233	Uromyces ciceris-arietini	Chickpea Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICKPEA_RUST	FUNGUS
234	Phoma tracheiphila	Mal Secco	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAL_SECCO	FUNGUS
235	Monographella nivalis	Snow Mold of Cereals	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SNOW_MOLD_OF_CEREALS	FUNGUS
236	Cordana musae	Leaf Blotch of Banana	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_BLOTCH_OF_BANANA	FUNGUS
237	Penicillium spp.	Penicillium ear rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PENICILLIUM_EAR_ROT	FUNGUS
238	Macrophomina phaseolina	Charcoal Rot of Soybean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHARCOAL_ROT_OF_SOYBEAN	FUNGUS
239	Polystigma ochraceum	Almond Red Leaf Blotch	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALMOND_RED_LEAF_BLOTCH	FUNGUS
240	Mycosphaerella areola	Grey Mildew of Cotton	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREY_MILDEW_OF_COTTON	FUNGUS
241	Gibberella fujikuroi	Wilt Disease of Sugarcane	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WILT_DISEASE_OF_SUGARCANE	FUNGUS
242	Cochliobolus heterostrophus	Southern Corn Leaf Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOUTHERN_CORN_LEAF_BLIGHT	FUNGUS
243	Puccinia triticina	Wheat Leaf  Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHEAT_LEAF__RUST	FUNGUS
244	Puccinia coronata	Crown Rust of Grasses	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CROWN_RUST_OF_GRASSES	FUNGUS
245	Mycosphaerella graminicola	Septoria Tritici Blotch	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SEPTORIA_TRITICI_BLOTCH	FUNGUS
246	Gonatophragmium sp.	Red Stripe Disease	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RED_STRIPE_DISEASE	FUNGUS
247	Ascochyta rabiei	Ascochyta Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ASCOCHYTA_BLIGHT	FUNGUS
248	Phytophthora	Phytophthora Gummosis	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHYTOPHTHORA_GUMMOSIS	FUNGUS
249	Glomerella lagenarium	Anthracnose of Cucurbits	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_CUCURBITS	FUNGUS
250	Glomerella acutata	Anthracnose of Lime	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_LIME	FUNGUS
251	Sporisorium scitamineum	Smut of Sugarcane	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SMUT_OF_SUGARCANE	FUNGUS
252	Botrytis cinerea	Botrytis Blight	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BOTRYTIS_BLIGHT	FUNGUS
253	Elsinoe ampelina	Anthracnose of Grape	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ANTHRACNOSE_OF_GRAPE	FUNGUS
254	Fusarium solani f. sp. phaseoli	Dry Root Rot of Bean	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DRY_ROOT_ROT_OF_BEAN	FUNGUS
255	Puccinia graminis	Wheat Stem Rust	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHEAT_STEM_RUST	FUNGUS
256	Pseudocercospora cladosporioides	Cercospora Leaf Spot of Olive	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CERCOSPORA_LEAF_SPOT_OF_OLIVE	FUNGUS
257	Rhynchosporium secalis	Rhynchosporium	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RHYNCHOSPORIUM	FUNGUS
258	Phyllosticta citricarpa	Citrus Black Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_BLACK_SPOT	FUNGUS
259	Botryosphaeria rhodina	Mango Dieback Disease	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_DIEBACK_DISEASE	FUNGUS
260	Botryosphaeriaceae	Botryosphaeria Dieback	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BOTRYOSPHAERIA_DIEBACK	FUNGUS
261	Fusarium verticillioides	Fusarium Ear Rot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FUSARIUM_EAR_ROT	FUNGUS
262	Ramularia collo-cygni	Ramularia Leaf Spot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RAMULARIA_LEAF_SPOT	FUNGUS
263	Magnaporthe oryzae	Wheat Blast	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHEAT_BLAST	FUNGUS
264	Plasmodiophora brassicae	Clubroot	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CLUBROOT	FUNGUS
265	Balansia oryzae-sativae	Udbatta Disease of Rice	Fungus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	UDBATTA_DISEASE_OF_RICE	FUNGUS
266	Paracoccus marginatus	Mealybug on Papaya	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MEALYBUG_ON_PAPAYA	INSECT
267	Aphidoidea family	Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APHID	INSECT
268	Cnaphalocrocis medinalis	Rice Leafroller	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_LEAFROLLER	INSECT
269	Myzus persicae	Green Peach Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREEN_PEACH_APHID	INSECT
270	Leptinotarsa decemlineata	Potato Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO_BEETLE	INSECT
271	Hishimonus phycitis	Jassids on Eggplant	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JASSIDS_ON_EGGPLANT	INSECT
272	Eriosoma lanigerum	Woolly Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WOOLLY_APHID	INSECT
273	Chilo partellus	Spotted Stemborer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SPOTTED_STEMBORER	INSECT
274	Dicladispa armigera	Rice Hispa	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_HISPA	INSECT
275	Procontarinia mangiferae	Mango Blister Midge	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_BLISTER_MIDGE	INSECT
276	Phyllocnistis citrella	Citrus Leaf Miner	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_LEAF_MINER	INSECT
277	Toxotrypana curvicauda	Papaya Fruit Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PAPAYA_FRUIT_FLY	INSECT
278	Cerotoma trifurcata	Bean Leaf Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_LEAF_BEETLE	INSECT
279	Dialeurodes citri	Citrus Whitefly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_WHITEFLY	INSECT
280	Agromyzidae spp.	Leaf Miner Flies	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_MINER_FLIES	INSECT
281	Lyonetia clerkella	Apple Leaf Miner	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APPLE_LEAF_MINER	INSECT
282	Scirpophaga incertulas	Yellow Stem Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	YELLOW_STEM_BORER	INSECT
283	Sesamia inferens	Violet Stem Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VIOLET_STEM_BORER	INSECT
284	Ostrinia nubilalis	European Corn Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EUROPEAN_CORN_BORER	INSECT
285	Helicoverpa zea	Corn Earworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CORN_EARWORM	INSECT
286	Empoasca kerri	Jassids on Peanut	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JASSIDS_ON_PEANUT	INSECT
287	Pseudococcidae	Mealybug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MEALYBUG	INSECT
288	Icerya purchasi	Cottony Cushion Scale	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COTTONY_CUSHION_SCALE	INSECT
289	Ceratitis cosyra	Mango Fruit Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_FRUIT_FLY	INSECT
290	Psylliodes	Flea Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FLEA_BEETLE	INSECT
291	Trialeurodes vaporariorum	Greenhouse Whitefly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREENHOUSE_WHITEFLY	INSECT
292	Order Thysanoptera	Thrips	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	THRIPS	INSECT
293	Gryllotalpa africana	African Mole Cricket	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	AFRICAN_MOLE_CRICKET	INSECT
294	Zonocerus variegatus	Variegated Grasshopper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VARIEGATED_GRASSHOPPER	INSECT
295	Agrotis ipsilon	Black Cutworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_CUTWORM	INSECT
296	Spodoptera frugiperda	Fall Armyworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FALL_ARMYWORM	INSECT
297	Drosicha mangiferae	Mealybug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MEALYBUG	INSECT
298	Cryptomyzus ribis	Redcurrant Blister Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	REDCURRANT_BLISTER_APHID	INSECT
299	Amrasca devastans	Cotton Leaf Hopper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COTTON_LEAF_HOPPER	INSECT
300	Stenodiplosis sorghicola	Sorghum Midge	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SORGHUM_MIDGE	INSECT
301	Helicoverpa armigera	Helicoverpa on Soybean	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HELICOVERPA_ON_SOYBEAN	INSECT
302	Autographa nigrisigna	Semilooper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SEMILOOPER	INSECT
303	Aspidiotus destructor	Banana Scale Insect	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_SCALE_INSECT	INSECT
304	Lampides boeticus	Pea Blue Butterfly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEA_BLUE_BUTTERFLY	INSECT
305	Bactrocera dorsalis	Oriental Fruit Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ORIENTAL_FRUIT_FLY	INSECT
306	Oxya intricata	Rice Grasshopper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_GRASSHOPPER	INSECT
307	Amsacta albistriga	Red Hairy Caterpillar	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RED_HAIRY_CATERPILLAR	INSECT
308	Altica ampelophaga	Vine Flea Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VINE_FLEA_BEETLE	INSECT
309	Pectinophora gossypiella	Pink Bollworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PINK_BOLLWORM	INSECT
310	Leptocorisa spp.	Rice Bug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_BUG	INSECT
311	Bactrocera oleae	Olive Fruit Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_FRUIT_FLY	INSECT
312	Pelopidas mathias	Rice Skipper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_SKIPPER	INSECT
313	Elasmopalpus lignosellus	Lesser cornstalk borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LESSER_CORNSTALK_BORER	INSECT
314	Saissetia oleae	Black Scale	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_SCALE	INSECT
315	Stictococcus vayssierei	Cassava Root Mealybug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_ROOT_MEALYBUG	INSECT
316	Mamestra brassicae	Cabbage Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CABBAGE_MOTH	INSECT
317	Lepidiota stigma	Sugarcane White Grub	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_WHITE_GRUB	INSECT
318	Spodoptera litura	Cut Worm on Banana	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUT_WORM_ON_BANANA	INSECT
319	Hyalopterus pruni	Mealy Plum Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MEALY_PLUM_APHID	INSECT
320	Brevennia rehi	Rice Mealybug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_MEALYBUG	INSECT
321	Colaspis hypochlora	Banana Fruit-Scarring Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_FRUIT-SCARRING_BEETLE	INSECT
322	Sternochetus mangiferae	Mango Nut Weevil	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_NUT_WEEVIL	INSECT
323	Nephotettix spp.	Green Paddy Leafhoppers	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREEN_PADDY_LEAFHOPPERS	INSECT
324	Archips argyrospila	Fruit Tree Leafroller	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FRUIT_TREE_LEAFROLLER	INSECT
325	Hedylepta indicata	Bean Leaf Webber	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_LEAF_WEBBER	INSECT
326	Diatraea saccharalis	Sugarcane Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_BORER	INSECT
327	Ceratitis capitata	Mediterranean Fruit Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MEDITERRANEAN_FRUIT_FLY	INSECT
328	Aleurothrixus floccosus	Citrus Wolly Whitefly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_WOLLY_WHITEFLY	INSECT
329	Odoiporus longicollis	Pseudostem Weevil	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PSEUDOSTEM_WEEVIL	INSECT
330	Chaetanaphothrips signipennis	Banana Rust Thrips	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_RUST_THRIPS	INSECT
331	Eublemma olivacea	Eggplant Leaf Roller	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EGGPLANT_LEAF_ROLLER	INSECT
332	Eupoecilia ambiguella	Grape Bud Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPE_BUD_MOTH	INSECT
333	Sternechus subsignatus	Soybean Stalk Weevil	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOYBEAN_STALK_WEEVIL	INSECT
334	Urbanus proteus	Bean Leafroller	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_LEAFROLLER	INSECT
335	Aphis spiraecola	Green Citrus Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREEN_CITRUS_APHID	INSECT
336	Frankliniella occidentalis	Western Flower Thrips	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WESTERN_FLOWER_THRIPS	INSECT
337	Lygus hesperus	Western Plant Bug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WESTERN_PLANT_BUG	INSECT
338	Parlatoria ziziphi	Black Parlatoria Scale	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_PARLATORIA_SCALE	INSECT
339	Euschistus spp.	Stink Bugs on Corn, Millet and Sorghum	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STINK_BUGS_ON_CORN,_MILLET_AND_SORGHUM	INSECT
340	Hydrellia philippina	Whorl Maggot	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHORL_MAGGOT	INSECT
341	Melanitis leda	Greenhorned Caterpillars	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREENHORNED_CATERPILLARS	INSECT
342	Grapholita molesta	Oriental Fruit Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ORIENTAL_FRUIT_MOTH	INSECT
343	Lobesia botrana	Grape Berry Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPE_BERRY_MOTH	INSECT
344	Pericallia ricini	Castor Hairy Caterpillar	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASTOR_HAIRY_CATERPILLAR	INSECT
345	Helicoverpa armigera	Tomato Fruit Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOMATO_FRUIT_BORER	INSECT
346	Scirtothrips  spp.	Thrips in Mango	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	THRIPS_IN_MANGO	INSECT
347	Rhagoletis cerasi	Cherry Fruit Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHERRY_FRUIT_FLY	INSECT
348	Nacoleia octasema	Banana Scab Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_SCAB_MOTH	INSECT
349	Scirtothrips citri	Citrus Thrips	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_THRIPS	INSECT
350	Etiella zinckenella	Pea Pod Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEA_POD_BORER	INSECT
351	Pieris	Small and Large Cabbage White	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SMALL_AND_LARGE_CABBAGE_WHITE	INSECT
352	Anthonomus grandis	Boll Weevil	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BOLL_WEEVIL	INSECT
353	Metcalfa pruinosa	Citrus Flatid Plant Hopper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_FLATID_PLANT_HOPPER	INSECT
354	Citripestis eutraphera	Mango Fruit Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_FRUIT_BORER	INSECT
355	Phytomyza gymnostoma	Onion Leaf Miner	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ONION_LEAF_MINER	INSECT
356	Diabrotica spp.	Cucumber Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUCUMBER_BEETLE	INSECT
357	Opogona sacchari	Banana Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_MOTH	INSECT
358	Toxoptera aurantii	Black Citrus Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_CITRUS_APHID	INSECT
359	Hylesinus toranio	Olive Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_BORER	INSECT
360	Deanolis albizonalis	Mango Seed Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_SEED_BORER	INSECT
361	Anticarsia gemmatalis	Velvetbean Caterpillar	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VELVETBEAN_CATERPILLAR	INSECT
362	Sparganothis pilleriana	Grapevine Leafroller	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPEVINE_LEAFROLLER	INSECT
363	Spodoptera mauritia	Paddy Swarming Caterpillar	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PADDY_SWARMING_CATERPILLAR	INSECT
364	Mythimna separata	Rice Ear-Cutting Caterpillar	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_EAR-CUTTING_CATERPILLAR	INSECT
365	Nilaparvata lugens	Brown Planthopper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_PLANTHOPPER	INSECT
366	Scirtothrips dorsalis	Pomegranate Thrips	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POMEGRANATE_THRIPS	INSECT
367	Procontarinia pustulata	Mango Gall Midge	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_GALL_MIDGE	INSECT
368	Orseolia oryzae	Asian Rice Gall Midge	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ASIAN_RICE_GALL_MIDGE	INSECT
369	Euphyllura olivina	Olive Psyllid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_PSYLLID	INSECT
370	Aleyrodes proletella	Cabbage Whitefly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CABBAGE_WHITEFLY	INSECT
371	Zeugodacus cucurbitae	Melon Fruit Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MELON_FRUIT_FLY	INSECT
372	Monosteira unicostata	Poplar Lace Bug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POPLAR_LACE_BUG	INSECT
373	Parapoynx stagnalis	Rice Case Worm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_CASE_WORM	INSECT
374	Phthorimaea operculella	Potato Tuber Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO_TUBER_MOTH	INSECT
375	Operophtera brumata	Winter Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WINTER_MOTH	INSECT
376	Euproctis fraterna	Hairy Caterpillars	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HAIRY_CATERPILLARS	INSECT
377	Lacanobia oleracea	Bright Line Brown Eye	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BRIGHT_LINE_BROWN_EYE	INSECT
378	Bemisia tabaci	Silverleaf Whitefly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SILVERLEAF_WHITEFLY	INSECT
379	Chilo infuscatellus	Early Shoot Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EARLY_SHOOT_BORER	INSECT
380	Apsylla cistellata	Mango Shoot Psyllid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_SHOOT_PSYLLID	INSECT
381	Coniesta ignefusalis	Stem Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STEM_BORER	INSECT
382	Maruca testulalis	Spotted Pod Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SPOTTED_POD_BORER	INSECT
383	Epinotia aporema	Bean Shoot Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_SHOOT_BORER	INSECT
384	Drepanothrips reuteri	Grape Thrips	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPE_THRIPS	INSECT
385	Helicoverpa armigera	Gram Pod Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAM_POD_BORER	INSECT
386	Trialeurodes packardi	Strawberry Whitefly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STRAWBERRY_WHITEFLY	INSECT
387	Anthonomus rubi	Strawberry Blossom Weevil	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STRAWBERRY_BLOSSOM_WEEVIL	INSECT
388	Scolytus mali	Fruit Tree Bark Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FRUIT_TREE_BARK_BEETLE	INSECT
389	Tibraca limbativentris	Rice Stalk Stinkbug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_STALK_STINKBUG	INSECT
390	Myzus cerasi	Black Cherry Aphid	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BLACK_CHERRY_APHID	INSECT
391	Leucinodes orbonalis	Brinjal Fruit Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BRINJAL_FRUIT_BORER	INSECT
392	Cosmopolites sordidus	Root Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROOT_BORER	INSECT
393	Stenchaetothrips biformis	Rice Thrips	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_THRIPS	INSECT
394	Helicoverpa armigera	Cotton Bollworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COTTON_BOLLWORM	INSECT
395	Empoasca decipiens	Green Leafhopper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GREEN_LEAFHOPPER	INSECT
396	Argyrotaenia ljungiana	Grape Tortrix Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPE_TORTRIX_MOTH	INSECT
397	Stephanitis typica	Banana Lace Wing Bug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_LACE_WING_BUG	INSECT
398	Chamaepsila rosae	Carrot Fly	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CARROT_FLY	INSECT
399	Parlatoria oleae	Olive Scale	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_SCALE	INSECT
400	Delia platura	Onion Maggots	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ONION_MAGGOTS	INSECT
401	Chlumetia transversa	Mango Shoot Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_SHOOT_BORER	INSECT
402	Otiorhynchus cribricollis	Curculio Weevil	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CURCULIO_WEEVIL	INSECT
403	Euschistus servus	Stink Bug on Cotton	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STINK_BUG_ON_COTTON	INSECT
404	Scolytus amygdali	Almond Bark Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALMOND_BARK_BEETLE	INSECT
405	Empoasca vitis	Leafhopper on Grape	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAFHOPPER_ON_GRAPE	INSECT
406	Phloeotribus scarabaeoides	Olive Bark Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_BARK_BEETLE	INSECT
407	Aonidomytilus albus	Cassava scale	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_SCALE	INSECT
408	Yponomeutidae	Ermine Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ERMINE_MOTH	INSECT
409	Idioscopus spp.	Mango Hoppers	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO_HOPPERS	INSECT
410	Mythimna separata	Oriental Armyworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ORIENTAL_ARMYWORM	INSECT
411	Spodoptera eridania	Southern Armyworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOUTHERN_ARMYWORM	INSECT
412	Heliocheilus albipunctella	Head Miner	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HEAD_MINER	INSECT
413	Anarsia lineatella	Peach Twig Borer	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEACH_TWIG_BORER	INSECT
414	Epilachna vigintioctopunctata	Leaf Eating Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LEAF_EATING_BEETLE	INSECT
415	Cydia pomonella	Codling Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CODLING_MOTH	INSECT
416	Spodoptera litura	Tobacco Caterpillar	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOBACCO_CATERPILLAR	INSECT
417	Prays oleae	Olive Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_MOTH	INSECT
418	Holotrichia spp.	White Grub on Peanut	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHITE_GRUB_ON_PEANUT	INSECT
419	Acrosternum hilare	Stink Bugs on Soybean	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STINK_BUGS_ON_SOYBEAN	INSECT
420	Tuta Absoluta	Tuta Absoluta	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TUTA_ABSOLUTA	INSECT
421	Palpita unionalis	Jasmine Moth	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	JASMINE_MOTH	INSECT
422	Aspidiotus nerii	Oleander Scale	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLEANDER_SCALE	INSECT
423	Ophiusa melicerta	Castor Semilooper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASTOR_SEMILOOPER	INSECT
424	Oulema melanopus	Cereal Leaf Beetle	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CEREAL_LEAF_BEETLE	INSECT
425	Helicoverpa armigera	Bean Bollworm	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_BOLLWORM	INSECT
426	Forficula auricularia	European Earwig	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EUROPEAN_EARWIG	INSECT
427	Gargaphia solani	Eggplant Lace Bug	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EGGPLANT_LACE_BUG	INSECT
428	Pseudoplusia includens	Soybean Looper	Insect	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOYBEAN_LOOPER	INSECT
429	Tetranychus urticae	Common Red Spider Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COMMON_RED_SPIDER_MITE	MITE
430	Panonychus ulmi	European Red Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EUROPEAN_RED_MITE	MITE
431	Panonychus citri	Citrus Red Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_RED_MITE	MITE
432	Raoiella indica	Red Palm Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RED_PALM_MITE	MITE
433	Calepitrimerus vitis	Grape Rust Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPE_RUST_MITE	MITE
434	Mononychellus tanajoa	Cassava Green Spider Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_GREEN_SPIDER_MITE	MITE
435	Bryobia rubrioculus	Brown Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROWN_MITE	MITE
436	Eriophyes pyri	Pear Leaf Blister Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEAR_LEAF_BLISTER_MITE	MITE
437	Eotetranychus carpini	Yellow Vine Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	YELLOW_VINE_MITE	MITE
438	Aceria sheldoni	Citrus Bud Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_BUD_MITE	MITE
439	Steneotarsonemus spinki	Rice Panicle Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_PANICLE_MITE	MITE
440	Oxycenus maxwelli	Olive Bud Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OLIVE_BUD_MITE	MITE
441	Oligonychus mangiferus	Mango  Spider Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MANGO__SPIDER_MITE	MITE
442	Oligonychus oryzae	Rice Leaf Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_LEAF_MITE	MITE
443	Colomerus vitis	Grape Blister Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPE_BLISTER_MITE	MITE
444	Eriophyidae	Gall Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GALL_MITE	MITE
445	Polyphagotarsonemus latus	Broad Mite	Mite	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BROAD_MITE	MITE
446	Meloidogyne spp.	Root-Knot Nematode	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROOT-KNOT_NEMATODE	OTHER
447	Meloidogyne ethiopica	Root-Knot Nematode in Soybean	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROOT-KNOT_NEMATODE_IN_SOYBEAN	OTHER
448	Class Gastropoda	Slug	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SLUG	OTHER
449	PLS	Physiological Leaf Spot	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PHYSIOLOGICAL_LEAF_SPOT	OTHER
450	Sagittaria montevidensis	Giant Arrowhead	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GIANT_ARROWHEAD	OTHER
451	Alkalinity	Alkalinity	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALKALINITY	OTHER
452	Anguina tritici	Ear Cockle Eelworm	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EAR_COCKLE_EELWORM	OTHER
453	Cricetidae	Vole	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	VOLE	OTHER
454	Tylenchulus semipenetrans	Citrus Nematode	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_NEMATODE	OTHER
455	Heterodera glycines	Cyst Nematode	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CYST_NEMATODE	OTHER
456	Biomphalaria spp.	Biomphalaria Snails	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BIOMPHALARIA_SNAILS	OTHER
457	Pratylenchus spp.	Lesion Nematode	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LESION_NEMATODE	OTHER
458	Abiotic Sunburn	Abiotic Sunburn	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ABIOTIC_SUNBURN	OTHER
459	Abiotic Sunburn	Abiotic Sunburn in Pistachio	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ABIOTIC_SUNBURN_IN_PISTACHIO	OTHER
460	Nematoda	Nematode	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NEMATODE	OTHER
461	Fertilizer Burn	Fertilizer or Pesticide Burn	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FERTILIZER_OR_PESTICIDE_BURN	OTHER
462	Cephaleuros virescens	Algal Leaf Spot	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ALGAL_LEAF_SPOT	OTHER
463	Pomacea canaliculata	Golden Apple Snail	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GOLDEN_APPLE_SNAIL	OTHER
464	Healthy	Healthy	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HEALTHY	OTHER
465	Pesticide Burn	Pesticide Burn	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PESTICIDE_BURN	OTHER
466	MYMV	Mungbean Yellow Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MUNGBEAN_YELLOW_MOSAIC_VIRUS	VIRUS
467	ULCV	Urd Bean Leaf Crinkle Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	URD_BEAN_LEAF_CRINKLE_VIRUS	VIRUS
468	BCMV	Bean Common Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_COMMON_MOSAIC_VIRUS	VIRUS
469	PBND	Bud Necrosis Disease	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BUD_NECROSIS_DISEASE	VIRUS
470	PRSV	Ring Spot Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RING_SPOT_VIRUS	VIRUS
471	PapMV	Papaya Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PAPAYA_MOSAIC_VIRUS	VIRUS
472	CMV	Cucumber Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUCUMBER_MOSAIC_VIRUS	VIRUS
473	APMV	Apple Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	APPLE_MOSAIC_VIRUS	VIRUS
474	Watermelon mosaic virus	Watermelon mosaic virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WATERMELON_MOSAIC_VIRUS	VIRUS
475	CEVd	Citrus Exocortis Viroid	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_EXOCORTIS_VIROID	VIRUS
476	PNRSV Prunus necrotic ringspot virus	Stecklenberger Disease	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STECKLENBERGER_DISEASE	VIRUS
477	GLD	Grapevine Leafroll Disease	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GRAPEVINE_LEAFROLL_DISEASE	VIRUS
478	PVY	Potato Y Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO_Y_VIRUS	VIRUS
479	CCDV	Citrus Chlorotic Dwarf Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_CHLOROTIC_DWARF_VIRUS	VIRUS
480	PLRV	Potato Leafroll Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO_LEAFROLL_VIRUS	VIRUS
481	BGMV	Bean Golden Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_GOLDEN_MOSAIC_VIRUS	VIRUS
482	Tobacco Streak Virus	Tobacco Streak Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOBACCO_STREAK_VIRUS	VIRUS
483	CGMMV	Cucumber Green Mottle Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUCUMBER_GREEN_MOTTLE_VIRUS	VIRUS
484	MSV	Maize Leaf Streak Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_LEAF_STREAK_VIRUS	VIRUS
485	Plum pox virus	Plum Pox Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PLUM_POX_VIRUS	VIRUS
486	Banana Streak Virus	Banana Streak Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_STREAK_VIRUS	VIRUS
487	PVX	Potato X Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	POTATO_X_VIRUS	VIRUS
488	CBSV	Cassava Brown Streak Disease	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_BROWN_STREAK_DISEASE	VIRUS
489	RTBV	Tungro	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TUNGRO	VIRUS
490	PaLCV	Papaya Leaf Curl	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PAPAYA_LEAF_CURL	VIRUS
491	PPSMV	Sterility Mosaic	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STERILITY_MOSAIC	VIRUS
492	SMV	Soybean Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOYBEAN_MOSAIC_VIRUS	VIRUS
493	WDV	Wheat Dwarf Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WHEAT_DWARF_VIRUS	VIRUS
494	MLND	Maize Lethal Necrosis Disease	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MAIZE_LETHAL_NECROSIS_DISEASE	VIRUS
495	TYLCV	Tomato Yellow Leaf Curl Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOMATO_YELLOW_LEAF_CURL_VIRUS	VIRUS
496	CMV	Cucumber Mosaic Virus on Banana	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CUCUMBER_MOSAIC_VIRUS_ON_BANANA	VIRUS
497	BBrMV	Banana Bract Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BANANA_BRACT_MOSAIC_VIRUS	VIRUS
498	ToMV	Tomato Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOMATO_MOSAIC_VIRUS	VIRUS
499	Bunchy Top Virus	Bunchy Top Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BUNCHY_TOP_VIRUS	VIRUS
500	ACMV	Cassava Mosaic Disease	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CASSAVA_MOSAIC_DISEASE	VIRUS
501	CPsV	Citrus Psorosis Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_PSOROSIS_VIRUS	VIRUS
502	RYMV	Rice Yellow Mottle Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	RICE_YELLOW_MOTTLE_VIRUS	VIRUS
503	BYMV	Bean Yellow Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEAN_YELLOW_MOSAIC_VIRUS	VIRUS
504	TSWV	Tomato Spotted Wilt Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TOMATO_SPOTTED_WILT_VIRUS	VIRUS
505	OYDV	Onion Yellow Dwarf Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ONION_YELLOW_DWARF_VIRUS	VIRUS
506	CTV	Citrus Tristeza Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_TRISTEZA_VIRUS	VIRUS
507	SCMV	Sugarcane Mosaic Virus	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SUGARCANE_MOSAIC_VIRUS	VIRUS
508	Citrus leprosis virus sensu lato	Citrus Leprosis	Virus	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CITRUS_LEPROSIS	VIRUS
509	Striga hermonthica	Striga	Weed	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	STRIGA	WEED
\.


--
-- Data for Name: document; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.document (document_id, name, valid_until, type, thumbnail_url, notes, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, no_expiration, archived) FROM stdin;
\.


--
-- Data for Name: emailToken; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."emailToken" (user_id, farm_id, created_at, updated_at, times_sent, invitation_id) FROM stdin;
71978196-0c51-11ee-a334-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	2023-06-16 16:24:03.307118+02	2023-06-16 16:24:40.195+02	2	719d27f4-0c51-11ee-a334-7ac3b12dfaeb
71978196-0c51-11ee-a334-7ac3b12dfaeb	018861de-0c53-11ee-ab8a-7ac3b12dfaeb	2023-06-16 16:38:56.820294+02	2023-06-16 16:38:56.820294+02	1	8630a306-0c53-11ee-8281-7ac3b12dfaeb
\.


--
-- Data for Name: farm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farm (farm_id, farm_name, address, units, grid_points, deleted, farm_phone_number, created_by_user_id, updated_by_user_id, created_at, updated_at, sandbox_farm, country_id, owner_operated, default_initial_location_id, utc_offset) FROM stdin;
4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Greenthumb Farm	60180 BC-99, Squamish, BC V8B 0P6, Canada	{"currency": "CAD", "measurement": "metric"}	{"lat": 49.8924726, "lng": -123.1601915}	f	\N	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 15:22:10.254+02	2023-06-13 15:22:10.254+02	f	37	\N	\N	-28800
018861de-0c53-11ee-ab8a-7ac3b12dfaeb	UBC Farm	49.250945, -123.238492	{"currency": "CAD", "measurement": "metric"}	{"lat": 49.250945, "lng": -123.238492}	f	\N	5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	2023-06-16 16:35:14.256+02	2023-06-16 16:35:20.403+02	f	37	f	\N	-28800
\.


--
-- Data for Name: farmDataSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."farmDataSchedule" (request_number, farm_id, is_processed, created_at, user_id, has_failed) FROM stdin;
\.


--
-- Data for Name: farmExpense; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."farmExpense" (farm_id, expense_date, picture, note, expense_type_id, farm_expense_id, value, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
4d39c914-09ed-11ee-8209-7ac3b12dfaeb	2023-06-16 16:14:10.204+02	\N	Cement	69974a58-09ea-11ee-81ec-7ac3b12dfaeb	186d7a9a-0c50-11ee-a334-7ac3b12dfaeb	200	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:14:24.175+02	2023-06-16 16:14:24.175+02
4d39c914-09ed-11ee-8209-7ac3b12dfaeb	2023-06-16 16:14:35.297+02	\N	Water pump	69974a44-09ea-11ee-81ec-7ac3b12dfaeb	36676894-0c50-11ee-b84a-7ac3b12dfaeb	600	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:15:14.471+02	2023-06-16 16:15:14.471+02
4d39c914-09ed-11ee-8209-7ac3b12dfaeb	2023-06-16 16:15:30.981+02	\N	Maize	69974a4f-09ea-11ee-81ec-7ac3b12dfaeb	47d4ab32-0c50-11ee-99a5-7ac3b12dfaeb	200	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:15:43.708+02	2023-06-16 16:15:43.708+02
4d39c914-09ed-11ee-8209-7ac3b12dfaeb	2023-06-16 16:16:02.312+02	\N	Diesel	69974a3a-09ea-11ee-81ec-7ac3b12dfaeb	57c8ee7c-0c50-11ee-8dcc-7ac3b12dfaeb	40	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:16:10.475+02	2023-06-16 16:16:10.475+02
4d39c914-09ed-11ee-8209-7ac3b12dfaeb	2023-06-16 16:16:19.714+02	\N	Grazing land	69974a4e-09ea-11ee-81ec-7ac3b12dfaeb	6632f1f6-0c50-11ee-99a5-7ac3b12dfaeb	4000	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:16:34.658+02	2023-06-16 16:16:34.658+02
\.


--
-- Data for Name: farmExpenseType; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."farmExpenseType" (expense_name, farm_id, expense_type_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, expense_translation_key) FROM stdin;
Equipment	\N	699743b4-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	EQUIPMENT
Pesticide	\N	69974a26-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PESTICIDE
Fuel	\N	69974a3a-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FUEL
Machinery	\N	69974a44-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MACHINERY
Land	\N	69974a4e-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	LAND
Seeds	\N	69974a4f-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SEEDS
Other	\N	69974a58-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OTHER
Soil Amendment	\N	69974a08-09ea-11ee-81ec-7ac3b12dfaeb	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOIL_AMENDMENT
\.


--
-- Data for Name: farm_external_integration; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farm_external_integration (farm_id, partner_id, organization_uuid, webhook_id) FROM stdin;
\.


--
-- Data for Name: farm_site_boundary; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.farm_site_boundary (location_id) FROM stdin;
708a3da6-09f5-11ee-8b51-7ac3b12dfaeb
\.


--
-- Data for Name: fence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fence (location_id, pressure_treated) FROM stdin;
3e8a6104-09f6-11ee-ab47-7ac3b12dfaeb	t
\.


--
-- Data for Name: fertilizer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fertilizer (fertilizer_id, fertilizer_type, moisture_percentage, n_percentage, nh4_n_ppm, p_percentage, k_percentage, farm_id, mineralization_rate, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, fertilizer_translation_key) FROM stdin;
1	compost (manure)	40	1.5	0	0.5	0.5	\N	0.1	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COMPOST_MANURE
2	compost (HIP)	0	2.2	0	0.9	0.8	\N	0.1	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	COMPOST_HIP
3	Beef-feedlot- solid (dry)	72	0.42	44	0.13	0.67	\N	0.3	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEEF-FEEDLOT-_SOLID_DRY
4	Beef-feedlot- solid (moist)	77	0.68	368	0.15	0.3	\N	0.3	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEEF-FEEDLOT-_SOLID_MOIST
5	Beef- liquid	86	0.28	77	0.09	0.19	\N	0.3	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BEEF-_LIQUID
6	Chicken-broiler (general)	50	2.26	3423	0.91	1.14	\N	0.55	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICKEN-BROILER_GENERAL
7	Chicken-broiler (manure aged outdoors)	70	1.91	3095	0.8	1.14	\N	0.55	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICKEN-BROILER_MANURE_AGED_OUTDOORS
8	Chicken-broiler (manure fresh from barn)	25	2.97	4078	1.05	1.04	\N	0.55	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICKEN-BROILER_MANURE_FRESH_FROM_BARN
9	Chicken-broiler breeder	46	1.25	3096	0.84	1.71	\N	0.55	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICKEN-BROILER_BREEDER
10	Chicken-layer	50	2.26	3889	1.13	1.51	\N	0.55	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CHICKEN-LAYER
11	Dairy- solid (dry)	72	0.76	317	0.2	0.43	\N	0.21	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAIRY-_SOLID_DRY
12	Dairy- solid (moist)	77	0.39	797	0.1	0.3	\N	0.21	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAIRY-_SOLID_MOIST
13	Dairy- liquid (thick slurry)	86	0.4	1760	0.08	0.3	\N	0.21	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAIRY-_LIQUID_THICK_SLURRY
14	Dairy- liquid (medium slurry)	93.5	0.28	1450	0.06	0.25	\N	0.21	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAIRY-_LIQUID_MEDIUM_SLURRY
15	Dairy- liquid (quite watery)	96.5	0.2	1110	0.04	0.16	\N	0.21	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAIRY-_LIQUID_QUITE_WATERY
16	Dairy- liquid (very watery)	98.5	0.13	730	0.02	0.12	\N	0.21	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DAIRY-_LIQUID_VERY_WATERY
17	Goat (dairy)	65	1.04	2818	0.28	1.03	\N	0.21	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	GOAT_DAIRY
18	Hog- liquid	82	0.33	2211	0.1	0.15	\N	0.4	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HOG-_LIQUID
19	Hog- solid	82	0.86	525	0.42	0.5	\N	0.4	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HOG-_SOLID
20	Horse	83	0.32	268	0.09	0.25	\N	0.2	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HORSE
21	Mink	54	3.28	14151	1.82	0.79	\N	0.2	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	MINK
22	Sheep	68	0.87	2784	0.34	0.76	\N	0.2	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SHEEP
23	Turkey (manure aged >7 weeks out of barn)	70	0.87	1281	0.44	0.59	\N	0.55	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TURKEY_MANURE_AGED_>7_WEEKS_OUT_OF_BARN
24	Turkey (manure fresh from barn <7 weeks)	33	1.79	2518	0.79	1.31	\N	0.55	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TURKEY_MANURE_FRESH_FROM_BARN_<7_WEEKS
25	Biosolids- anaerobically digested & dewatered	70	1.47	2940	0.9	0.03	\N	0.18	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BIOSOLIDS-_ANAEROBICALLY_DIGESTED_&_DEWATERED
\.


--
-- Data for Name: field; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field (location_id, station_id, organic_status, transition_date) FROM stdin;
dc4e4516-09f3-11ee-8a72-7ac3b12dfaeb	\N	Organic	\N
0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb	\N	Transitional	2023-11-20
174542c8-09f4-11ee-a5ad-7ac3b12dfaeb	\N	Non-Organic	\N
\.


--
-- Data for Name: field_work_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field_work_task (task_id, field_work_type_id, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
3	4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:38:20.299+02	2023-06-14 16:38:20.299+02
9	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:13:39.134+02	2023-06-15 13:13:39.134+02
10	10	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:20:20.56+02	2023-06-15 13:20:20.56+02
11	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:40:28.999+02	2023-06-15 13:40:28.999+02
12	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:40:41.587+02	2023-06-15 13:40:41.587+02
13	10	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:46:51.237+02	2023-06-15 13:46:51.237+02
14	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:48:10.063+02	2023-06-15 13:48:10.063+02
15	11	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:48:53.5+02	2023-06-15 13:48:53.5+02
16	10	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:53:01.224+02	2023-06-15 13:53:01.224+02
17	10	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:18:57.475+02	2023-06-15 14:18:57.475+02
18	12	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:19:53.863+02	2023-06-15 14:19:53.863+02
\.


--
-- Data for Name: field_work_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.field_work_type (field_work_type_id, farm_id, field_work_name, field_work_type_translation_key, created_by_user_id, updated_by_user_id, created_at, updated_at, deleted) FROM stdin;
1	\N	Covering soil	COVERING_SOIL	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
2	\N	Fencing	FENCING	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
3	\N	Preparing beds or rows	PREPARING_BEDS_OR_ROWS	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
4	\N	Pruning	PRUNING	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
5	\N	Shade cloth	SHADE_CLOTH	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
6	\N	Termination	TERMINATION	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
7	\N	Tillage	TILLAGE	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
8	\N	Weeding	WEEDING	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f
9	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	A custom task	A CUSTOM TASK	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:13:39.081754+02	2023-06-15 13:13:39.081754+02	f
10	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Another custom task	ANOTHER CUSTOM TASK	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:20:20.496879+02	2023-06-15 13:20:20.496879+02	f
11	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	custom 10	CUSTOM 10	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:48:53.487254+02	2023-06-15 13:48:53.487254+02	f
12	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	new task 997	NEW TASK 997	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:19:52.456745+02	2023-06-15 14:19:52.456745+02	f
\.


--
-- Data for Name: figure; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.figure (figure_id, type, location_id) FROM stdin;
dc5152f6-09f3-11ee-8a72-7ac3b12dfaeb	field	dc4e4516-09f3-11ee-8a72-7ac3b12dfaeb
06048672-09f4-11ee-a5ad-7ac3b12dfaeb	field	0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb
174579c8-09f4-11ee-a5ad-7ac3b12dfaeb	field	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb
4cf69070-09f4-11ee-a5ad-7ac3b12dfaeb	greenhouse	4cf5ec6a-09f4-11ee-a5ad-7ac3b12dfaeb
6d95cb52-09f4-11ee-aed0-7ac3b12dfaeb	garden	6d94e98a-09f4-11ee-aed0-7ac3b12dfaeb
8fa8e986-09f4-11ee-aed0-7ac3b12dfaeb	buffer_zone	8fa803ae-09f4-11ee-aed0-7ac3b12dfaeb
ba9aac6a-09f4-11ee-8b51-7ac3b12dfaeb	residence	ba99defc-09f4-11ee-8b51-7ac3b12dfaeb
eac37bb0-09f4-11ee-8b51-7ac3b12dfaeb	barn	eac2e4de-09f4-11ee-8b51-7ac3b12dfaeb
708b4c14-09f5-11ee-8b51-7ac3b12dfaeb	farm_site_boundary	708a3da6-09f5-11ee-8b51-7ac3b12dfaeb
dd1d3c16-09f5-11ee-ba1d-7ac3b12dfaeb	water_valve	dd1ba5ae-09f5-11ee-ba1d-7ac3b12dfaeb
fe401d46-09f5-11ee-ab47-7ac3b12dfaeb	water_valve	fe3fc0da-09f5-11ee-ab47-7ac3b12dfaeb
147efbf4-09f6-11ee-ab47-7ac3b12dfaeb	gate	147e86ce-09f6-11ee-ab47-7ac3b12dfaeb
3e8adaee-09f6-11ee-ab47-7ac3b12dfaeb	fence	3e8a6104-09f6-11ee-ab47-7ac3b12dfaeb
6d9a3ae6-09f6-11ee-ab47-7ac3b12dfaeb	watercourse	6d99bcb0-09f6-11ee-ab47-7ac3b12dfaeb
\.


--
-- Data for Name: file; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.file (file_id, document_id, file_name, url, thumbnail_url) FROM stdin;
\.


--
-- Data for Name: garden; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garden (location_id, organic_status, transition_date, station_id) FROM stdin;
6d94e98a-09f4-11ee-aed0-7ac3b12dfaeb	Non-Organic	\N	\N
\.


--
-- Data for Name: gate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gate (location_id) FROM stdin;
147e86ce-09f6-11ee-ab47-7ac3b12dfaeb
\.


--
-- Data for Name: greenhouse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.greenhouse (location_id, organic_status, transition_date, supplemental_lighting, co2_enrichment, greenhouse_heated) FROM stdin;
4cf5ec6a-09f4-11ee-a5ad-7ac3b12dfaeb	Non-Organic	\N	\N	\N	\N
\.


--
-- Data for Name: harvest_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.harvest_task (task_id, projected_quantity, projected_quantity_unit, harvest_everything, actual_quantity, actual_quantity_unit) FROM stdin;
1	\N	kg	t	\N	kg
7	\N	kg	t	\N	kg
\.


--
-- Data for Name: harvest_use; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.harvest_use (harvest_use_id, task_id, harvest_use_type_id, quantity, quantity_unit) FROM stdin;
\.


--
-- Data for Name: harvest_use_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.harvest_use_type (harvest_use_type_id, harvest_use_type_name, farm_id, harvest_use_type_translation_key) FROM stdin;
1	Sales	\N	SALES
2	Self-Consumption	\N	SELF-CONSUMPTION
3	Animal Feed	\N	ANIMAL_FEED
4	Compost	\N	COMPOST
5	Gift	\N	GIFT
6	Exchange	\N	EXCHANGE
7	Saved for seed	\N	SAVED_FOR_SEED
8	Not Sure	\N	NOT_SURE
11	Other	\N	OTHER
\.


--
-- Data for Name: hs_code; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hs_code (hs_code_id, description) FROM stdin;
46	Manufactures Of Straw, Of Esparto Or Of Other Plaiting Materials; Basket-Ware And Wickerwork
603	Cut flowers and flower buds of a kind suitable for bouquets or\nfor ornamental purposes, fresh, dried, dyed, bleached,\nimpregnated or otherwise prepared
604	Foliage, branches and other parts of plants, without flowers or\nflower buds, and grasses, mosses and lichens, being goods\nof a kind suitable for bouquets or for ornamental purposes,\nfresh, dried, dyed, bleached, impregnated or otherwise\nprepared
704	Cabbage
705	Lettuce and Chicory, fresh or chilled
706	CARROTS, TURNIPS, SALAD BEETROOT, SALSIFY, CELERIAC, RADISHES AND SIMILAR EDIBLE ROOTS, FRESH OR CHILLED
709	Other Vegetables, Fresh or Chilled
714	Manioc, arrowroot, salep, Jerusalem artichokes, sweet potatoes and similar roots and tubers with high starch or inulin content, fresh, chilled, frozen or dried, whether or not sliced or in the form of pellets, sago pith
810	Other fruit
902	Tea
904	Pepper (genus Piper), dried or crushed or ground fruit
906	Cinnamon and Cinnamon Tree Flowers
908	Nutmeg, Mace and Cardamoms
909	Anise Seeds
910	Ginger, saffron, turmeric (curcuma), thyme, bay leaves, curry\nand other spices
1006	Rice
1202	Peanuts
1211	Plants and parts (including seeds and fruits), of a kind used primarily in perfumery, in pharmacy or for insecticidal, fungicidal or similar purposes, fresh, chilled, frozen or dried, whether or not cut, crushed or powdered
1214	Rutabagas (swedes), mangolds, fodder roots, hay, alfalfa\n(lucerne), clover, sainfoin, forage kale, lupines, vetches and\nsimilar forage products, whether or not in the form of pellets
1302	
1319	Other tropical fruit
1511	Palm oil and its fractions, whether or not refined, but not\nchemically modified
1514	Rapeseed, colza or mustard oil, and fractions thereof, whether\nor not refined, but not chemically modified
2401	Unmanufactured tabacco
3301	Essential oil
3805	Gum, wood or sulfate turpentine
4001	Natural rubber, balata, gutta-percha, guayule, chicle and similar\nnatural gums, in primary forms or in plates, sheets or strip
4403	Wood in the rough, whether or not stripped of bark or sapwood, or roughly squared
5302	True hemp (Cannabis sativa L.), raw or processed but not\nspun; tow and waste of true hemp (including yarn waste and\ngarnetted stock)
5303	Jute and other textile bast fibres (excluding flax, true hemp and ramie), raw or processed but not spun; tow and waste of these fibres (including yarn waste and garnetted stock)
5306	Flax Yarn
8011	Coconut
8012	Brazil nuts
8013	Cashew nuts
8071	Melons, watermelon
8119	Other fruits
12149	Rutabaga
60240	Roses (grafted or not)
70200	Tomato, fresh or chilled
70310	Onions and Shallots, fresh or chilled
70420	Brussels Sprouts, Fresh or Chilled
70690	Salad Beets, Radishes, Etc NESOI, Fresh or Chilled
70700	Cucumbers and Gherkins, Fresh or Chilled
70920	Asparagus, Fresh or Chilled
70930	Eggplants, Fresh or Chilled
70940	Celery Other Than Celeriac, Fresh or Chilled
70951	Mushrooms
70960	Peppers
70991	Artichokes, fresh or chilled
70992	Olives, Fresh or Chilled
70993	Pumpkins, Squash and Gourds, Fresh or Chilled
71320	Chickpeas, Dried Shelled, Include Seed
71333	Beans (Vigna spp., Phaseolus spp.): (con.)\nKidney beans, including white pea beans (Phaseolus\nvulgaris)
71339	Dried, shelled beans Vigna and Phaseolus, whether or not skinned or split (excl. beans of species Vigna mungo [L.] Hepper or Vigna radiata [L.] Wilczek, small red Adzuki beans, kidney beans, Bambara beans and cow peas)
71360	Pigeon peas, dried and shelled
71430	Yams
80200	Other
80212	Almonds, fresh or dried, shelled or peeled
80221	Hazelnut
80231	Walnuts fresh or dried
80242	Chestnuts, Shelled, Fresh or Dried
80420	Figs, Fresh or Dried
80450	Guavas, Mangoes and Mangosteens, Fresh or Dried
80510	Orange, Fresh
80540	Grapefruit, Including Pomelos
80620	Grapes, Dried
80719	Other melon: Cantaloupe
80830	Pears
80920	Cherries, Sweet or Tart, Fresh
80930	Peaches, Including Nectarines, Fresh
80940	Plums, Prune and Sloes, Fresh
90100	Coffee, whether or not roasted or decaffeinated; coffee husks\nand skins; coffee substitutes containing coffee in any\nproportion
90200	Tea
90300	Maté
90411	Pepper of the genus Piper, whole
90500	Vanilla
90700	Clove
91010	Ginger
91030	Turmuric
100119	Durum Wheat NESOI
100199	Wheat and Meslin NESOI
100300	Barley
100490	Oats, NESOI
100590	Maize other than seed corn
100620	Rice
100790	Sorghum Grain, NESOI
110313	Groats And Meal Of Corn (maize)
120190	Soybeans, NESOI
120600	Sunflower Seeds, Whether or Not Broken
120721	Cottonseeds
120740	Sesame seeds
120791	Poppy Seeds, whether or not broken
121010	Hops cones, fresh or dried
121190	Plants, parts,seeds & fruits,nes,f perfumery/pharm/insect/fung/sim,fr/chd/frz/dr
121292	Locust beans (carob)
121930	Sugar Cane
130211	Opium
130219	Yacon syrup
151219	Sunflower seed oil, Saffower Oil, Refined, Fract. Etc.
190300	Tapioca and tapioca substitutes
320120	Wattle extract
330121	Geranium for Essential Oils
520100	Cotton, not carded or combed
530500	Coconut, abaca (Manila hemp or Musa textilis Nee), ramie and\nother vegetable textile fibers, not elsewhere specified or\nincluded, raw or processed but not spun; tow, noils and waste\nof these fibers (including yarn waste and garnetted stock)
6029060	Other live plants (with soil attached to roots)
6031901	Cut flowers and flower buds of a kind suitable for bouquets or\nfor ornamental purposes, fresh, dried, dyed, bleached,\nimpregnated or otherwise prepared
7032000	Garlic
7039000	Leeks, alliaceous, vegetables
7041000	Cauliflowers and Headed Broccoli
7049090	Kohlrabi, Kale, Similar
7052900	Chicory, Fresh or Chilled
7061010	Carrots, fresh or chilled
7061020	Turnips, fresh or chilled
7069010	Celeriac, Fresh or Chilled
7069020	Other Radish
7069030	Salad beetroot
7096010	Sweet Peppers, Bell Peppers
7099910	Chayote (fresh or dried)
7099990	Other Vegetables, Fresh or Chilled
7101000	Potato, fresh or chilled
7103000	Spinach, New Zealand spinach and orache spinach (garden spinach)
7122000	Onions, dried, cut, broken or in powder but not further prepared
7129050	Marjoram, Oregano
7131000	Peas, dried and shelled
7131010	Peas, Pisum, Sativum
7133400	Bambara Beans
7133500	Cowpeas
7134000	Lentils, Dried and shelled
7135000	Broad Beans (Vicia Faba Var Major) and Horse Beans (Vicia faba Var Equina, Vicia Faba Var Minor)
7141000	Manioc (Cassava) fresh, chilled, frozen
7142000	Sweet Potatoes
7144000	Taro, Colocasia, spp.
7149090	Jerusalem, artichokes, similar
8025100	Pistachio
8026100	Macadamia Nuts
8027000	Cola spp.
8029010	Pecans, fresh or dried
8039010	Bananas and plantains, fresh or dried
8041000	Dates, Fresh or Dried
8043000	Pineapples, fresh or dried
8052100	Mandarins, Tangerines and Satsumas
8055000	Lemon (Citrus limon, Citrus limonum) and limes (Citrus aurantifolia, Citrus latifolia)
8061010	Grapes, Fresh, Table
8071100	Watermelons
8072000	Papaws, Papayas
8081000	Apples
8084000	Quinces
8091000	Fresh apricots
8101000	Strawberries, fresh
8102010	Fresh raspberries
8102090	Fresh blackberries, mulberries and loganberries
8103000	Gooseberries
8104000	Cranberries, blueberries and other fruits of the genus Vaccinium
8107000	Fresh persimmon
8109040	Custard Apple
8109060	Lychee, Lichi
8109090	Jackfruit
8109093	Sapodilla
8109094	Pomegranate, soursop, sweetsop, bell fruit, marian plum, passion fruit, cottonfruit, jujube and tampoi/rambal
8109099	Fresh Fig, Morguz, Baru
8131000	Dried Apricots
8132000	Prunes, Dried Fruit
8134090	Other fruits
9041190	Pink Peppercorns
9042211	Dried chilli
9092100	Coriander
9096131	Caraway or Fennel Seeds
9109927	Mustard
9109931	Wild, thyme, Thymus
10019110	Spelt, seed, sowing
10051018	Maize, Hybrid Seed
10081000	Buckwheat
10082130	Cereals, Seed
10082920	Millet Seed
10085000	Quinoa
10086000	Triticale
10089000	amaranth, wild rice, and other less-known grains
10089090	Other Cereals
11010000	Maslin flour
11042985	Rye, grains, sliced
12071000	Palm nuts and kernels
12079991	Hemp seeds
12091000	Sugar beet, seed
12092100	Lucerne (alfalfa) seeds
12092280	Clover, Trifolium, spp.
12092500	Rye grass (Lolium multiflorium Lam., Lolium perenne\nL.) seeds
12092960	Fodder, beet seed
12092990	Sudan Grass
12099100	Vegetable seed
12099150	Parsley
12119026	Pyrethrum
12119029	Leaves, powder, flowers and pods: Other
12119039	Plants and parts of plants (including seeds and fruits), of a kind used primarily in perfumery, in pharmacy or for insecticidal, fungicidal or similar purpose, fresh or dried, whether or not cut, crushed or powdered
12119094	Basil, Hyssop, Rosemary, Sage and Savory
12119099	Sunn Hemp
12149090	Hay, Lucerne, Clover
13021990	Ginko Biloba
14011000	Vegetable materials of a kind used primarily for plaiting (for\nexample, bamboos, rattans, reeds, rushes, osier, raffia,\ncleaned, bleached or dyed cereal straw, and lime bark)
14041019	Henna powder
15153090	Castor oil
15159011	Tung, jojoba, oiticica
15159091	Flaxseed Oil
17011200	Beet, Sugar
17026090	Other sugars, including chemically pure lactose, maltose,\nglucose and fructose, in solid form; sugar syrups not containing\nadded flavoring or coloring matter; artificial honey, whether or\nnot mixed with natural honey; caramel
17049010	Liquorice Extract
18010000	Cocoa Beans, whole or broken, raw or roasted
19053290	Chia Seeds
21069030	Betel nut ("supari")
22029020	Other Fruit Pulp, Fruit Drinks
32011000	Quebracho extract
33012942	Lemon grass oil
33012979	Lavender, Terpeneless essential oil
33013099	Copaiba balsam
33019090	Bergamot Essential Oil
33049910	Shea butter
44072100	Mahogany (timber) spp.
48070090	Sorrel
53041010	Sisal fibre
53089010	Ramie yarn
53089090	Other vegetable textile fibers
97112233	Pimenta Allspice
703900000	Chives, fresh
706909020	Horseradish, fresh or chilled
709990500	Jicama and Breadfruit
709992000	Other vegetables, fresh or chilled; Other; Other; Chard (or white beet) and cardoons
709999020	Okra, fresh or chilled
805100040	Mandarins (including tangerines and satsumas);\nclementines, wilkings and similar citrus hybrids
810902010	Other fresh fruit (Tamarinds, cashew apples, lychees, jackfruit, sapodilla plums, passion fruit, carambola and pitahaya)\t810902090
810902090	Other fresh fruit (Tamarinds, cashew apples, lychees, jackfruit, sapodilla plums, passion fruit, carambola and pitahaya)
1209299130	Birdsfoot trefoil
1209918054	Parsnip
1211908630	Mint, fresh or chilled
1214900018	Timothy Hay, Whether Or Not In The Form Of Pellets
2938900000	Stevia
1211908620	Basil (holy, sweet), fresh or chilled
4407290185	Jatoba
\.


--
-- Data for Name: integrating_partner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.integrating_partner (partner_id, partner_name, access_token, refresh_token, root_url, deactivated) FROM stdin;
1	Ensemble Scientific	\N	\N	https://api.esci.io/	f
0	No Integrating Partner	\N	\N	https://api.app.litefarm.org/	f
\.


--
-- Data for Name: irrigation_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irrigation_task (task_id, irrigation_type_name, estimated_flow_rate, estimated_duration, estimated_duration_unit, estimated_flow_rate_unit, location_id, estimated_water_usage, estimated_water_usage_unit, application_depth, application_depth_unit, measuring_type, irrigation_type_id, percent_of_location_irrigated, default_location_flow_rate, default_location_application_depth, default_irrigation_task_type_location, default_irrigation_task_type_measurement) FROM stdin;
4	SPRINKLER	\N	\N	\N	\N	4cf5ec6a-09f4-11ee-a5ad-7ac3b12dfaeb	5000.000000000000	l	\N	\N	DEPTH	6	\N	f	f	f	f
\.


--
-- Data for Name: irrigation_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.irrigation_type (irrigation_type_id, irrigation_type_name, farm_id, default_measuring_type, created_by_user_id, updated_by_user_id, created_at, updated_at, deleted, irrigation_type_translation_key) FROM stdin;
1	HAND_WATERING	\N	VOLUME	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f	HAND_WATERING
2	CHANNEL	\N	VOLUME	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f	CHANNEL
3	DRIP	\N	VOLUME	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f	DRIP
4	FLOOD	\N	VOLUME	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f	FLOOD
5	PIVOT	\N	DEPTH	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f	PIVOT
6	SPRINKLER	\N	DEPTH	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f	SPRINKLER
7	SUB_SURFACE	\N	VOLUME	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	f	SUB_SURFACE
\.


--
-- Data for Name: knex_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations (id, name, batch, migration_time) FROM stdin;
1	20180517190849_create_lite_farm_db.js	1	2023-06-13 15:01:29.22+02
2	20180826153304_deleteFarmCrop.js	1	2023-06-13 15:01:29.234+02
3	20180827135325_addFieldName.js	1	2023-06-13 15:01:29.235+02
4	20180827142733_addPriceAndYield.js	1	2023-06-13 15:01:29.239+02
5	20180828165910_fixPriceTable.js	1	2023-06-13 15:01:29.24+02
6	20180910054802_drop_seedlog_column.js	1	2023-06-13 15:01:29.241+02
7	20180910062336_remove_unnecessary_columns.js	1	2023-06-13 15:01:29.241+02
8	20180911034029_add_c_to_soil_data_table.js	1	2023-06-13 15:01:29.242+02
9	20180911040842_add_depth_to_soil_data.js	1	2023-06-13 15:01:29.242+02
10	20181213080718_add_harvest_log.js	1	2023-06-13 15:01:29.244+02
11	20181215131030_consistent_units.js	1	2023-06-13 15:01:29.247+02
12	20181229170458_unit_conversion_sale_quantity.js	1	2023-06-13 15:01:29.247+02
13	20190103113052_delete_column_in_farm_expense.js	1	2023-06-13 15:01:29.249+02
14	20190103120409_update_expense_id_data_type.js	1	2023-06-13 15:01:29.251+02
15	20190103120541_add_id_to_farm_expense.js	1	2023-06-13 15:01:29.251+02
16	20190103162144_update_farm_expense.js	1	2023-06-13 15:01:29.253+02
17	20190124160146_change_farmExpense_value_type.js	1	2023-06-13 15:01:29.254+02
18	20190220112318_change_field_model.js	1	2023-06-13 15:01:29.254+02
19	20190221214442_change_yield_table.js	1	2023-06-13 15:01:29.255+02
20	20190221223936_add_field_crop_column.js	1	2023-06-13 15:01:29.255+02
21	20190223021522_update_yield.js	1	2023-06-13 15:01:29.256+02
22	20190305205638_remove_unused_tables.js	1	2023-06-13 15:01:29.257+02
23	20190308183222_add_water_balance_table.js	1	2023-06-13 15:01:29.259+02
24	20190311140416_create_weather_table.js	1	2023-06-13 15:01:29.261+02
25	20190317170211_rename.js	1	2023-06-13 15:01:29.261+02
26	20190317171241_rename_typo_in_column.js	1	2023-06-13 15:01:29.261+02
27	20190325144916_nitrogen_balance_table.js	1	2023-06-13 15:01:29.264+02
28	20190416183353_add_column_in_fertilizer.js	1	2023-06-13 15:01:29.264+02
29	20190416204632_crop_create_column_nutrient_credits.js	1	2023-06-13 15:01:29.265+02
30	20190728205619_add_is_pseudo_to_users.js	1	2023-06-13 15:01:29.265+02
31	20190806193220_update_shift.js	1	2023-06-13 15:01:29.266+02
32	20190830065614_add_bed_config_to_field_crop.js	1	2023-06-13 15:01:29.267+02
33	20190912175155_add_has_consent_to_users.js	1	2023-06-13 15:01:29.267+02
34	20190925134531_add_is_active_to_users.js	1	2023-06-13 15:01:29.267+02
35	20191022141313_change_wage_name_in_shift.js	1	2023-06-13 15:01:29.268+02
36	20191029154420_nitrogen_schedule_changes.js	1	2023-06-13 15:01:29.268+02
37	20191203123105_water_balance_tables.js	1	2023-06-13 15:01:29.271+02
38	20191203220239_update_crop_sale_to_float.js	1	2023-06-13 15:01:29.273+02
39	20191204144643_change_production_and_revenue_to_float.js	1	2023-06-13 15:01:29.275+02
40	20200116073247_add_farm_data_schedule_table.js	1	2023-06-13 15:01:29.276+02
41	20200116080158_add_user_id_to_farm_data.js	1	2023-06-13 15:01:29.277+02
42	20200310174929_add_farm_geolocation.js	1	2023-06-13 15:01:29.277+02
43	20200312082442_change_shift_task_duration_to_float.js	1	2023-06-13 15:01:29.278+02
44	20200408111941_alter_weather_hourly.js	1	2023-06-13 15:01:29.279+02
45	20200415164120_add_crop_id_to_cropSale.js	1	2023-06-13 15:01:29.281+02
46	20200427154215_remove_flow_rate_unit_in_irrrrigation_log.js	1	2023-06-13 15:01:29.281+02
47	20200429142239_make_flags_in_crop_nullable.js	1	2023-06-13 15:01:29.283+02
48	20200430133453_make_field_crop_area_float.js	1	2023-06-13 15:01:29.283+02
49	20200505124117_update_insert_new_crops_into_crop_with_fc_variety.js	1	2023-06-13 15:01:29.286+02
50	20200508135516_add_sanbox_bool_to_farm.js	1	2023-06-13 15:01:29.287+02
51	20200529132839_add_role_table.js	1	2023-06-13 15:01:29.288+02
52	20200529132842_add_user_farm_table.js	1	2023-06-13 15:01:29.29+02
53	20200529140525_add_roles_in_role.js	1	2023-06-13 15:01:29.29+02
54	20200602123113_migrate_user_data_to_userFarm.js	1	2023-06-13 15:01:29.291+02
55	20200602123120_has_consent_default_null.js	1	2023-06-13 15:01:29.291+02
56	20200603161246_remove_has_consent_and_is_admin_in_users.js	1	2023-06-13 15:01:29.292+02
57	202006151420_update_is_deleted_to_enum.js	1	2023-06-13 15:01:29.293+02
58	20200617081549_add_has_failed_to_data_schedule.js	1	2023-06-13 15:01:29.293+02
59	20200617100116_add_consent_version_to_user_farm.js	1	2023-06-13 15:01:29.294+02
60	20200623233314_add_permissions_table.js	1	2023-06-13 15:01:29.295+02
61	20200623234118_add_role_permissions_table.js	1	2023-06-13 15:01:29.297+02
62	20200623235501_add_permissions_values.js	1	2023-06-13 15:01:29.298+02
63	20200625144918_add_role_permissions_for_owner.js	1	2023-06-13 15:01:29.299+02
64	20200629074209_insert_pseudo_into_role.js	1	2023-06-13 15:01:29.299+02
65	20200629074702_add_wage_to_userfarm.js	1	2023-06-13 15:01:29.3+02
66	20200629080929_migrate_user_to_userfarm.js	1	2023-06-13 15:01:29.3+02
67	20200629081242_drop_flags_in_users.js	1	2023-06-13 15:01:29.301+02
68	20200630153142_add_role_permissions_for_manager.js	1	2023-06-13 15:01:29.302+02
69	20200630153458_add_role_permissions_for_worker.js	1	2023-06-13 15:01:29.303+02
70	20200630230342_alter_tables_with_user_id.js	1	2023-06-13 15:01:29.304+02
71	20200630231959_add_constraint_back_in_tables.js	1	2023-06-13 15:01:29.305+02
72	20200713160251_make_email_token_table.js	1	2023-06-13 15:01:29.307+02
73	20200817123803_station_binding_field.js	1	2023-06-13 15:01:29.311+02
74	20200827181039_default_field_units_USD.js	1	2023-06-13 15:01:29.311+02
75	20200827181040_seed_dev_db.js	1	2023-06-13 15:01:29.755+02
76	20200909102630_add_deleted_fields_for_soft_delete.js	1	2023-06-13 15:01:29.757+02
77	20200909142215_revoke_fieldCrop_permissions.js	1	2023-06-13 15:01:29.757+02
78	20200909151455_revoke_crop_permissions.js	1	2023-06-13 15:01:29.757+02
79	20200910114040_remove_worker_farm_permissions.js	1	2023-06-13 15:01:29.758+02
80	20200911151628_revoke_fertilizer_permissions.js	1	2023-06-13 15:01:29.758+02
81	20200912193740_revoke_pesticides_permissions.js	1	2023-06-13 15:01:29.759+02
82	20200912223308_revoke_tasktype_permissions.js	1	2023-06-13 15:01:29.759+02
83	20200914084206_revoke_diseases_permissions.js	1	2023-06-13 15:01:29.759+02
84	20200914092550_revoke_field_permissions.js	1	2023-06-13 15:01:29.76+02
85	20200914104732_logs_permissions.js	1	2023-06-13 15:01:29.76+02
86	20200921102320_add_deleted_fields_for_soft_delete_sprint_10.js	1	2023-06-13 15:01:29.761+02
87	20200921132142_revoke_yield_permissions.js	1	2023-06-13 15:01:29.762+02
88	20200923133256_revoke_price_permissions.js	1	2023-06-13 15:01:29.762+02
89	20200923162536_remove_add_delete_insight_permission_worker.js	1	2023-06-13 15:01:29.762+02
90	20200925085526_contact_permissions.js	1	2023-06-13 15:01:29.762+02
91	20200925091712_contact_role_permissions.js	1	2023-06-13 15:01:29.763+02
92	20200925115409_revoke_sales_permissions.js	1	2023-06-13 15:01:29.763+02
93	20200927195821_revoke_user_farm_permissions.js	1	2023-06-13 15:01:29.763+02
94	20200928093041_revoke_expense_permissions.js	1	2023-06-13 15:01:29.763+02
95	20200928152121_add_edit_wage_permission.js	1	2023-06-13 15:01:29.763+02
96	20200928204035_revoke_expense_type_permissions.js	1	2023-06-13 15:01:29.764+02
97	20200929080937_assign_edit_wage_permission.js	1	2023-06-13 15:01:29.764+02
98	20200930112911_revoke_create_user.js	1	2023-06-13 15:01:29.764+02
99	20201004094857_revoke_user_farm_data_permissions.js	1	2023-06-13 15:01:29.764+02
100	20201006100131_extension_officer_role.js	1	2023-06-13 15:01:29.765+02
101	20201006100356_shift_to_user_farm.js	1	2023-06-13 15:01:29.77+02
102	20201006101636_add_role_permissions_for_extension_officer.js	1	2023-06-13 15:01:29.77+02
103	20201006150656_shift_permissions.js	1	2023-06-13 15:01:29.771+02
104	20201006160344_shift_task_soft_delete.js	1	2023-06-13 15:01:29.771+02
105	20201020130156_currency_table.js	1	2023-06-13 15:01:29.772+02
106	20201020143747_populate_currency_table.js	1	2023-06-13 15:01:29.775+02
107	20201021143233_userFarm_onboarding_flags.js	1	2023-06-13 15:01:29.775+02
108	20201021144207_prepopulate_old_userfarms.js	1	2023-06-13 15:01:29.776+02
109	20201028144119_update_userFarm_model.js	1	2023-06-13 15:01:29.776+02
110	20201028144657_repopulate_old_userFarms.js	1	2023-06-13 15:01:29.777+02
111	20201101141537_organic_certifier_survey.js	1	2023-06-13 15:01:29.78+02
112	20201105073821_remove_sandbox_bool.js	1	2023-06-13 15:01:29.78+02
113	20201105174954_reset_onboarding_flag.js	1	2023-06-13 15:01:29.781+02
114	20201123084954_adjust_crops_unique_constraints.js	1	2023-06-13 15:01:29.782+02
115	20201123095722_change_phone_number_type_to_varchar.js	1	2023-06-13 15:01:29.783+02
116	20201124084345_organic_certifier_survey_soft_delete.js	1	2023-06-13 15:01:29.783+02
117	20201124110018_activityLog_traceability.js	1	2023-06-13 15:01:29.785+02
118	20201124123610_crop_farm_field_traceability.js	1	2023-06-13 15:01:29.798+02
119	20201126141225_add_password_field_to_user.js	1	2023-06-13 15:01:29.799+02
120	20201130123842_change_user_id_to_uuid.js	1	2023-06-13 15:01:29.799+02
121	20201211172116_create_password_table.js	1	2023-06-13 15:01:29.801+02
122	20201213193913_user_log.js	1	2023-06-13 15:01:29.802+02
123	20201216112245_user_language_preference.js	1	2023-06-13 15:01:29.803+02
124	20201218152152_crop_translation_key.js	1	2023-06-13 15:01:29.828+02
125	20201222100509_support_ticket.js	1	2023-06-13 15:01:29.83+02
126	20201228120831_disease_translation_key.js	1	2023-06-13 15:01:29.88+02
127	20201229104428_task_translation_key.js	1	2023-06-13 15:01:29.882+02
128	20201229105935_expense_translation_key.js	1	2023-06-13 15:01:29.883+02
129	20201229222113_fertilizer_translation_key.js	1	2023-06-13 15:01:29.886+02
130	20201230134628_user_status.js	1	2023-06-13 15:01:29.89+02
131	20201230233531_users_migration.js	1	2023-06-13 15:01:29.891+02
132	20210106130016_user_gender_birth_year_fields.js	1	2023-06-13 15:01:29.892+02
133	20210106205453_populate_user_created_crop_crop_translation_key.js	1	2023-06-13 15:01:29.892+02
134	20210107132124_add_farm_id_to_userlog.js	1	2023-06-13 15:01:29.893+02
135	20210107142330_add_reason_to_userlog_table.js	1	2023-06-13 15:01:29.893+02
136	20210107143205_update_userlog_column_name.js	1	2023-06-13 15:01:29.893+02
137	20210107175714_email_token_usage.js	1	2023-06-13 15:01:29.894+02
138	20210111030604_invitation_token_id.js	1	2023-06-13 15:01:29.896+02
139	20210115131743_user_status_id_field_name.js	1	2023-06-13 15:01:29.896+02
140	20210118145110_init_transtation_keys_for_old_taskType_disease_fertilizer.js	1	2023-06-13 15:01:29.897+02
141	20210119080357_create_harvest_use_type_table.js	1	2023-06-13 15:01:29.898+02
142	20210119080538_populate_harvest_use_type_table.js	1	2023-06-13 15:01:29.898+02
143	20210119083540_create_harvest_use_table.js	1	2023-06-13 15:01:29.9+02
144	20210119124628_update_harvest_use_type_table.js	1	2023-06-13 15:01:29.9+02
145	20210122092206_update_havestUseType_table.js	1	2023-06-13 15:01:29.901+02
146	20210122094151_delete_other_from_harvestUseType.js	1	2023-06-13 15:01:29.901+02
147	20210122094916_add_other_to_harvestUseType.js	1	2023-06-13 15:01:29.901+02
148	20210124221953_shift_simplification.js	1	2023-06-13 15:01:29.902+02
149	20210127103046_harvest_use_type_translation.js	1	2023-06-13 15:01:29.904+02
150	20210128085529_shift_break_extra_mood.js	1	2023-06-13 15:01:29.904+02
151	20210129162452_alter-user-address-column-name.js	1	2023-06-13 15:01:29.904+02
152	20210130122403_nullable-userLog-fields.js	1	2023-06-13 15:01:29.906+02
153	20210209104509_restore_expense_permission.js	1	2023-06-13 15:01:29.906+02
154	20210210092322_sale-shift-task-base-attribute-fields.js	1	2023-06-13 15:01:29.909+02
155	20210210121239_drop_deprecated_tables.js	1	2023-06-13 15:01:29.911+02
156	20210212080558_restore_delete_sale_permission.js	1	2023-06-13 15:01:29.911+02
157	20210212081223_crop_sale_remove_unused_columns.js	1	2023-06-13 15:01:29.912+02
158	20210216115859_update-delete-shift-permission.js	1	2023-06-13 15:01:29.912+02
159	20210217144051_grant_worker_delete_log_permission.js	1	2023-06-13 15:01:29.912+02
160	20210217154605_harvest_use_type_add_permission.js	1	2023-06-13 15:01:29.913+02
161	20210218112700_remove_donation.js	1	2023-06-13 15:01:29.913+02
162	20210221163824_drop_old_references.js	1	2023-06-13 15:01:29.913+02
163	20210224135647_position_refactor.js	1	2023-06-13 15:01:29.935+02
164	20210301181739_add_color.js	1	2023-06-13 15:01:29.936+02
165	20210302164953_field_rename.js	1	2023-06-13 15:01:29.937+02
166	20210303115142_drop_color.js	1	2023-06-13 15:01:29.937+02
167	20210303161506_rename_ground_water.js	1	2023-06-13 15:01:29.938+02
168	20210308104404_location_permissions.js	1	2023-06-13 15:01:29.938+02
169	20210310163740_farm_site_boundary.js	1	2023-06-13 15:01:29.94+02
170	20210315114308_water_valve_additional_properties.js	1	2023-06-13 15:01:29.94+02
171	20210318143105_unit_and_gardon_migration.js	1	2023-06-13 15:01:29.944+02
172	20210319102334_create_showed_tutorial_table.js	1	2023-06-13 15:01:29.946+02
173	20210323094100_update_greenhouse_table.js	1	2023-06-13 15:01:29.946+02
174	20210323094628_water_valve_unit.js	1	2023-06-13 15:01:29.947+02
175	20210323140906_update_line_area_unit_enum.js	1	2023-06-13 15:01:29.947+02
176	20210324015426_update_location_number_type.js	1	2023-06-13 15:01:29.955+02
177	20210326151021_creek_rename.js	1	2023-06-13 15:01:29.956+02
178	20210326174617_drop_used_for_irrigation_from_watercourse.js	1	2023-06-13 15:01:29.956+02
179	20210415125151_sandbox_farm_flag.js	1	2023-06-13 15:01:29.957+02
180	20210416134130_certification_certifier_migration.js	1	2023-06-13 15:01:29.966+02
181	20210419101858_add_country_id_to_farm_table.js	1	2023-06-13 15:01:29.966+02
182	20210420170900_populate_certifier_country_table.js	1	2023-06-13 15:01:29.968+02
183	20210420172141_shift_task_location.js	1	2023-06-13 15:01:29.969+02
184	20210421190726_changes_to_certifiers_table.js	1	2023-06-13 15:01:29.969+02
185	20210421192917_add_tuple_to_certifiers.js	1	2023-06-13 15:01:29.97+02
186	20210422101216_navigation_spotlight.js	1	2023-06-13 15:01:29.971+02
187	20210422114138_remove_spotlight_rows_if_user_status_is_invited.js	1	2023-06-13 15:01:29.971+02
188	20210422165333_farm_owner_operated.js	1	2023-06-13 15:01:29.972+02
189	20210423091713_change_nitrogen_column_to_location.js	1	2023-06-13 15:01:29.972+02
190	20210423093109_change_water_column_to_location.js	1	2023-06-13 15:01:29.972+02
191	20210423174939_add_join_certifiers_country_for_ecovida.js	1	2023-06-13 15:01:29.974+02
192	20210423175731_update_ecovida_acronym.js	1	2023-06-13 15:01:29.974+02
193	20210429111024_add_area_column_to_line_table.js	1	2023-06-13 15:01:29.975+02
194	20210429173332_pesticide_update.js	1	2023-06-13 15:01:29.977+02
195	20210429183507_add_intro_map_spotlight_flag.js	1	2023-06-13 15:01:29.977+02
196	20210430165835_default_intro_map_to_true.js	1	2023-06-13 15:01:29.978+02
197	20210511012038_crop_variety_table.js	1	2023-06-13 15:01:29.982+02
198	20210511095103_management_plan.js	1	2023-06-13 15:01:29.983+02
199	20210511113035_remove_fieldCrop_crop_id.js	1	2023-06-13 15:01:29.983+02
200	20210511135308_crop_variety_permissions.js	1	2023-06-13 15:01:29.984+02
201	20210512191155_add_crop_catalog_spotlight_column_to_showedSpotlight_table.js	1	2023-06-13 15:01:29.984+02
202	20210513113542_new_crop_variety_columns.js	1	2023-06-13 15:01:29.985+02
203	20210518114334_crop_image_url.js	1	2023-06-13 15:01:30.011+02
204	20210518125437_crop_variety_image_url.js	1	2023-06-13 15:01:30.027+02
205	20210518152132_crop_variety_nutrients.js	1	2023-06-13 15:01:30.03+02
206	20210520112021_crop-needsReview.js	1	2023-06-13 15:01:30.032+02
207	20210521144924_change_crop_variety_treated.js	1	2023-06-13 15:01:30.033+02
208	20210526123926_management_plan_migration.js	1	2023-06-13 15:01:30.046+02
209	20210528141623_fix_management_plan_constaint_name.js	1	2023-06-13 15:01:30.046+02
210	20210531151220_remove_management_plan_location_id.js	1	2023-06-13 15:01:30.047+02
211	20210601162738_update_management_plan_permission_name.js	1	2023-06-13 15:01:30.047+02
212	20210604105237_broadcast_seed_unit.js	1	2023-06-13 15:01:30.048+02
213	20210604134615_crop_variety_fields.js	1	2023-06-13 15:01:30.048+02
214	20210606130554_crop_variety_detail_spotlight.js	1	2023-06-13 15:01:30.049+02
215	20210608100325_management_plan_duration_to_integer.js	1	2023-06-13 15:01:30.049+02
216	20210608124333_add_notes_to_transplant_container_and_management_plan.js	1	2023-06-13 15:01:30.05+02
217	20210609164413_management_plan_name.js	1	2023-06-13 15:01:30.05+02
218	20210614122231_documents-structure.js	1	2023-06-13 15:01:30.054+02
219	20210615125641_documents_permissions.js	1	2023-06-13 15:01:30.054+02
220	20210617142427_add_doc_and_cert_spotlight_flags.js	1	2023-06-13 15:01:30.055+02
221	20210621123656_add_crop_crop_variety_yield_per_plant_average_seed_weight.js	1	2023-06-13 15:01:30.055+02
222	20210621152008_certifier_list_update.js	1	2023-06-13 15:01:30.056+02
223	20210622152411_redes_povo_country.js	1	2023-06-13 15:01:30.057+02
224	20210624110931_no_expiration_document.js	1	2023-06-13 15:01:30.057+02
225	20210624114356_seeding_rate_numeric.js	1	2023-06-13 15:01:30.057+02
226	20210624131707_change_location_note_type_from_string_to_text.js	1	2023-06-13 15:01:30.058+02
227	20210625235514_nullable_document_thumbnail.js	1	2023-06-13 15:01:30.058+02
228	20210630114352_fix_certifier_certification_id.js	1	2023-06-13 15:01:30.058+02
229	20210706103354_add_new_attributes_to_bed_plan_model.js	1	2023-06-13 15:01:30.059+02
230	20210706123921_row_method.js	1	2023-06-13 15:01:30.061+02
231	20210713010921_set_step_four_step_two_false_when_country_id_is_null.js	1	2023-06-13 15:01:30.062+02
232	20210713112811_management_plan_status.js	1	2023-06-13 15:01:30.062+02
233	20210713125045_bed_reference_to_crop_management.js	1	2023-06-13 15:01:30.063+02
234	20210713161726_add_pin_location_type.js	1	2023-06-13 15:01:30.065+02
235	20210713172425_modify_figure_table_to_include_pin.js	1	2023-06-13 15:01:30.065+02
236	20210715112716_add_transplant_spotlight_flag.js	1	2023-06-13 15:01:30.066+02
237	20210719091400_new_columns_for_rows.js	1	2023-06-13 15:01:30.067+02
238	20210719103825_alter_rows_column.js	1	2023-06-13 15:01:30.07+02
239	20210719110745_update_default_crop_thumbnail_url.js	1	2023-06-13 15:01:30.098+02
240	20210720193848_add_survey_id_column_for_certifier.js	1	2023-06-13 15:01:30.098+02
241	20210721104733_management_plan_v2.js	1	2023-06-13 15:01:30.122+02
242	20210726114327_tasks.js	1	2023-06-13 15:01:30.135+02
243	20210728075037_add_first_management_plan_spotlight_flag.js	1	2023-06-13 15:01:30.135+02
244	20210729101552_renaming-post-log.js	1	2023-06-13 15:01:30.137+02
245	20210729163023_task_permissions.js	1	2023-06-13 15:01:30.137+02
246	20210801212515_task_permissions_for_workers.js	1	2023-06-13 15:01:30.137+02
247	20210805200615_products.js	1	2023-06-13 15:01:30.143+02
248	20210806094930_product-permissions.js	1	2023-06-13 15:01:30.143+02
249	20210806142406_due_date-to-date.js	1	2023-06-13 15:01:30.144+02
250	20210806154253_defaulting-planned_time.js	1	2023-06-13 15:01:30.145+02
251	20210812123311_add_relevant_abandon_task_columns.js	1	2023-06-13 15:01:30.145+02
252	20210812140444_cleaning_task.js	1	2023-06-13 15:01:30.147+02
253	20210814105812_fertilizer_to_soil_sample.js	1	2023-06-13 15:01:30.148+02
254	20210815235025_product_not_sure.js	1	2023-06-13 15:01:30.148+02
255	20210816002714_product_type_enum.js	1	2023-06-13 15:01:30.148+02
256	20210817151057_management_plan_rating.js	1	2023-06-13 15:01:30.149+02
257	20210818190800_pest-soil-amendment-units.js	1	2023-06-13 15:01:30.152+02
258	20210819130138_field_task_change_to_tillage.js	1	2023-06-13 15:01:30.153+02
259	20210819221922_pest-control-log-check.js	1	2023-06-13 15:01:30.153+02
260	20210820112210_add_other_type_column_to_field_work_task.js	1	2023-06-13 15:01:30.154+02
261	20210820180744_pest-soil-takeover.js	1	2023-06-13 15:01:30.159+02
262	20210823204642_complete_task_migration.js	1	2023-06-13 15:01:30.159+02
263	20210826012051_crop_v2.js	1	2023-06-13 15:01:30.169+02
264	20210826013337_crop_v2_data.js	1	2023-06-13 15:01:30.277+02
265	20210827115614_harvest_task_creation_attributes.js	1	2023-06-13 15:01:30.28+02
266	20210831162230_remove_duplicate_sale_task_type.js	1	2023-06-13 15:01:30.281+02
267	20210831165750_fix_task_type_translation_key.js	1	2023-06-13 15:01:30.283+02
268	20210831181833_rename_task_type_id.js	1	2023-06-13 15:01:30.283+02
269	20210831212031_delete_all_task_management_plan_for_deleted_plans.js	1	2023-06-13 15:01:30.283+02
270	20210831212329_delete_all_task_location_for_deleted_locations.js	1	2023-06-13 15:01:30.284+02
271	20210831212535_delete_all_management_plan_for_all_deleted_varieties.js	1	2023-06-13 15:01:30.284+02
272	20210831212902_delete_all_tasks_that_are_not_associated_with_management_plan_or_location.js	1	2023-06-13 15:01:30.285+02
273	20210901235043_harvest_task_uses.js	1	2023-06-13 15:01:30.285+02
274	20210902103258_mark_all_tasks_complete.js	1	2023-06-13 15:01:30.285+02
275	20210902104355_mark_all_management_plan_complete.js	1	2023-06-13 15:01:30.286+02
276	20210902104910_planting_task.js	1	2023-06-13 15:01:30.287+02
277	20210902105401_transplant_task.js	1	2023-06-13 15:01:30.288+02
278	20210902105653_add_transplant_task.js	1	2023-06-13 15:01:30.288+02
279	20210902113724_harvest_use.js	1	2023-06-13 15:01:30.291+02
280	20210903013939_add_planting_type_to_planting_management_plan.js	1	2023-06-13 15:01:30.291+02
281	20210903021505_create_completed_planting_tasks_for_all_fieldCrop.js	1	2023-06-13 15:01:30.292+02
282	20210903161551_create_completed_transplant_tasks.js	1	2023-06-13 15:01:30.293+02
283	20210903205142_drop_planting_management_plan_is_final_planting_unique_constraint.js	1	2023-06-13 15:01:30.293+02
284	20210907131413_task_notes_to_text.js	1	2023-06-13 15:01:30.294+02
285	20210907133737_barn_animals.js	1	2023-06-13 15:01:30.294+02
286	20210913175809_update_crop_sale_to_reference_crop_variety.js	1	2023-06-13 15:01:30.296+02
287	20210914130031_update_crop_var_sale_quantity_column.js	1	2023-06-13 15:01:30.297+02
288	20210915060427_planting_task_spotlight.js	1	2023-06-13 15:01:30.297+02
289	20210921175347_crop_management_plan_yield.js	1	2023-06-13 15:01:30.298+02
290	20210923110026_task_planting_management_plan.js	1	2023-06-13 15:01:30.3+02
291	20210924192809_worker_harvest_use_permission.js	1	2023-06-13 15:01:30.3+02
292	20210928200336_transplant_task_prev_planting_management_plan_id.js	1	2023-06-13 15:01:30.301+02
293	20211005205552_populate_farm_country_id.js	1	2023-06-13 15:01:30.301+02
294	20211008205140_populate_transplant_prev_planting_management_plan_id.js	1	2023-06-13 15:01:30.301+02
295	20211015035926_add_price_per_mass_unit_column_to_management_plan.js	1	2023-06-13 15:01:30.302+02
296	20211021163517_generate_plan_name_for_legacy_field_crops.js	1	2023-06-13 15:01:30.302+02
297	20211022001436_set_pest_control_product_unit_to_mass.js	1	2023-06-13 15:01:30.302+02
298	20211022201831_rename_fertilizer_expense_type_to_soil_amendment.js	1	2023-06-13 15:01:30.303+02
299	20211028233240_change_certifier_names.js	1	2023-06-13 15:01:30.303+02
300	20211030191317_make_override_wage_column.js	1	2023-06-13 15:01:30.304+02
301	20211109192800_hs_code.js	1	2023-06-13 15:01:30.305+02
302	20211109192801_populate_hs_code_table.js	1	2023-06-13 15:01:30.307+02
303	20211109192847_crop_hs_code.js	1	2023-06-13 15:01:30.307+02
304	20211109193450_update_default_crop_hs_code.js	1	2023-06-13 15:01:30.479+02
305	20211116211521_set_deprecated_management_plan_active.js	1	2023-06-13 15:01:30.479+02
306	20211122153642_organic_history.js	1	2023-06-13 15:01:30.483+02
307	20211130232700_organic_history_location_effective_date_unique.js	1	2023-06-13 15:01:30.483+02
308	20211201203452_get_organic_history_permissions.js	1	2023-06-13 15:01:30.484+02
309	20220107134709_column_not_email_users.js	1	2023-06-13 15:01:30.484+02
310	20220110143209_add_new_document_type.js	1	2023-06-13 15:01:30.484+02
311	20220112180626_remove_planned_time_from_task_table.js	1	2023-06-13 15:01:30.485+02
312	20220112191615_fix_bug_where_a_task_uses_product_from_another_farm.js	1	2023-06-13 15:01:30.49+02
313	20220120154142_add_document_type_water_sample_results.js	1	2023-06-13 15:01:30.49+02
314	20220207164158_notification.js	1	2023-06-13 15:01:30.496+02
315	20220212035541_set-abandoned-completed-time-to-type-date.js	1	2023-06-13 15:01:30.499+02
316	20220221162055_generate_notification_id.js	1	2023-06-13 15:01:30.499+02
317	20220224183435_update_country_id_production.js	1	2023-06-13 15:01:30.499+02
318	20220301154943_soft-delete-countryless-farms.js	1	2023-06-13 15:01:30.499+02
319	20220302155945_fix_country_names.js	1	2023-06-13 15:01:30.5+02
320	20220309022932_update_country_id.js	1	2023-06-13 15:01:30.501+02
321	20220325020707_refactor-notification.js	1	2023-06-13 15:01:30.502+02
322	20220426163302_document_archive_column.js	1	2023-06-13 15:01:30.502+02
323	20220504213459_update-apricot-plant-spacing-from-crop-table.js	1	2023-06-13 15:01:30.503+02
324	20220512205405_redesign_notifications.js	1	2023-06-13 15:01:30.503+02
325	20220516194633_prev-mgt-plan-not-null.js	1	2023-06-13 15:01:30.503+02
326	20220519200622_add_documents_enums.js	1	2023-06-13 15:01:30.504+02
327	20220525144758_add_farm_timezone.js	1	2023-06-13 15:01:30.504+02
328	20220525200540_populate_farm_timezones.js	1	2023-06-13 15:01:30.504+02
329	20220602183932_add-notification-to-showed-spotlight.js	1	2023-06-13 15:01:30.505+02
330	20220610171351_create-integrating-partners-table.js	1	2023-06-13 15:01:30.506+02
331	20220610171713_create-farm-external-integrations-table.js	1	2023-06-13 15:01:30.508+02
332	20220613141913_create_sensors_tables.js	1	2023-06-13 15:01:30.511+02
333	20220614191722_add_webhook_ids.js	1	2023-06-13 15:01:30.512+02
334	20220614195741_sensor_reading_types.js	1	2023-06-13 15:01:30.514+02
335	20220614215635_sensor_permissions.js	1	2023-06-13 15:01:30.515+02
336	20220617123715_sensor_as_location.js	1	2023-06-13 15:01:30.515+02
337	20220620183106_fix_notification_user_names.js	1	2023-06-13 15:01:30.516+02
338	20220628035435_add_model_and_part_number_and_hardware_version_fields.js	1	2023-06-13 15:01:30.517+02
339	20220704182820_add_default_integrating_partner.js	1	2023-06-13 15:01:30.517+02
340	20220715165156_delete_sensor_data.js	1	2023-06-13 15:01:30.519+02
341	20220715214935_sensor_as_standard_location.js	1	2023-06-13 15:01:30.524+02
342	20220718193208_add_sandbox_column.js	1	2023-06-13 15:01:30.525+02
343	20220725200254_remove_webhook_address_from_integrations.js	1	2023-06-13 15:01:30.526+02
344	20220802170808_add_depth_unit_to_sensor_table.js	1	2023-06-13 15:01:30.526+02
345	20220804164229_estimated_seeds_unit_add_tonnes.js	1	2023-06-13 15:01:30.526+02
346	20220812191948_defualt_reading_types.js	1	2023-06-13 15:01:30.527+02
347	20221114230005_alter_field_work_task_table.js	1	2023-06-13 15:01:30.536+02
348	20221118081607_create_irrigation_type_table.js	1	2023-06-13 15:01:30.539+02
349	20221118081715_create_location_defaults_table.js	1	2023-06-13 15:01:30.542+02
350	20221118081755_alter_irrigation_task_table.js	1	2023-06-13 15:01:30.544+02
351	20221123234313_to_test_migration_on_beta.js	1	2023-06-13 15:01:30.546+02
352	20221128095616_fix_irrigation_task_creation.js	1	2023-06-13 15:01:30.546+02
353	20221130031740_sensor_reading_chart_spotlight.js	1	2023-06-13 15:01:30.547+02
354	20221205230703_sensor_readings_sql_function.js	1	2023-06-13 15:01:30.557+02
355	20221207131355_add_extra_columns_irrigation_table.js	1	2023-06-13 15:01:30.558+02
356	20221207172217_alter_field_work_type_table.js	1	2023-06-13 15:01:30.559+02
357	20221213065340_alter_location_defaults_table.js	1	2023-06-13 15:01:30.563+02
358	20221213065402_alter_irrigation_types_table.js	1	2023-06-13 15:01:30.566+02
359	20221213065416_alter_irrigation_tasks_table.js	1	2023-06-13 15:01:30.574+02
360	20221221005726_alter_sensor_readings_sql_function.js	1	2023-06-13 15:01:30.575+02
361	20230106112659_add_extra_columns_irrigation_table.js	1	2023-06-13 15:01:30.577+02
362	20230111164146_create_nomination_tables.js	1	2023-06-13 15:01:30.59+02
363	20230114150819_add_nominations_permissions.js	1	2023-06-13 15:01:30.59+02
364	20230120163159_create_crop_nomination_junction.js	1	2023-06-13 15:01:30.591+02
365	20230203164549_add_wage_do_not_ask_again_column_to_userFarm.js	1	2023-06-13 15:01:30.592+02
366	20230209230703_alter_sensor_readings_sql_function.js	1	2023-06-13 15:01:30.592+02
367	20230220154526_alter_crop_variety_table.js	1	2023-06-13 15:01:30.592+02
368	20230425182236_update_cook_islands_currency.js	1	2023-06-13 15:01:30.593+02
369	20230426222612_update_turkey_name.js	1	2023-06-13 15:01:30.593+02
370	20230529100603_fix_timestamp_sensor_readings_fn.js	1	2023-06-13 15:01:30.593+02
\.


--
-- Data for Name: knex_migrations_lock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knex_migrations_lock (index, is_locked) FROM stdin;
1	0
\.


--
-- Data for Name: line; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.line (figure_id, length, width, line_points, length_unit, width_unit, total_area, total_area_unit) FROM stdin;
8fa8e986-09f4-11ee-aed0-7ac3b12dfaeb	72.000000000000	8.000000000000	[{"lat": 49.891316663659694, "lng": -123.15866228025311}, {"lat": 49.891109304999304, "lng": -123.15770741384381}]	m	m	578.000000000000	m2
3e8adaee-09f6-11ee-ab47-7ac3b12dfaeb	194.000000000000	0.000000000000	[{"lat": 49.89173532013868, "lng": -123.15852622818105}, {"lat": 49.89143119643674, "lng": -123.15839748214833}, {"lat": 49.89144502028295, "lng": -123.15764646362416}, {"lat": 49.89180443889457, "lng": -123.15762500595204}, {"lat": 49.89173532013868, "lng": -123.15852622818105}]	m	m	\N	m2
6d9a3ae6-09f6-11ee-ab47-7ac3b12dfaeb	226.000000000000	1.000000000000	[{"lat": 49.89347708260337, "lng": -123.16399793457143}, {"lat": 49.89202561824822, "lng": -123.16178779434316}]	m	m	3621.000000000000	ha
\.


--
-- Data for Name: location; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location (location_id, farm_id, name, notes, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
dc4e4516-09f3-11ee-8a72-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Organic field		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:09:07.285+02	2023-06-13 16:09:07.285+02
0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Transitioning field		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:10:17.228+02	2023-06-13 16:10:17.228+02
174542c8-09f4-11ee-a5ad-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Non-organic field		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:10:46.214+02	2023-06-13 16:10:46.214+02
4cf5ec6a-09f4-11ee-a5ad-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Greenhouse 1		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:12:16.291+02	2023-06-13 16:12:16.291+02
6d94e98a-09f4-11ee-aed0-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Garden1 		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:13:11.018+02	2023-06-13 16:13:11.018+02
8fa803ae-09f4-11ee-aed0-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Organic buffer		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:14:08.187+02	2023-06-13 16:14:08.187+02
ba99defc-09f4-11ee-8b51-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Farm house		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:15:20.236+02	2023-06-13 16:15:20.236+02
eac2e4de-09f4-11ee-8b51-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Barn 1		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:16:41.036+02	2023-06-13 16:16:41.036+02
708a3da6-09f5-11ee-8b51-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Greenthumb Farm Boundary		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:20:25.479+02	2023-06-13 16:20:25.479+02
dd1ba5ae-09f5-11ee-ba1d-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	borehole water 		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:23:27.624+02	2023-06-13 16:23:27.624+02
fe3fc0da-09f5-11ee-ab47-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Municipal water		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:24:23.227+02	2023-06-13 16:24:23.227+02
147e86ce-09f6-11ee-ab47-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Main Gate		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:25:00.549+02	2023-06-13 16:25:00.549+02
3e8a6104-09f6-11ee-ab47-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	Grazing area fence		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:26:11.091+02	2023-06-13 16:26:11.091+02
6d99bcb0-09f6-11ee-ab47-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	river		f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:27:30.045+02	2023-06-13 16:27:30.045+02
\.


--
-- Data for Name: location_defaults; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_defaults (location_id, estimated_flow_rate, estimated_flow_rate_unit, application_depth, application_depth_unit, created_by_user_id, updated_by_user_id, created_at, updated_at, deleted, irrigation_type_id) FROM stdin;
\.


--
-- Data for Name: location_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.location_tasks (task_id, location_id) FROM stdin;
2	eac2e4de-09f4-11ee-8b51-7ac3b12dfaeb
3	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb
4	4cf5ec6a-09f4-11ee-a5ad-7ac3b12dfaeb
7	dc4e4516-09f3-11ee-8a72-7ac3b12dfaeb
8	0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb
9	dd1ba5ae-09f5-11ee-ba1d-7ac3b12dfaeb
10	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb
11	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb
12	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb
13	0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb
14	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb
15	0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb
16	4cf5ec6a-09f4-11ee-a5ad-7ac3b12dfaeb
17	0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb
18	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb
\.


--
-- Data for Name: maintenance_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenance_task (task_id, type) FROM stdin;
\.


--
-- Data for Name: management_plan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.management_plan (management_plan_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, crop_variety_id, notes, name, start_date, complete_date, abandon_date, complete_notes, rating, abandon_reason) FROM stdin;
1	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:43:27.831+02	2023-06-13 16:43:27.831+02	9538fefa-09f8-11ee-b847-7ac3b12dfaeb		Plan 1	2022-09-06	\N	\N	\N	\N	\N
2	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 17:09:07.266+02	2023-06-14 17:09:07.266+02	87d678d0-09fa-11ee-bd9e-7ac3b12dfaeb		Plan 1	\N	\N	\N	\N	\N	\N
\.


--
-- Data for Name: management_tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.management_tasks (task_id, planting_management_plan_id) FROM stdin;
1	c7de3ac6-0e7e-46f0-916b-bd37129f4679
7	62deed8f-c40b-4580-91ec-e4d99e1d631b
\.


--
-- Data for Name: natural_area; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.natural_area (location_id) FROM stdin;
\.


--
-- Data for Name: nitrogenBalance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."nitrogenBalance" (nitrogen_id, created_at, location_id, nitrogen_value) FROM stdin;
\.


--
-- Data for Name: nitrogenSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."nitrogenSchedule" (nitrogen_schedule_id, created_at, scheduled_at, farm_id, frequency) FROM stdin;
\.


--
-- Data for Name: nomination; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nomination (nomination_id, nomination_type, farm_id, created_at, created_by_user_id, updated_at, updated_by_user_id, deleted) FROM stdin;
\.


--
-- Data for Name: nomination_crop; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nomination_crop (nomination_id, crop_id) FROM stdin;
\.


--
-- Data for Name: nomination_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nomination_status (status_id, nomination_id, workflow_id, notes, created_at, created_by_user_id, updated_at, updated_by_user_id, deleted) FROM stdin;
\.


--
-- Data for Name: nomination_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nomination_type (nomination_type, created_at, created_by_user_id, updated_at, updated_by_user_id, deleted) FROM stdin;
CROP_NOMINATION	2023-06-13 15:01:29.076106+02	1	2023-06-13 15:01:29.076106+02	1	f
\.


--
-- Data for Name: nomination_workflow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nomination_workflow (workflow_id, status, type_group, created_at, created_by_user_id, updated_at, updated_by_user_id, deleted) FROM stdin;
1	REJECTED	CROP_NOMINATION	2023-06-13 15:01:29.076106+02	1	2023-06-13 15:01:29.076106+02	1	f
2	APPROVED	CROP_NOMINATION	2023-06-13 15:01:29.076106+02	1	2023-06-13 15:01:29.076106+02	1	f
3	LF_REVIEW	CROP_NOMINATION	2023-06-13 15:01:29.076106+02	1	2023-06-13 15:01:29.076106+02	1	f
4	NOMINATED	CROP_NOMINATION	2023-06-13 15:01:29.076106+02	1	2023-06-13 15:01:29.076106+02	1	f
5	EXPERT_REVIEW	CROP_NOMINATION	2023-06-13 15:01:29.076106+02	1	2023-06-13 15:01:29.076106+02	1	f
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification (notification_id, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, variables, context, title, body, ref) FROM stdin;
bb896226-7d9b-4aa8-9ff8-5094b2167d93	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-14 16:26:42.093+02	2023-06-14 16:26:42.093+02	[{"name": "taskType", "value": "task:CLEANING_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "CLEANING_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": 2, "type": "task"}}
f13f9cdb-e1e9-4657-a03a-c70d21c123bb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-14 16:38:20.321+02	2023-06-14 16:38:20.321+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": 3, "type": "task"}}
5fee3b47-c7e3-40d8-9e71-29961042f308	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-14 16:42:18.051+02	2023-06-14 16:42:18.051+02	[{"name": "taskType", "value": "task:IRRIGATION_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "IRRIGATION_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": 4, "type": "task"}}
24166ced-61ba-4d51-9b29-16bdb2250a2a	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:13:57.272+02	2023-06-15 13:13:57.272+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": "9", "type": "task"}}
b8ac3a83-cb30-488a-b0ca-303c275e28f3	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:14:13.195+02	2023-06-15 13:14:13.195+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "9", "type": "task"}}
f2fea3ef-59f3-4792-83a2-482f9d49038c	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:20:20.592+02	2023-06-15 13:20:20.592+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": 10, "type": "task"}}
5b097c2d-879b-4dd7-8c31-9c84b601ba27	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:43:51.318+02	2023-06-15 13:43:51.318+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": "11", "type": "task"}}
733191da-236c-4f4d-a2f1-fd1b37fb4f2c	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:44:02.635+02	2023-06-15 13:44:02.635+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "11", "type": "task"}}
aa8abaf9-0514-4356-806e-0bd940b3b055	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:44:12.287+02	2023-06-15 13:44:12.287+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": "12", "type": "task"}}
fa85f4c9-5d59-43db-934c-3ed816a7a3f1	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:44:20.238+02	2023-06-15 13:44:20.238+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "12", "type": "task"}}
cd4a1f35-6fba-4ffc-acb4-463cf3b724b2	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:53:27.092+02	2023-06-15 13:53:27.092+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": "16", "type": "task"}}
f2584566-36c3-47b3-b16a-c595f6457889	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 13:53:43.019+02	2023-06-15 13:53:43.019+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "16", "type": "task"}}
7b5a0d7d-359c-4bb9-b977-6f99a2afb4b7	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 14:18:21.569+02	2023-06-15 14:18:21.569+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "10", "type": "task"}}
28ac391d-10bb-4283-b376-86ac32f159c5	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 14:19:08.113+02	2023-06-15 14:19:08.113+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": "13", "type": "task"}}
976c352d-a96d-440b-a33e-0f835f3f3302	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 14:19:21.023+02	2023-06-15 14:19:21.023+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "13", "type": "task"}}
0166aa14-de2b-4b19-8d03-4bd431cab7cc	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 14:20:07.347+02	2023-06-15 14:20:07.347+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": "18", "type": "task"}}
ef266c2c-d121-40b5-b576-3101ee3e02f9	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 14:20:16.314+02	2023-06-15 14:20:16.314+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "18", "type": "task"}}
e40c8666-d8fb-41a1-82ee-ab9eeee73976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 15:24:50.089+02	2023-06-15 15:24:50.089+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.TITLE"}	{"translation_key": "NOTIFICATION.TASK_ASSIGNED.BODY"}	{"entity": {"id": "17", "type": "task"}}
79071a42-845e-45bc-98e6-cfbda5b216c6	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	1	1	2023-06-15 15:25:11.356+02	2023-06-15 15:25:11.356+02	[{"name": "taskType", "value": "task:FIELD_WORK_TASK", "translate": true}, {"name": "assigner", "value": "Gary Greenthumb", "translate": false}]	{"task_translation_key": "FIELD_WORK_TASK"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.TITLE"}	{"translation_key": "NOTIFICATION.TASK_COMPLETED_BY_OTHER_USER.BODY"}	{"entity": {"id": "17", "type": "task"}}
\.


--
-- Data for Name: notification_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_user (notification_id, user_id, alert, status, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
5fee3b47-c7e3-40d8-9e71-29961042f308	f8a55462-5b93-4447-bdee-3560005efb7b	t	Unread	f	1	1	2023-06-14 16:42:18.065+02	2023-06-14 16:42:18.065+02
bb896226-7d9b-4aa8-9ff8-5094b2167d93	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:26:42.102+02	2023-06-14 17:06:57.047+02
f13f9cdb-e1e9-4657-a03a-c70d21c123bb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:38:20.324+02	2023-06-14 17:06:57.047+02
24166ced-61ba-4d51-9b29-16bdb2250a2a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:13:57.303+02	2023-06-16 16:40:50.943+02
b8ac3a83-cb30-488a-b0ca-303c275e28f3	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:14:13.196+02	2023-06-16 16:40:50.943+02
f2fea3ef-59f3-4792-83a2-482f9d49038c	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:20:20.599+02	2023-06-16 16:40:50.943+02
5b097c2d-879b-4dd7-8c31-9c84b601ba27	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:43:51.324+02	2023-06-16 16:40:50.943+02
733191da-236c-4f4d-a2f1-fd1b37fb4f2c	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:44:02.637+02	2023-06-16 16:40:50.943+02
aa8abaf9-0514-4356-806e-0bd940b3b055	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:44:12.292+02	2023-06-16 16:40:50.943+02
fa85f4c9-5d59-43db-934c-3ed816a7a3f1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:44:20.241+02	2023-06-16 16:40:50.943+02
cd4a1f35-6fba-4ffc-acb4-463cf3b724b2	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:53:27.099+02	2023-06-16 16:40:50.943+02
f2584566-36c3-47b3-b16a-c595f6457889	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:53:43.021+02	2023-06-16 16:40:50.943+02
7b5a0d7d-359c-4bb9-b977-6f99a2afb4b7	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:18:21.582+02	2023-06-16 16:40:50.943+02
28ac391d-10bb-4283-b376-86ac32f159c5	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:19:08.136+02	2023-06-16 16:40:50.943+02
976c352d-a96d-440b-a33e-0f835f3f3302	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:19:21.025+02	2023-06-16 16:40:50.943+02
0166aa14-de2b-4b19-8d03-4bd431cab7cc	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:20:07.352+02	2023-06-16 16:40:50.943+02
ef266c2c-d121-40b5-b576-3101ee3e02f9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:20:16.318+02	2023-06-16 16:40:50.943+02
e40c8666-d8fb-41a1-82ee-ab9eeee73976	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 15:24:50.094+02	2023-06-16 16:40:50.943+02
79071a42-845e-45bc-98e6-cfbda5b216c6	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	Unread	f	1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 15:25:11.359+02	2023-06-16 16:40:50.943+02
\.


--
-- Data for Name: organicCertifierSurvey; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."organicCertifierSurvey" (survey_id, farm_id, created_by_user_id, updated_by_user_id, created_at, updated_at, interested, deleted, requested_certification, requested_certifier, certifier_id, certification_id) FROM stdin;
6dd9cd22-09ed-11ee-8ab9-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 15:23:04.994+02	2023-06-13 15:23:04.994+02	t	f	\N	\N	5	1
642de2f0-0c53-11ee-9656-7ac3b12dfaeb	018861de-0c53-11ee-ab8a-7ac3b12dfaeb	5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	2023-06-16 16:37:59.756+02	2023-06-16 16:37:59.756+02	f	f	\N	\N	\N	\N
\.


--
-- Data for Name: organic_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.organic_history (organic_history_id, location_id, organic_status, effective_date, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
dc53923c-09f3-11ee-8a72-7ac3b12dfaeb	dc4e4516-09f3-11ee-8a72-7ac3b12dfaeb	Organic	2023-06-13	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:09:07.316+02	2023-06-13 16:09:07.316+02
06051b00-09f4-11ee-a5ad-7ac3b12dfaeb	0603e44c-09f4-11ee-a5ad-7ac3b12dfaeb	Transitional	2023-06-13	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:10:17.271+02	2023-06-13 16:10:17.271+02
1745c6bc-09f4-11ee-a5ad-7ac3b12dfaeb	174542c8-09f4-11ee-a5ad-7ac3b12dfaeb	Non-Organic	2023-06-13	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:10:46.217+02	2023-06-13 16:10:46.217+02
4cf74d80-09f4-11ee-a5ad-7ac3b12dfaeb	4cf5ec6a-09f4-11ee-a5ad-7ac3b12dfaeb	Non-Organic	2023-06-13	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:12:16.299+02	2023-06-13 16:12:16.299+02
6d973816-09f4-11ee-aed0-7ac3b12dfaeb	6d94e98a-09f4-11ee-aed0-7ac3b12dfaeb	Non-Organic	2023-06-13	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:13:11.034+02	2023-06-13 16:13:11.034+02
\.


--
-- Data for Name: partner_reading_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.partner_reading_type (partner_reading_type_id, partner_id, raw_value, readable_value) FROM stdin;
6a4787ec-09ea-11ee-81ec-7ac3b12dfaeb	1	\N	soil_water_content
6a478a12-09ea-11ee-81ec-7ac3b12dfaeb	1	\N	soil_water_potential
6a478a30-09ea-11ee-81ec-7ac3b12dfaeb	1	\N	temperature
6a499f28-09ea-11ee-81ec-7ac3b12dfaeb	0	\N	soil_water_content
6a499ffa-09ea-11ee-81ec-7ac3b12dfaeb	0	\N	soil_water_potential
6a49a00e-09ea-11ee-81ec-7ac3b12dfaeb	0	\N	temperature
\.


--
-- Data for Name: password; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password (user_id, password_hash, reset_token_version, created_at) FROM stdin;
cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	$2a$10$r5wpIKU7ah/3./KzYOm8f.dathRNGua7JKUiPsYBba5KFbbWuZZwK	0	2023-06-13 15:11:30.553+02
5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	$2a$10$iB8L6suxlXy7YaEWA8B1w.xJtsrCkHADaEvFzpDSvKqt/UJbH2yMW	0	2023-06-16 16:30:36.703+02
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permissions (permission_id, name, description) FROM stdin;
1	add:actual_revenue	add actual revenue
2	add:crops	add crops
3	add:diseases	add diseases
4	add:expected_yields	add expected yields
5	add:expenses	add expenses
6	add:expense_types	add expense types
7	add:farms	add farms
8	add:farm_schedules	add farm schedules
9	add:fertilizers	add fertilizers
11	add:fields	add fields
12	add:insights	add insights
13	add:logs	add logs
14	add:pesticides	add pesticides
15	add:plans	add plans
16	add:prices	add prices
17	add:sales	add sales
18	add:shift_tasks	add shift tasks
19	add:shifts	add shifts
20	add:task_types	add task types
21	add:users	add users
22	add:yields	add yields
23	delete:crops	delete crops
24	delete:diseases	delete diseases
25	delete:expenses	delete expenses
26	delete:expense_types	delete expense types
27	delete:farms	delete farms
28	delete:farm_schedules	delete farm schedules
29	delete:fertilizers	delete fertilizers
31	delete:fields	delete fields
32	delete:insights	delete insights
33	delete:logs	delete logs
34	delete:plans	delete plans
35	delete:pesticides	delete pesticides
36	delete:prices	delete prices
37	delete:sales	delete sales
38	delete:shifts	delete shifts
39	delete:task_types	delete task types
40	delete:users	delete users
41	delete:yields	delete yields
42	edit:crops	edit crops
43	edit:diseases	edit diseases
44	edit:expenses	edit expenses
45	edit:expense_types	edit expense types
46	edit:farms	edit farms
47	edit:farm_schedules	edit farm schedules
48	edit:fertilizers	edit fertilizers
50	edit:fields	edit fields
51	edit:logs	edit logs
52	edit:pesticides	edit pesticides
53	edit:prices	edit prices
54	edit:sales	edit sales
55	edit:shifts	edit shifts
56	edit:task_types	edit task types
57	edit:users	edit users
58	edit:user_role	edit other users' role
59	edit:user_status	edit other users' status
60	edit:yields	edit yields
61	get:crops	get crops
62	get:diseases	get diseases
63	get:expenses	get expenses
64	get:expense_types	get expense types
65	get:farm_schedules	get farm schedules
66	get:fertilizers	get fertilizers
68	get:fields	get fields
69	get:fields_by_user	get fields by user
70	get:insights	get insights
71	get:logs	get logs
72	get:notifications	get notifications
73	get:pesticides	get pesticides
74	get:plans	get plans
75	get:prices	get prices
76	get:sales	get sales
77	get:shift_tasks	get shift tasks
78	get:shifts	get shifts
79	get:task_types	get task types
80	get:users	get users
81	get:user_farm_info	get user farm info
82	get:yields	get yields
83	add:contact	add contact
84	edit:user_wage	edit user wage
85	get:organic_certifier_survey	Get organic certifier survey
86	add:organic_certifier_survey	Submit a organic certifier survey
87	edit:organic_certifier_survey	Edit a organic certifier survey
88	delete:organic_certifier_survey	Delete organic certifier survey
89	add:harvest_use	Add a harvest use type
90	add:gate	Create a gate
91	add:water_valve	Create a water valve
92	add:buffer_zone	Create a buffer zone
94	add:fence	Create a fence
95	add:ceremonial_area	Create a ceremonial area
96	add:residence	Create a residence
98	add:natural_area	Create a natural area
99	add:greenhouse	Create a greenhouse
100	add:barn	Create a barn
101	edit:gate	Edit a gate
102	edit:water_valve	Edit a water valve
103	edit:buffer_zone	Edit a buffer zone
105	edit:fence	Edit a fence
106	edit:ceremonial_area	Edit a ceremonial area
107	edit:residence	Edit a residence
109	edit:natural_area	Edit a natural area
110	edit:greenhouse	Edit a greenhouse
111	edit:barn	Edit a barn
112	delete:location	Delete any location
113	add:farm_site_boundary	Create a farm site boundary
114	edit:farm_site_boundary	update a farm site boundary
97	add:surface_water	Create surface water area
108	edit:surface_water	Edit a surface water area
115	add:garden	Create a garden
116	edit:garden	Update a garden
93	add:watercourse	Create a watercourse
104	edit:watercourse	Edit a watercourse
117	get:crop_variety	Get a crop variety
118	add:crop_variety	Create a crop variety
119	edit:crop_variety	Edit a crop variety
120	delete:crop_variety	Delete a crop variety
10	add:management_plan	add management plan
49	edit:management_plan	edit management plan
30	delete:management_plan	delete management plan
67	get:management_plan	get management plan
121	get:document	Get a document
122	add:document	Create a document
123	edit:document	Edit a document
124	delete:document	Delete a document
125	add:task	Add a task
126	edit:task	Edit a task
127	delete:task	Delete a task
128	patch_status:task	Patch a task status
129	add:product	Add a product
130	add:organic_history	Add an organic history entry
131	get:organic_history	Get organic history entries
132	add:sensors	add sensors
133	edit:sensors	edit sensors
134	delete:sensors	delete sensors
135	add:nomination	Nominate an piece of data
136	edit:nomination	Edit a nomination
137	delete:nomination	Delete a nomination
\.


--
-- Data for Name: pest_control_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pest_control_task (task_id, product_quantity, control_method, product_id, pest_target, other_method, product_quantity_unit) FROM stdin;
\.


--
-- Data for Name: pesticide; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pesticide (pesticide_id, pesticide_name, entry_interval, harvest_interval, active_ingredients, concentration, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, pesticide_translation_key) FROM stdin;
1	Roundup	0.5	14	glyphosate	50.2	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	ROUNDUP
2	Dipel 2X DF	0	0	\N	0	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	DIPEL
3	Neem oil	0	0	\N	0	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	NEEM_OIL
4	Sulfocalcium Syrup	0	0	\N	0	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SULFOCALCIUM_SYRUP
5	Bordeaux mixture	0	0	\N	0	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BORDEAUX_MIXTURE
\.


--
-- Data for Name: pin; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pin (location_id) FROM stdin;
\.


--
-- Data for Name: plant_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plant_task (task_id, planting_management_plan_id) FROM stdin;
5	9f15afc2-2d72-4a16-84e3-14329b7adf90
\.


--
-- Data for Name: planting_management_plan; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.planting_management_plan (planting_management_plan_id, management_plan_id, is_final_planting_management_plan, planting_method, is_planting_method_known, estimated_seeds, estimated_seeds_unit, location_id, pin_coordinate, notes, planting_task_type) FROM stdin;
c7de3ac6-0e7e-46f0-916b-bd37129f4679	1	t	\N	\N	\N	kg	\N	{"lat": 49.89039736681835, "lng": -123.15726845245725}	\N	\N
9f15afc2-2d72-4a16-84e3-14329b7adf90	2	f	CONTAINER_METHOD	\N	0.005000000000	kg	dc4e4516-09f3-11ee-8a72-7ac3b12dfaeb	\N	\N	PLANT_TASK
62deed8f-c40b-4580-91ec-e4d99e1d631b	2	t	BED_METHOD	\N	0.022222222222	kg	dc4e4516-09f3-11ee-8a72-7ac3b12dfaeb	\N	\N	TRANSPLANT_TASK
\.


--
-- Data for Name: point; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.point (figure_id, point) FROM stdin;
dd1d3c16-09f5-11ee-ba1d-7ac3b12dfaeb	{"lat": 49.890269979219376, "lng": -123.15760354827992}
fe401d46-09f5-11ee-ab47-7ac3b12dfaeb	{"lat": 49.89279973800349, "lng": -123.15996389221303}
147efbf4-09f6-11ee-ab47-7ac3b12dfaeb	{"lat": 49.892398856108954, "lng": -123.16037158798329}
\.


--
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price (price_id, crop_id, "value_$/kg", date, farm_id, deleted) FROM stdin;
\.


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product (product_id, name, product_translation_key, supplier, type, farm_id, created_by_user_id, updated_by_user_id, deleted, created_at, updated_at, on_permitted_substances_list) FROM stdin;
1	compost (manure)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
2	compost (HIP)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
3	Beef-feedlot- solid (dry)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
4	Beef-feedlot- solid (moist)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
5	Beef- liquid	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
6	Chicken-broiler (general)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
7	Chicken-broiler (manure aged outdoors)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
8	Chicken-broiler (manure fresh from barn)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
9	Chicken-broiler breeder	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
10	Chicken-layer	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
11	Dairy- solid (dry)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
12	Dairy- solid (moist)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
13	Dairy- liquid (thick slurry)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
14	Dairy- liquid (medium slurry)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
15	Dairy- liquid (quite watery)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
16	Dairy- liquid (very watery)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
17	Goat (dairy)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
18	Hog- liquid	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
19	Hog- solid	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
20	Horse	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
21	Mink	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
22	Sheep	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
23	Turkey (manure aged >7 weeks out of barn)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
24	Turkey (manure fresh from barn <7 weeks)	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
25	Biosolids- anaerobically digested & dewatered	\N	\N	soil_amendment_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
26	Roundup	\N	\N	pest_control_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
27	Dipel 2X DF	\N	\N	pest_control_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
28	Neem oil	\N	\N	pest_control_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
29	Sulfocalcium Syrup	\N	\N	pest_control_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
30	Bordeaux mixture	\N	\N	pest_control_task	\N	1	1	t	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	\N
31	Sulphur	\N	local	soil_amendment_task	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	f	2023-06-14 17:10:09.593+02	2023-06-14 17:10:09.593+02	YES
\.


--
-- Data for Name: residence; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.residence (location_id) FROM stdin;
ba99defc-09f4-11ee-8b51-7ac3b12dfaeb
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role (role_id, role, deleted) FROM stdin;
1	Owner	f
2	Manager	f
3	Worker	f
4	Worker Without Account	f
5	Extension Officer	f
\.


--
-- Data for Name: rolePermissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."rolePermissions" (role_id, permission_id) FROM stdin;
1	1
1	2
1	3
1	4
1	5
1	6
1	7
1	8
1	9
1	10
1	11
1	12
1	13
1	14
1	15
1	16
1	17
1	18
1	19
1	20
1	21
1	22
1	23
1	24
1	25
1	26
1	27
1	28
1	29
1	30
1	31
1	32
1	33
1	34
1	35
1	36
1	37
1	38
1	39
1	40
1	41
1	42
1	43
1	44
1	45
1	46
1	47
1	48
1	49
1	50
1	51
1	52
1	53
1	54
1	55
1	56
1	57
1	58
1	59
1	60
1	61
1	62
1	63
1	64
1	65
1	66
1	67
1	68
1	69
1	70
1	71
1	72
1	73
1	74
1	75
1	76
1	77
1	78
1	79
1	80
1	81
1	82
2	1
2	2
2	3
2	4
2	5
2	6
2	7
2	8
2	9
2	10
2	11
2	12
2	13
2	14
2	15
2	16
2	17
2	18
2	19
2	20
2	21
2	22
2	23
2	24
2	25
2	26
2	27
2	28
2	29
2	30
2	31
2	32
2	33
2	34
2	35
2	36
2	37
2	38
2	39
2	40
2	41
2	42
2	43
2	44
2	45
2	46
2	47
2	48
2	49
2	50
2	51
2	52
2	53
2	54
2	55
2	56
2	57
2	58
2	59
2	60
2	61
2	62
2	63
2	64
2	65
2	66
2	67
2	68
2	69
2	70
2	71
2	72
2	73
2	74
2	75
2	76
2	77
2	78
2	79
2	80
2	81
2	82
3	1
3	4
3	5
3	7
3	13
3	15
3	17
3	18
3	19
3	28
3	34
3	40
3	44
3	45
3	47
3	54
3	55
3	57
3	61
3	62
3	63
3	64
3	66
3	67
3	68
3	69
3	70
3	71
3	72
3	73
3	74
3	75
3	76
3	77
3	78
3	79
3	80
3	81
3	82
1	83
2	83
1	84
2	84
5	1
5	2
5	3
5	4
5	5
5	6
5	7
5	8
5	9
5	10
5	11
5	12
5	13
5	14
5	15
5	16
5	17
5	18
5	19
5	20
5	21
5	22
5	23
5	24
5	25
5	26
5	27
5	28
5	29
5	30
5	31
5	32
5	33
5	34
5	35
5	36
5	37
5	38
5	39
5	40
5	41
5	42
5	43
5	44
5	45
5	46
5	47
5	48
5	49
5	50
5	51
5	52
5	53
5	54
5	55
5	56
5	57
5	58
5	59
5	60
5	61
5	62
5	63
5	64
5	65
5	66
5	67
5	68
5	69
5	70
5	71
5	72
5	73
5	74
5	75
5	76
5	77
5	78
5	79
5	80
5	81
5	82
5	83
5	84
5	85
5	86
5	87
1	85
1	86
1	87
2	85
2	86
2	87
5	88
1	88
2	88
3	25
3	37
3	38
3	33
3	51
5	89
1	89
2	89
1	90
2	90
5	90
1	91
2	91
5	91
1	92
2	92
5	92
1	93
2	93
5	93
1	94
2	94
5	94
1	95
2	95
5	95
1	96
2	96
5	96
1	97
2	97
5	97
1	98
2	98
5	98
1	99
2	99
5	99
1	100
2	100
5	100
1	101
2	101
5	101
1	102
2	102
5	102
1	103
2	103
5	103
1	104
2	104
5	104
1	105
2	105
5	105
1	106
2	106
5	106
1	107
2	107
5	107
1	108
2	108
5	108
1	109
2	109
5	109
1	110
2	110
5	110
1	111
2	111
5	111
1	112
2	112
5	112
1	113
2	113
5	113
1	114
2	114
5	114
1	115
2	115
5	115
1	116
2	116
5	116
1	117
2	117
3	117
5	117
1	118
2	118
5	118
1	119
2	119
5	119
1	120
2	120
5	120
1	121
2	121
5	121
1	122
2	122
5	122
1	123
2	123
5	123
1	124
2	124
5	124
1	125
2	125
5	125
1	126
2	126
5	126
1	127
2	127
5	127
1	128
2	128
5	128
3	126
3	128
1	129
2	129
5	129
3	89
1	130
2	130
5	130
1	131
2	131
5	131
1	132
2	132
5	132
1	133
2	133
5	133
1	134
2	134
5	134
1	135
2	135
5	135
1	136
2	136
5	136
1	137
2	137
5	137
\.


--
-- Data for Name: row_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.row_method (planting_management_plan_id, same_length, number_of_rows, row_length, row_length_unit, plant_spacing, plant_spacing_unit, total_rows_length, total_rows_length_unit, specify_rows, planting_depth, planting_depth_unit, row_width, row_width_unit, row_spacing, row_spacing_unit) FROM stdin;
\.


--
-- Data for Name: sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale (sale_id, customer_name, sale_date, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
1	Farmer's market	2023-06-16 00:00:00+02	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:12:28.069+02	2023-06-16 16:12:28.069+02
2	Farmer's market	2023-06-16 00:00:00+02	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:13:08.802+02	2023-06-16 16:13:08.802+02
3	Wholesaler	2023-06-16 00:00:00+02	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:16:59.851+02	2023-06-16 16:16:59.851+02
4	Neighbour	2023-06-16 00:00:00+02	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-16 16:17:25.654+02	2023-06-16 16:17:25.654+02
\.


--
-- Data for Name: sale_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_task (task_id) FROM stdin;
\.


--
-- Data for Name: scouting_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.scouting_task (task_id, type) FROM stdin;
\.


--
-- Data for Name: sensor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensor (location_id, partner_id, external_id, depth, elevation, model, depth_unit) FROM stdin;
\.


--
-- Data for Name: sensor_reading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensor_reading (reading_id, location_id, read_time, created_at, reading_type, value, unit, valid) FROM stdin;
\.


--
-- Data for Name: sensor_reading_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sensor_reading_type (sensor_reading_type_id, partner_reading_type_id, location_id) FROM stdin;
\.


--
-- Data for Name: shift; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.shift (shift_id, user_id, mood, wage_at_moment, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, shift_date) FROM stdin;
\.


--
-- Data for Name: shiftTask; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."shiftTask" (task_id, shift_id, management_plan_id, is_location, location_id, duration, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: showedSpotlight; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."showedSpotlight" (user_id, map, map_end, draw_area, draw_area_end, draw_line, draw_line_end, drop_point, drop_point_end, adjust_area, adjust_area_end, adjust_line, adjust_line_end, navigation, navigation_end, introduce_map, introduce_map_end, crop_catalog, crop_catalog_end, crop_variety_detail, crop_variety_detail_end, documents, documents_end, compliance_docs_and_certification, compliance_docs_and_certification_end, transplant, transplant_end, management_plan_creation, management_plan_creation_end, planting_task, planting_task_end, notification, notification_end, sensor_reading_chart, sensor_reading_chart_end) FROM stdin;
1	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N
5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	t	2023-06-16 16:38:03.764+02	t	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	f	\N	t	2023-06-16 16:38:03.763+02	f	\N
cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	t	2023-06-13 15:24:14.09+02	t	2023-06-13 16:08:38.937+02	t	2023-06-13 16:13:49.551+02	f	\N	t	2023-06-13 16:08:50.552+02	t	2023-06-13 16:13:55.818+02	t	2023-06-13 15:23:10.309+02	t	\N	t	2023-06-13 16:41:53.591+02	t	2023-06-13 16:42:57.088+02	t	2023-06-19 10:15:30.538+02	t	2023-06-19 10:15:30.901+02	t	2023-06-14 17:07:35.225+02	t	2023-06-13 16:43:30.524+02	f	\N	t	2023-06-13 15:23:10.307+02	f	\N
\.


--
-- Data for Name: social_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_task (type, task_id) FROM stdin;
\.


--
-- Data for Name: soil_amendment_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.soil_amendment_task (task_id, product_quantity, product_quantity_unit, purpose, other_purpose, product_id) FROM stdin;
8	50.000000000000	kg	ph	\N	31
\.


--
-- Data for Name: soil_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.soil_task (task_id, texture, k, p, n, om, ph, "bulk_density_kg/m3", organic_carbon, inorganic_carbon, s, ca, mg, zn, mn, fe, cu, b, cec, c, na, total_carbon, depth_cm) FROM stdin;
\.


--
-- Data for Name: supportTicket; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."supportTicket" (support_ticket_id, support_type, message, attachments, contact_method, email, whatsapp, status, farm_id, created_by_user_id, updated_by_user_id, created_at, updated_at, deleted) FROM stdin;
\.


--
-- Data for Name: surface_water; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.surface_water (location_id, used_for_irrigation) FROM stdin;
\.


--
-- Data for Name: task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task (task_id, due_date, owner_user_id, notes, action_needed, photo, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, task_type_id, assignee_user_id, coordinates, duration, wage_at_moment, happiness, completion_notes, complete_date, late_time, for_review_time, abandon_date, abandonment_reason, other_abandonment_reason, abandonment_notes, override_hourly_wage) FROM stdin;
1	2023-06-14	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-13 16:43:27.865+02	2023-06-13 16:43:27.865+02	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
2	2023-06-14	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:26:42.033+02	2023-06-14 16:26:42.033+02	18	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
3	2023-06-14	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:38:20.289+02	2023-06-14 16:38:20.289+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
4	2023-06-21	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 16:42:17.991+02	2023-06-14 16:42:17.991+02	17	f8a55462-5b93-4447-bdee-3560005efb7b	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
5	2023-06-28	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 17:09:07.289+02	2023-06-14 17:09:07.289+02	5	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
6	2023-08-08	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 17:09:07.297+02	2023-06-14 17:09:07.297+02	19	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
7	2023-09-25	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 17:09:07.307+02	2023-06-14 17:09:07.307+02	8	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
8	2023-06-28	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-14 17:10:09.6+02	2023-06-14 17:10:09.6+02	6	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
9	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:13:39.128+02	2023-06-15 13:14:13.187+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
11	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:40:28.992+02	2023-06-15 13:44:02.627+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
12	2023-06-21	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:40:41.583+02	2023-06-15 13:44:20.226+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
14	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:48:10.056+02	2023-06-15 13:48:10.056+02	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
15	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:48:53.496+02	2023-06-15 13:48:53.496+02	9	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	f
16	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:53:01.218+02	2023-06-15 13:53:43.01+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
10	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:20:20.554+02	2023-06-15 14:18:21.551+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
13	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 13:46:51.224+02	2023-06-15 14:19:21.014+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
18	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:19:53.859+02	2023-06-15 14:20:16.306+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
17	2023-06-22	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	f	\N	f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	2023-06-15 14:18:57.467+02	2023-06-15 15:25:11.337+02	9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	\N	15	0	\N		2023-06-15	\N	\N	\N	\N	\N	\N	f
\.


--
-- Data for Name: task_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.task_type (task_type_id, task_name, farm_id, deleted, created_by_user_id, updated_by_user_id, created_at, updated_at, task_translation_key) FROM stdin;
1	Bed Preparation	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BED_PREPARATION_TASK
3	Sales	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SALE_TASK
7	Scouting	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SCOUTING_TASK
8	Harvesting	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	HARVEST_TASK
10	Wash and Pack	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	WASH_AND_PACK_TASK
11	Pest Control	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PEST_CONTROL_TASK
12	Other	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	OTHER_TASK
13	Break	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BREAK_TASK
14	Break	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	BREAK_TASK
16	Soil Sample Results	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOIL_TASK
17	Irrigation	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	IRRIGATION_TASK
2	Transport	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TRANSPORT_TASK
9	Field Work	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	FIELD_WORK_TASK
4	Social	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOCIAL_TASK
18	Cleaning	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	CLEANING_TASK
6	Soil Amendment	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	SOIL_AMENDMENT_TASK
5	Planting	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	PLANT_TASK
19	Transplant	\N	f	1	1	2000-01-01 02:00:00+02	2000-01-01 02:00:00+02	TRANSPLANT_TASK
\.


--
-- Data for Name: test; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.test (message) FROM stdin;
\.


--
-- Data for Name: transplant_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transplant_task (task_id, planting_management_plan_id, prev_planting_management_plan_id) FROM stdin;
6	62deed8f-c40b-4580-91ec-e4d99e1d631b	9f15afc2-2d72-4a16-84e3-14329b7adf90
\.


--
-- Data for Name: transport_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transport_task (task_id) FROM stdin;
\.


--
-- Data for Name: userFarm; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."userFarm" (user_id, farm_id, role_id, has_consent, created_at, status, consent_version, wage, step_one, step_one_end, step_two, step_two_end, step_three, step_three_end, step_four, step_four_end, step_five, step_five_end, wage_do_not_ask_again) FROM stdin;
cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	1	t	2023-06-13 15:22:07.974554+02	Active	5.0	{"type": "hourly", "amount": 0}	t	2023-06-13T13:22:10.283Z	t	2023-06-13T13:22:26.025Z	t	2023-06-13T13:22:29.239Z	t	2023-06-13T13:23:05.004Z	t	2023-06-13T13:23:06.158Z	\N
f8a55462-5b93-4447-bdee-3560005efb7b	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	4	\N	2023-06-14 16:41:22.470555+02	Active	1.0	{"type": "hourly", "amount": 4}	t	\N	t	\N	t	\N	t	\N	t	\N	\N
5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	018861de-0c53-11ee-ab8a-7ac3b12dfaeb	2	t	2023-06-16 16:35:12.053371+02	Active	5.0	{"type": "hourly", "amount": 0}	t	2023-06-16T14:35:14.301Z	t	2023-06-16T14:35:20.287Z	t	2023-06-16T14:35:33.333Z	t	2023-06-16T14:37:59.767Z	t	2023-06-16T14:38:00.915Z	\N
71978196-0c51-11ee-a334-7ac3b12dfaeb	018861de-0c53-11ee-ab8a-7ac3b12dfaeb	5	f	2023-06-16 16:38:56.806303+02	Invited	1.0	{"type": "hourly", "amount": 0}	t	\N	t	\N	f	\N	t	\N	t	\N	\N
71978196-0c51-11ee-a334-7ac3b12dfaeb	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	5	f	2023-06-16 16:24:03.256793+02	Invited	1.0	{"type": "hourly", "amount": 20}	t	\N	t	\N	f	\N	t	\N	t	\N	\N
\.


--
-- Data for Name: userLog; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."userLog" (user_log_id, user_id, ip, languages, browser, browser_version, os, os_version, device_vendor, device_model, device_type, created_at, screen_width, screen_height, farm_id, reason_for_failure) FROM stdin;
b3fbb8cd-2513-4225-8fca-3398f8d9c219	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 15:12:09.385853+02	789	616	\N	n/a
44f8c1df-359d-42c7-a0c6-c074948ee391	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 15:22:10.36701+02	789	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
96ccb982-022e-45bb-9ed6-1a9ecfffd7c6	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 16:21:22.623394+02	949	796	\N	n/a
c06226ac-7da2-4690-b0cc-1d89141d10d6	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 16:21:23.591259+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
c7f14e1e-cdfb-4c7e-b361-c16529dd859b	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 17:22:01.206681+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
891df76a-18f0-419a-ae01-b2f5197bce73	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 18:24:59.233961+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
ae8db249-dbaa-466f-ba77-3e1bc7f3f716	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 19:25:43.568981+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
2d5a4132-0eb8-4806-9ebe-79dda79361ab	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 20:25:43.653775+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
0ccaf265-3f18-4795-96a6-794790a2b71e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 21:26:28.628346+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
b5fb674a-ac0c-4c1a-92ed-f13d146cd07e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 22:27:13.539229+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
2f581f88-01ea-4d5a-a788-c138e14db98e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-13 23:27:58.513365+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
fb495d4f-9801-4f9f-aa45-a9635711979f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 00:28:43.487995+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
46e6a8d9-e33a-4f5c-971f-6c8f47621fe1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 01:29:28.439829+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
c838d4c4-193a-4055-a2ad-4b5581f57509	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 02:29:28.528574+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
a8afa4ad-bf74-48f6-9ac1-d273e9ef16d4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 03:29:28.64131+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
4311e791-5c64-4233-b556-c5f6cfe13f8c	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 04:30:13.861866+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
7fe2f872-6cde-4103-9a79-0312193e1325	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 05:30:58.456769+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e1a9bc32-e406-47f8-acc0-2cc42ca9c5fa	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 06:31:43.433604+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
2f8a8439-3cba-43ae-a6f9-b6180502a33d	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 07:32:28.406092+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e7ba0ba6-19d7-47aa-b212-58e913db70bc	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 08:32:28.400268+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
14447294-b9d3-451d-976a-0a5db74d740b	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 09:33:13.527689+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5672fa22-68a9-45da-9643-830bab94225f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 10:33:58.374693+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
8b41fbe8-2f84-451a-aeea-5a0b1695c72d	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 11:34:43.327788+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
24670335-98d2-41b2-a44a-dc29b640b672	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 12:35:28.308156+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5d75f1a0-bdae-4fcd-a4e2-687329b56e36	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 13:36:13.250289+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
ec88fffa-7cba-4f23-8338-037438b07bfd	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 14:47:13.248664+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
d230a8bd-1104-4cb0-b31d-0e3efbdcbac1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 15:48:38.466061+02	949	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
95a4f9a0-5a42-46cc-a73b-0e5f66613f8f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 16:49:10.730812+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
2e4c7e5e-6a32-4023-93df-fe1d2c74982e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 17:49:55.522919+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
43c54cf0-1326-4575-9dbf-cc99aef3b3f4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 18:50:05.897209+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
0dc9bce5-3b5c-45a8-9afa-bb133561bf00	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 19:50:06.088935+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
d8c4334d-6f8c-416c-a89f-07afc1f61373	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 20:50:06.448599+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
fa12f392-7406-4c7c-8ff2-0be8d65ebff0	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 21:50:06.789387+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
d51201ed-2532-4280-a0a7-74075e5778f9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 22:50:07.04181+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
19507a39-0674-45db-9fcd-c900f75ee4c6	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-14 23:50:07.296142+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
7695e02a-1394-4666-b259-9e7ff66e88c6	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 00:50:07.4648+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
6c75db4e-3d33-4e77-a3cf-a03fa075fda2	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 01:50:07.851056+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
930e1613-bc42-496e-b77b-13ba7b52c1ad	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 02:53:10.541334+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
daf8b69b-e71f-48b6-b328-6cc1e55a6401	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 03:57:23.449234+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
01a63a6b-3720-425a-a31d-4a0bc00b0d50	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 06:13:20.191409+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
a77a3fb9-3c16-4f4f-98b3-3f7c7b130e97	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 07:17:08.386497+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e206455a-6b7c-4a50-8beb-426668a7156f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 08:17:39.768478+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
74292c52-133c-4c7d-9e2e-2e7ec422bb6d	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 09:17:39.997057+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
92e37020-1f49-4ff0-8f4e-9a87ba621cfa	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 10:30:47.135534+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
4ebcdf47-81ad-4a44-9269-9ffee210c334	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 11:36:04.646366+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
9c356146-aebc-478e-93e2-8107392f942b	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 12:36:49.550047+02	1429	976	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
f71252f9-5d0b-450e-852c-3ef9e09cfb24	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 13:37:15.116602+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
f2c516dd-6c00-4ad4-be07-ab975623bf0b	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 14:42:44.92642+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
0dbc8f21-3030-428d-b58b-c976aa184516	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 15:43:42.080373+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
3d279d7d-a464-4604-8b65-02120f36055e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 16:43:51.161803+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
a8804ae7-d01a-4e6f-87b7-290aaa1e29e4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 17:44:36.003942+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
c633e2a7-f08f-41c9-85b6-067f6dbf1aa4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 18:44:36.0518+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5a6f228f-1cb9-415b-9b35-10a6912e905a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 19:45:20.977634+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
67863362-1538-4f87-b91f-9ad024c38f97	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 20:45:21.042232+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
877cffc0-9752-4d33-b523-ee73e9ec4259	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 21:46:06.001578+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
4319936c-7cad-4abc-af2b-b9f39d91b8ea	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 22:46:50.919559+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
7c1e25fc-69fa-42af-b42b-1fd7bc6815c0	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-15 23:47:35.855696+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
6b51acc1-b04b-4683-a472-8060e6010c48	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 00:47:35.925008+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e182fb41-2dab-4898-a2d2-8676f2fc9d23	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 01:48:20.883793+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
a5e59370-f15b-4c08-917a-4f738d33aa57	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 02:49:05.833016+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
b5cd6d0b-1158-4d80-87e3-4722f656d4b4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 03:49:50.752095+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5aed6bf3-876d-42e0-89cd-c3b39b059166	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 04:49:50.841942+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e190b0f8-0262-4a75-8365-f4f23bc8ae2a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 05:50:35.765896+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
80dcc84c-cf4b-4c85-bf27-0036df25c68a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 06:50:35.803871+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
6821ffdc-cf23-45c1-8a99-0032cc80b04b	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 07:51:20.6727+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
f2df52e7-4d71-4c5a-85a2-394f492b4805	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 08:51:20.736869+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
7481b644-2a39-4e92-bd0f-358bbe9eae02	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 09:52:05.524467+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
1d5311cf-08df-4db6-b4ec-ba461b673493	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 10:52:50.522484+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
da9a2e92-cadb-4ddd-8eee-30662cebea82	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 11:52:50.638817+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
499f945b-4aff-4ebb-a5a1-923b702c2829	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 12:52:50.81297+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
46bf64fa-0e4b-4d79-9ee2-024af0e0176e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 13:53:35.662384+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
18319ba1-4f28-4f8d-a32e-207dab64ec17	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 14:53:51.16493+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
6f40bac5-fb1e-42e9-b2f2-c65bf0349623	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 15:53:57.915103+02	737	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
0b48c042-6cbc-4f4b-a7bb-e03273bbf41a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:20:08.594406+02	755	616	\N	n/a
632d7b0b-6a7a-46e0-9c8f-0e2a0e085320	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:20:09.790096+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
163f0919-52bf-40f7-a66e-1aa0a67bc78e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:27:28.060717+02	755	616	\N	n/a
d3b837df-e642-46ba-bacb-5f5e66948b1e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:27:29.104328+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
2a1ce257-f3ae-4c35-b3bb-336e7dd2ee88	5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:30:42.796305+02	755	616	\N	n/a
7624dbc9-4a54-448e-8270-a3c62c62d84d	5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:35:14.397681+02	755	616	018861de-0c53-11ee-ab8a-7ac3b12dfaeb	n/a
257223f2-8008-4fb7-8767-216ed57374b4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:40:40.425065+02	755	616	\N	n/a
7634590d-7691-4e4d-856b-47cb7419ec24	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 16:40:44.806463+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e043c0af-0e81-4b0f-a05f-c4145a76650a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 17:40:44.925734+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
ecc581ab-dc33-4708-a49a-0f0e9301a0bd	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 18:41:12.736409+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
270bb8eb-6a4f-4b54-9928-f1b90d6295c3	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 19:44:17.46554+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
4cc1aba2-a992-4838-bb6a-0601b8ef4a49	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 22:06:48.646618+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
b9a353f6-d9aa-4a5d-b5cf-fcff4a2d138a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-16 23:11:43.199887+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
8893d9c8-fd01-4f67-b8bb-291de185b854	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 00:19:36.77024+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
097d55f4-d809-49ee-951c-42ea2c7b7ddf	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 01:27:11.668664+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
41681f85-e9ef-49c3-8ec3-485ebb6e87ab	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 02:35:11.662856+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e568f490-bf9c-49b0-8fc9-f4adc4148c2b	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 04:01:04.063846+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
74763742-9c4c-4fe5-aebe-b77a2419c98e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 05:19:57.534434+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
822bc121-aaa1-43f4-bdc0-9cf76c2af4f8	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 06:14:37.903206+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
cd3caca0-0ca0-4179-8234-8c0ad38aea76	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 07:22:16.130296+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
662c40da-b14c-48e5-b0cd-ef6480534808	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 08:28:52.790122+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
6eec7dd6-bf03-4109-89ae-1daa2a0cbe79	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 09:44:59.147072+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
7cad0651-8b2b-4be8-8e96-247897af6664	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 10:44:59.017173+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
521ff8dc-b6cc-4ae9-98c9-cc349741420d	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 11:44:59.12298+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5d748707-b2d1-41f8-9d55-36ac9187cd5c	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 12:44:59.122211+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5da97d29-6b3d-410b-b69c-3cebdb5cc592	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 13:45:18.830714+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
261416e8-ac31-4b5a-a6c9-32ad3afe4198	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 14:46:03.818501+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
bf7ba9f3-f839-4a77-8e73-fa199b5303f6	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 15:46:48.813014+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
3fd2a6db-5545-4d83-8727-7bf9527f3fc7	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 16:47:33.668334+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
f9604ee0-5b71-4bab-b000-3a96af4070d9	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 17:48:18.702838+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
ffcd18b6-2ad8-4c70-95a5-65b61798fbac	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 18:49:03.629766+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
be14bcc8-e94b-4954-885f-b66775ade241	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 19:49:48.543791+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
dbe3e895-5227-4273-95c2-48e475ef2fbe	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 20:50:16.500666+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
2a07c00c-ad6f-4fa8-bc62-cad3ddea3e70	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 21:51:01.384918+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5af33827-3df6-4095-aebd-a5c98bfc32f2	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 22:51:46.221739+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
bbfd22c0-2e25-4415-9e23-48c82a312e1e	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-17 23:52:31.130245+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
5352d58d-305f-48df-a76a-b07c6f533292	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 00:52:31.268578+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
7cb8e693-1fa8-448e-bc52-69f05ce1df20	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 01:53:16.269091+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
be1ac057-f147-4dbe-b491-14a059dbed31	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 02:53:16.317617+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
6a1674e6-9a1e-497f-be6c-e69575b33d10	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 03:54:01.245923+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
0b990b61-1f09-46d1-9bcf-728d2430439a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 04:54:46.106924+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
7c259a6f-02a0-4955-9c51-88054a1d92f4	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 05:54:46.185569+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
841af718-a0dd-4a59-8a2e-6e60af58ab14	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 07:03:02.237357+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
8a7dd986-18ee-4f3f-bfaa-3f52d32e33da	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 08:07:33.181309+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
944c9b3c-4498-4ab8-aeac-54a89312d353	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 09:12:52.748143+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
c2db87be-3f48-43c8-955d-f633874ef5f8	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 10:20:22.31491+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
cd6a8999-835d-4b67-80ba-c947bc0aa31f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 11:25:10.377296+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
9ed005b3-33bc-4769-9b8f-e103c953c167	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 12:30:38.027953+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
367188b1-b80c-46be-aa6f-a1e0fdf012dd	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 13:36:19.340927+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
d35858e6-1371-43b5-b8f4-8a1520cbd296	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 14:48:16.037242+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
e78f50d6-775f-4e98-b23c-901f063cd393	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 15:58:10.12409+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
be2504df-7939-45eb-8d34-5f95df4ec957	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 17:10:57.698069+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
c378c367-3881-41f3-82aa-6042e8ada98b	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 18:12:41.905845+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
2971f24c-5154-4dde-bf57-d54c4cfd4d5c	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 19:13:12.980994+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
ee25c7ce-f190-437e-83fa-f4081a479362	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 20:13:13.024148+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
bea0a6c2-ff80-4c2c-8bb5-14746d4646ab	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 21:13:57.901885+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
f2ef86f4-40f4-4a5a-b537-ce7b1410b119	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 22:14:42.684524+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
91a0c9a5-afa4-4f62-b5bc-253f76aefb82	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-18 23:15:27.870955+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
1915c4c1-8cae-4ffc-8384-8485c739257f	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 00:16:12.819503+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
746e8f4b-b6a7-4e66-9155-4d0be5bb0a91	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 01:16:12.961356+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
afd2f909-2774-485b-b048-4e796a1850c1	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 02:16:57.905391+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
473b5ba8-7e41-4091-8467-30a859b457d8	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 03:16:57.955478+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
50cd4dc2-befb-4083-85af-fee13565d0ea	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 04:16:57.997267+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
350b25a8-c305-4472-b392-ee7a6b04986a	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 05:17:42.942053+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
471503ad-61a1-486e-9e0c-205176061a29	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 06:17:43.041174+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
fa50fde7-bbf2-4059-bdcc-27cf8ca0b098	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 07:17:43.058458+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
75c168ea-4022-493b-a060-df9fb6dc30c2	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 08:18:28.068598+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
f0d78ab2-0f6e-4e92-b033-c9d5254e78e5	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 09:24:19.527671+02	755	616	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
f1a02718-3d55-45de-bd88-1aa25e285e72	cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	::1	["en-GB", "en-US", "en"]	Chrome	114.0.0.0	Mac OS	10.15.7	Apple	Macintosh	\N	2023-06-19 10:24:51.37633+02	915	796	4d39c914-09ed-11ee-8209-7ac3b12dfaeb	n/a
\.


--
-- Data for Name: user_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_status (status_id, status_description) FROM stdin;
1	Active
2	Invited
3	Legacy-Auth0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, first_name, last_name, profile_picture, email, phone_number, user_address, notification_setting, created_at, updated_at, language_preference, status_id, gender, birth_year, do_not_email, sandbox_user) FROM stdin;
1	Default	User	\N	defaultUser	\N	\N	{"alert_pest": true, "alert_weather": true, "alert_worker_finish": true, "alert_before_planned_date": true, "alert_action_after_scouting": true}	2023-06-13 15:01:29.076106+02	2023-06-13 15:01:29.076106+02	en	1	PREFER_NOT_TO_SAY	\N	f	f
cfee062e-09eb-11ee-8ab9-7ac3b12dfaeb	Gary	Greenthumb	\N	testuser1@litefarm.org	\N	\N	{"alert_pest": true, "alert_weather": true, "alert_worker_finish": true, "alert_before_planned_date": true, "alert_action_after_scouting": true}	2023-06-13 15:11:30.425092+02	2023-06-13 15:11:30.425092+02	en	1	MALE	1980	f	f
f8a55462-5b93-4447-bdee-3560005efb7b	John	Fieldhand	https://cdn.auth0.com/avatars/na.png	f8a55462-5b93-4447-bdee-3560005efb7b@pseudo.com	\N	\N	{"alert_pest": true, "alert_weather": true, "alert_worker_finish": true, "alert_before_planned_date": true, "alert_action_after_scouting": true}	2023-06-14 16:41:22.470555+02	2023-06-14 16:41:22.470555+02	en	1	MALE	1994	f	f
71978196-0c51-11ee-a334-7ac3b12dfaeb	Melanie	Roberts	\N	testuser2@litefarm.org	\N	\N	{"alert_pest": true, "alert_weather": true, "alert_worker_finish": true, "alert_before_planned_date": true, "alert_action_after_scouting": true}	2023-06-16 16:24:03.256793+02	2023-06-16 16:24:03.256793+02	en	2	FEMALE	1994	f	f
5c17e92c-0c52-11ee-ab8a-7ac3b12dfaeb	Melanie	Roberts	\N	testuser3@litefarm.org	\N	\N	{"alert_pest": true, "alert_weather": true, "alert_worker_finish": true, "alert_before_planned_date": true, "alert_action_after_scouting": true}	2023-06-16 16:30:36.565963+02	2023-06-16 16:30:36.565963+02	en	1	FEMALE	1994	f	f
\.


--
-- Data for Name: wash_and_pack_task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wash_and_pack_task (task_id) FROM stdin;
\.


--
-- Data for Name: waterBalance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."waterBalance" (water_balance_id, crop_id, location_id, created_at, soil_water, plant_available_water) FROM stdin;
\.


--
-- Data for Name: waterBalanceSchedule; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."waterBalanceSchedule" (water_balance_schedule_id, created_at, farm_id) FROM stdin;
\.


--
-- Data for Name: water_valve; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.water_valve (location_id, source, flow_rate, flow_rate_unit) FROM stdin;
dd1ba5ae-09f5-11ee-ba1d-7ac3b12dfaeb	Groundwater	\N	l/min
fe3fc0da-09f5-11ee-ab47-7ac3b12dfaeb	Municipal water	\N	l/min
\.


--
-- Data for Name: watercourse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.watercourse (location_id, used_for_irrigation, buffer_width, buffer_width_unit) FROM stdin;
6d99bcb0-09f6-11ee-ab47-7ac3b12dfaeb	\N	15.000000000000	m
\.


--
-- Data for Name: weather; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weather (weather_id, created_at, min_degrees, max_degrees, min_humidity, max_humidity, precipitation, wind_speed, data_points, station_id) FROM stdin;
\.


--
-- Data for Name: weatherHourly; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."weatherHourly" (weather_hourly_id, created_at, min_degrees, max_degrees, precipitation, wind_speed, min_humidity, max_humidity, data_points, station_id) FROM stdin;
\.


--
-- Data for Name: weather_station; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.weather_station (id, name, country, timezone) FROM stdin;
\.


--
-- Data for Name: yield; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.yield (yield_id, crop_id, date, farm_id, "quantity_kg/m2", deleted) FROM stdin;
\.


--
-- Name: activityLog_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."activityLog_activity_id_seq"', 18, true);


--
-- Name: certifications_certification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.certifications_certification_id_seq', 2, true);


--
-- Name: certifier_country_certifier_country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.certifier_country_certifier_country_id_seq', 19, true);


--
-- Name: certifiers_certifier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.certifiers_certifier_id_seq', 18, true);


--
-- Name: crop_crop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.crop_crop_id_seq', 393, true);


--
-- Name: currency_table_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.currency_table_id_seq', 227, true);


--
-- Name: disease_disease_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.disease_disease_id_seq', 509, true);


--
-- Name: farmDataSchedule_request_number_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."farmDataSchedule_request_number_seq"', 1, false);


--
-- Name: fertilizer_fertilizer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.fertilizer_fertilizer_id_seq', 25, true);


--
-- Name: fieldCrop_field_crop_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."fieldCrop_field_crop_id_seq"', 2, true);


--
-- Name: field_work_type_field_work_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.field_work_type_field_work_type_id_seq', 12, true);


--
-- Name: harvestUseType_harvest_use_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."harvestUseType_harvest_use_type_id_seq"', 11, true);


--
-- Name: harvestUse_harvest_use_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."harvestUse_harvest_use_id_seq"', 1, false);


--
-- Name: integrating_partner_partner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.integrating_partner_partner_id_seq', 1, false);


--
-- Name: irrigation_type_irrigation_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.irrigation_type_irrigation_type_id_seq', 7, true);


--
-- Name: knex_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_id_seq', 370, true);


--
-- Name: knex_migrations_lock_index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knex_migrations_lock_index_seq', 1, true);


--
-- Name: nitrogenBalance_nitrogen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."nitrogenBalance_nitrogen_id_seq"', 1, false);


--
-- Name: nitrogenSchedule_nitrogen_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."nitrogenSchedule_nitrogen_schedule_id_seq"', 1, false);


--
-- Name: nomination_nomination_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nomination_nomination_id_seq', 1, false);


--
-- Name: nomination_workflow_workflow_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nomination_workflow_workflow_id_seq', 5, true);


--
-- Name: permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permissions_permission_id_seq', 82, true);


--
-- Name: pesticide_pesticide_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pesticide_pesticide_id_seq', 5, true);


--
-- Name: price_yield_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.price_yield_id_seq', 1, false);


--
-- Name: product_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_product_id_seq', 31, true);


--
-- Name: role_role_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_role_id_seq', 1, false);


--
-- Name: sale_sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_sale_id_seq', 4, true);


--
-- Name: taskType_task_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."taskType_task_id_seq"', 19, true);


--
-- Name: waterBalanceSchedule_water_balance_schedule_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."waterBalanceSchedule_water_balance_schedule_id_seq"', 1, false);


--
-- Name: waterBalance_water_balance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."waterBalance_water_balance_id_seq"', 1, false);


--
-- Name: weatherHourly_weather_hourly_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."weatherHourly_weather_hourly_id_seq"', 1, false);


--
-- Name: weather_weather_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.weather_weather_id_seq', 1, false);


--
-- Name: yield_yield_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.yield_yield_id_seq', 1, false);


--
-- Name: location_tasks activityFields_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_tasks
    ADD CONSTRAINT "activityFields_pkey" PRIMARY KEY (location_id, task_id);


--
-- Name: task activityLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT "activityLog_pkey" PRIMARY KEY (task_id);


--
-- Name: area area_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT area_pkey PRIMARY KEY (figure_id);


--
-- Name: barn barn_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barn
    ADD CONSTRAINT barn_pkey PRIMARY KEY (location_id);


--
-- Name: bed_method bed_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bed_method
    ADD CONSTRAINT bed_method_pkey PRIMARY KEY (planting_management_plan_id);


--
-- Name: broadcast_method broadcast_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broadcast_method
    ADD CONSTRAINT broadcast_method_pkey PRIMARY KEY (planting_management_plan_id);


--
-- Name: buffer_zone buffer_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buffer_zone
    ADD CONSTRAINT buffer_zone_pkey PRIMARY KEY (location_id);


--
-- Name: ceremonial_area ceremonial_area_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ceremonial_area
    ADD CONSTRAINT ceremonial_area_pkey PRIMARY KEY (location_id);


--
-- Name: certifications certifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifications
    ADD CONSTRAINT certifications_pkey PRIMARY KEY (certification_id);


--
-- Name: certifier_country certifier_country_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifier_country
    ADD CONSTRAINT certifier_country_pkey PRIMARY KEY (certifier_country_id);


--
-- Name: certifiers certifiers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifiers
    ADD CONSTRAINT certifiers_pkey PRIMARY KEY (certifier_id);


--
-- Name: cleaning_task cleaning_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cleaning_task
    ADD CONSTRAINT cleaning_task_pkey PRIMARY KEY (task_id);


--
-- Name: container_method container_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_method
    ADD CONSTRAINT container_method_pkey PRIMARY KEY (planting_management_plan_id);


--
-- Name: watercourse creek_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watercourse
    ADD CONSTRAINT creek_pkey PRIMARY KEY (location_id);


--
-- Name: cropDisease cropDisease_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."cropDisease"
    ADD CONSTRAINT "cropDisease_pkey" PRIMARY KEY (disease_id, crop_id);


--
-- Name: crop crop_crop_common_name_crop_genus_crop_specie_farm_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_crop_common_name_crop_genus_crop_specie_farm_id_unique UNIQUE (crop_common_name, crop_genus, crop_specie, farm_id);


--
-- Name: crop_management_plan crop_management_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_management_plan
    ADD CONSTRAINT crop_management_plan_pkey PRIMARY KEY (management_plan_id);


--
-- Name: crop crop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_pkey PRIMARY KEY (crop_id);


--
-- Name: crop_variety crop_variety_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety
    ADD CONSTRAINT crop_variety_pkey PRIMARY KEY (crop_variety_id);


--
-- Name: crop_variety_sale crop_variety_sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety_sale
    ADD CONSTRAINT crop_variety_sale_pkey PRIMARY KEY (sale_id, crop_variety_id);


--
-- Name: countries currency_table_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT currency_table_pkey PRIMARY KEY (id);


--
-- Name: custom_location custom_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_location
    ADD CONSTRAINT custom_location_pkey PRIMARY KEY (location_id);


--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY (disease_id);


--
-- Name: document document_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_pkey PRIMARY KEY (document_id);


--
-- Name: emailToken emailToken_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."emailToken"
    ADD CONSTRAINT "emailToken_pkey" PRIMARY KEY (invitation_id);


--
-- Name: emailToken emailtoken_user_id_farm_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."emailToken"
    ADD CONSTRAINT emailtoken_user_id_farm_id_unique UNIQUE (user_id, farm_id);


--
-- Name: farmDataSchedule farmDataSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmDataSchedule"
    ADD CONSTRAINT "farmDataSchedule_pkey" PRIMARY KEY (request_number);


--
-- Name: farmExpenseType farmExpenseType_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpenseType"
    ADD CONSTRAINT "farmExpenseType_pkey" PRIMARY KEY (expense_type_id);


--
-- Name: farmExpense farmExpense_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpense"
    ADD CONSTRAINT "farmExpense_pkey" PRIMARY KEY (farm_expense_id);


--
-- Name: farm_external_integration farm_external_integration_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_external_integration
    ADD CONSTRAINT farm_external_integration_pkey PRIMARY KEY (farm_id, partner_id);


--
-- Name: farm farm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm
    ADD CONSTRAINT farm_pkey PRIMARY KEY (farm_id);


--
-- Name: farm_site_boundary farm_site_boundary_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_site_boundary
    ADD CONSTRAINT farm_site_boundary_pkey PRIMARY KEY (location_id);


--
-- Name: fence fence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fence
    ADD CONSTRAINT fence_pkey PRIMARY KEY (location_id);


--
-- Name: soil_amendment_task fertilizerLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_amendment_task
    ADD CONSTRAINT "fertilizerLog_pkey" PRIMARY KEY (task_id);


--
-- Name: fertilizer fertilizer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fertilizer
    ADD CONSTRAINT fertilizer_pkey PRIMARY KEY (fertilizer_id);


--
-- Name: field field_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field_pkey PRIMARY KEY (location_id);


--
-- Name: field_work_type field_work_type_field_work_name_field_work_type_translation_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_type
    ADD CONSTRAINT field_work_type_field_work_name_field_work_type_translation_key UNIQUE (field_work_name, field_work_type_translation_key, farm_id);


--
-- Name: field_work_type field_work_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_type
    ADD CONSTRAINT field_work_type_pkey PRIMARY KEY (field_work_type_id);


--
-- Name: field_work_task fieldworkLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_task
    ADD CONSTRAINT "fieldworkLog_pkey" PRIMARY KEY (task_id);


--
-- Name: figure figure_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.figure
    ADD CONSTRAINT figure_pkey PRIMARY KEY (figure_id);


--
-- Name: file file_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_pkey PRIMARY KEY (file_id);


--
-- Name: garden garden_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garden
    ADD CONSTRAINT garden_pkey PRIMARY KEY (location_id);


--
-- Name: gate gate_location_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate
    ADD CONSTRAINT gate_location_id_unique UNIQUE (location_id);


--
-- Name: gate gate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate
    ADD CONSTRAINT gate_pkey PRIMARY KEY (location_id);


--
-- Name: greenhouse greenhouse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenhouse
    ADD CONSTRAINT greenhouse_pkey PRIMARY KEY (location_id);


--
-- Name: surface_water ground_water_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surface_water
    ADD CONSTRAINT ground_water_pkey PRIMARY KEY (location_id);


--
-- Name: harvest_task harvestLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_task
    ADD CONSTRAINT "harvestLog_pkey" PRIMARY KEY (task_id);


--
-- Name: harvest_use_type harvestUseType_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_use_type
    ADD CONSTRAINT "harvestUseType_pkey" PRIMARY KEY (harvest_use_type_id);


--
-- Name: harvest_use harvestUse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_use
    ADD CONSTRAINT "harvestUse_pkey" PRIMARY KEY (harvest_use_id);


--
-- Name: harvest_use harvestuse_activity_id_harvest_use_type_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_use
    ADD CONSTRAINT harvestuse_activity_id_harvest_use_type_id_unique UNIQUE (task_id, harvest_use_type_id);


--
-- Name: hs_code hs_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hs_code
    ADD CONSTRAINT hs_code_pkey PRIMARY KEY (hs_code_id);


--
-- Name: integrating_partner integrating_partner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.integrating_partner
    ADD CONSTRAINT integrating_partner_pkey PRIMARY KEY (partner_id);


--
-- Name: irrigation_task irrigationLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_task
    ADD CONSTRAINT "irrigationLog_pkey" PRIMARY KEY (task_id);


--
-- Name: irrigation_type irrigation_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_type
    ADD CONSTRAINT irrigation_type_pkey PRIMARY KEY (irrigation_type_id);


--
-- Name: knex_migrations_lock knex_migrations_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations_lock
    ADD CONSTRAINT knex_migrations_lock_pkey PRIMARY KEY (index);


--
-- Name: knex_migrations knex_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knex_migrations
    ADD CONSTRAINT knex_migrations_pkey PRIMARY KEY (id);


--
-- Name: line line_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line
    ADD CONSTRAINT line_pkey PRIMARY KEY (figure_id);


--
-- Name: location_defaults location_defaults_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_defaults
    ADD CONSTRAINT location_defaults_pkey PRIMARY KEY (location_id);


--
-- Name: location location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (location_id);


--
-- Name: maintenance_task maintenance_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_task
    ADD CONSTRAINT maintenance_task_pkey PRIMARY KEY (task_id);


--
-- Name: management_plan management_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_plan
    ADD CONSTRAINT management_plan_pkey PRIMARY KEY (management_plan_id);


--
-- Name: management_tasks management_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_tasks
    ADD CONSTRAINT management_tasks_pkey PRIMARY KEY (planting_management_plan_id, task_id);


--
-- Name: natural_area natural_area_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.natural_area
    ADD CONSTRAINT natural_area_pkey PRIMARY KEY (location_id);


--
-- Name: nitrogenBalance nitrogenBalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."nitrogenBalance"
    ADD CONSTRAINT "nitrogenBalance_pkey" PRIMARY KEY (nitrogen_id);


--
-- Name: nitrogenSchedule nitrogenSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."nitrogenSchedule"
    ADD CONSTRAINT "nitrogenSchedule_pkey" PRIMARY KEY (nitrogen_schedule_id);


--
-- Name: nomination_crop nomination_crop_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_crop
    ADD CONSTRAINT nomination_crop_pkey PRIMARY KEY (nomination_id, crop_id);


--
-- Name: nomination nomination_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination
    ADD CONSTRAINT nomination_pkey PRIMARY KEY (nomination_id);


--
-- Name: nomination_status nomination_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_status
    ADD CONSTRAINT nomination_status_pkey PRIMARY KEY (status_id);


--
-- Name: nomination_type nomination_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_type
    ADD CONSTRAINT nomination_type_pkey PRIMARY KEY (nomination_type);


--
-- Name: nomination_workflow nomination_workflow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_workflow
    ADD CONSTRAINT nomination_workflow_pkey PRIMARY KEY (workflow_id);


--
-- Name: nomination_workflow nomination_workflow_status_type_group_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_workflow
    ADD CONSTRAINT nomination_workflow_status_type_group_unique UNIQUE (status, type_group);


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_pkey PRIMARY KEY (notification_id);


--
-- Name: notification_user notification_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_user
    ADD CONSTRAINT notification_user_pkey PRIMARY KEY (notification_id, user_id);


--
-- Name: organicCertifierSurvey organicCertifierSurvey_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT "organicCertifierSurvey_pkey" PRIMARY KEY (survey_id);


--
-- Name: organic_history organic_history_location_id_effective_date_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organic_history
    ADD CONSTRAINT organic_history_location_id_effective_date_unique UNIQUE (location_id, effective_date);


--
-- Name: organic_history organic_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organic_history
    ADD CONSTRAINT organic_history_pkey PRIMARY KEY (organic_history_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_farm_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_farm_id_unique UNIQUE (farm_id);


--
-- Name: partner_reading_type partner_reading_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_reading_type
    ADD CONSTRAINT partner_reading_type_pkey PRIMARY KEY (partner_reading_type_id);


--
-- Name: password password_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password
    ADD CONSTRAINT password_pkey PRIMARY KEY (user_id);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: pest_control_task pestControlLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pest_control_task
    ADD CONSTRAINT "pestControlLog_pkey" PRIMARY KEY (task_id);


--
-- Name: pesticide pesticide_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesticide
    ADD CONSTRAINT pesticide_pkey PRIMARY KEY (pesticide_id);


--
-- Name: pin pin_location_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pin
    ADD CONSTRAINT pin_location_id_unique UNIQUE (location_id);


--
-- Name: pin pin_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pin
    ADD CONSTRAINT pin_pkey PRIMARY KEY (location_id);


--
-- Name: planting_management_plan planting_management_plan_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planting_management_plan
    ADD CONSTRAINT planting_management_plan_pkey PRIMARY KEY (planting_management_plan_id);


--
-- Name: point point_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point
    ADD CONSTRAINT point_pkey PRIMARY KEY (figure_id);


--
-- Name: price price_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_pkey PRIMARY KEY (price_id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (product_id);


--
-- Name: residence residence_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.residence
    ADD CONSTRAINT residence_pkey PRIMARY KEY (location_id);


--
-- Name: rolePermissions rolePermissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rolePermissions"
    ADD CONSTRAINT "rolePermissions_pkey" PRIMARY KEY (role_id, permission_id);


--
-- Name: role role_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT role_pkey PRIMARY KEY (role_id);


--
-- Name: row_method row_method_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.row_method
    ADD CONSTRAINT row_method_pkey PRIMARY KEY (planting_management_plan_id);


--
-- Name: sale sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_pkey PRIMARY KEY (sale_id);


--
-- Name: sale_task sale_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_task
    ADD CONSTRAINT sale_task_pkey PRIMARY KEY (task_id);


--
-- Name: scouting_task scoutingLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scouting_task
    ADD CONSTRAINT "scoutingLog_pkey" PRIMARY KEY (task_id);


--
-- Name: plant_task seedLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_task
    ADD CONSTRAINT "seedLog_pkey" PRIMARY KEY (task_id);


--
-- Name: sensor sensor_location_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_location_id_unique UNIQUE (location_id);


--
-- Name: sensor sensor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_pkey PRIMARY KEY (location_id);


--
-- Name: sensor_reading sensor_reading_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor_reading
    ADD CONSTRAINT sensor_reading_pkey PRIMARY KEY (reading_id);


--
-- Name: sensor_reading_type sensor_reading_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor_reading_type
    ADD CONSTRAINT sensor_reading_type_pkey PRIMARY KEY (sensor_reading_type_id);


--
-- Name: shift shift_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift
    ADD CONSTRAINT shift_pkey PRIMARY KEY (shift_id);


--
-- Name: showedSpotlight showedSpotlight_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."showedSpotlight"
    ADD CONSTRAINT "showedSpotlight_pkey" PRIMARY KEY (user_id);


--
-- Name: social_task social_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_task
    ADD CONSTRAINT social_task_pkey PRIMARY KEY (task_id);


--
-- Name: soil_task soilDataLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_task
    ADD CONSTRAINT "soilDataLog_pkey" PRIMARY KEY (task_id);


--
-- Name: supportTicket supportTicket_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."supportTicket"
    ADD CONSTRAINT "supportTicket_pkey" PRIMARY KEY (support_ticket_id);


--
-- Name: task_type taskType_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_type
    ADD CONSTRAINT "taskType_pkey" PRIMARY KEY (task_type_id);


--
-- Name: transplant_task transplant_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transplant_task
    ADD CONSTRAINT transplant_task_pkey PRIMARY KEY (task_id);


--
-- Name: transport_task transport_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_task
    ADD CONSTRAINT transport_task_pkey PRIMARY KEY (task_id);


--
-- Name: userFarm userFarm_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userFarm"
    ADD CONSTRAINT "userFarm_pkey" PRIMARY KEY (user_id, farm_id);


--
-- Name: userLog userLog_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userLog"
    ADD CONSTRAINT "userLog_pkey" PRIMARY KEY (user_log_id);


--
-- Name: user_status user_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_status
    ADD CONSTRAINT user_status_pkey PRIMARY KEY (status_id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: wash_and_pack_task wash_and_pack_task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wash_and_pack_task
    ADD CONSTRAINT wash_and_pack_task_pkey PRIMARY KEY (task_id);


--
-- Name: waterBalanceSchedule waterBalanceSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."waterBalanceSchedule"
    ADD CONSTRAINT "waterBalanceSchedule_pkey" PRIMARY KEY (water_balance_schedule_id);


--
-- Name: waterBalance waterBalance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."waterBalance"
    ADD CONSTRAINT "waterBalance_pkey" PRIMARY KEY (water_balance_id);


--
-- Name: water_valve water_valve_location_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_valve
    ADD CONSTRAINT water_valve_location_id_unique UNIQUE (location_id);


--
-- Name: water_valve water_valve_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_valve
    ADD CONSTRAINT water_valve_pkey PRIMARY KEY (location_id);


--
-- Name: weatherHourly weatherHourly_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."weatherHourly"
    ADD CONSTRAINT "weatherHourly_pkey" PRIMARY KEY (weather_hourly_id);


--
-- Name: weather weather_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather
    ADD CONSTRAINT weather_pkey PRIMARY KEY (weather_id);


--
-- Name: weather_station weather_station_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather_station
    ADD CONSTRAINT weather_station_pkey PRIMARY KEY (id);


--
-- Name: yield yield_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.yield
    ADD CONSTRAINT yield_pkey PRIMARY KEY (yield_id);


--
-- Name: management_tasks activitycrops_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_tasks
    ADD CONSTRAINT activitycrops_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: location_tasks activityfields_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_tasks
    ADD CONSTRAINT activityfields_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: location_tasks activityfields_field_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_tasks
    ADD CONSTRAINT activityfields_field_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: task activitylog_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT activitylog_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: task activitylog_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT activitylog_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: area area_figure_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.area
    ADD CONSTRAINT area_figure_id_foreign FOREIGN KEY (figure_id) REFERENCES public.figure(figure_id);


--
-- Name: barn barn_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.barn
    ADD CONSTRAINT barn_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: bed_method bed_method_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bed_method
    ADD CONSTRAINT bed_method_planting_management_plan_id_foreign FOREIGN KEY (planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: broadcast_method broadcast_method_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.broadcast_method
    ADD CONSTRAINT broadcast_method_planting_management_plan_id_foreign FOREIGN KEY (planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: buffer_zone buffer_zone_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.buffer_zone
    ADD CONSTRAINT buffer_zone_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: ceremonial_area ceremonial_area_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ceremonial_area
    ADD CONSTRAINT ceremonial_area_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: certifier_country certifier_country_certifier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifier_country
    ADD CONSTRAINT certifier_country_certifier_id_foreign FOREIGN KEY (certifier_id) REFERENCES public.certifiers(certifier_id);


--
-- Name: certifier_country certifier_country_country_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifier_country
    ADD CONSTRAINT certifier_country_country_id_foreign FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: certifiers certifiers_certification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.certifiers
    ADD CONSTRAINT certifiers_certification_id_foreign FOREIGN KEY (certification_id) REFERENCES public.certifications(certification_id);


--
-- Name: cleaning_task cleaning_task_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cleaning_task
    ADD CONSTRAINT cleaning_task_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(product_id);


--
-- Name: cleaning_task cleaning_task_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cleaning_task
    ADD CONSTRAINT cleaning_task_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id);


--
-- Name: container_method container_method_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_method
    ADD CONSTRAINT container_method_planting_management_plan_id_foreign FOREIGN KEY (planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: watercourse creek_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.watercourse
    ADD CONSTRAINT creek_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: crop crop_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: crop crop_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: crop_management_plan crop_management_plan_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_management_plan
    ADD CONSTRAINT crop_management_plan_management_plan_id_foreign FOREIGN KEY (management_plan_id) REFERENCES public.management_plan(management_plan_id);


--
-- Name: crop crop_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: crop_variety crop_variety_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety
    ADD CONSTRAINT crop_variety_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: crop_variety crop_variety_crop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety
    ADD CONSTRAINT crop_variety_crop_id_foreign FOREIGN KEY (crop_id) REFERENCES public.crop(crop_id);


--
-- Name: crop_variety crop_variety_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety
    ADD CONSTRAINT crop_variety_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: crop_variety_sale crop_variety_sale_crop_variety_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety_sale
    ADD CONSTRAINT crop_variety_sale_crop_variety_id_foreign FOREIGN KEY (crop_variety_id) REFERENCES public.crop_variety(crop_variety_id);


--
-- Name: crop_variety_sale crop_variety_sale_sale_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety_sale
    ADD CONSTRAINT crop_variety_sale_sale_id_foreign FOREIGN KEY (sale_id) REFERENCES public.sale(sale_id);


--
-- Name: crop_variety crop_variety_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_variety
    ADD CONSTRAINT crop_variety_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: cropDisease cropdisease_crop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."cropDisease"
    ADD CONSTRAINT cropdisease_crop_id_foreign FOREIGN KEY (crop_id) REFERENCES public.crop(crop_id);


--
-- Name: cropDisease cropdisease_disease_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."cropDisease"
    ADD CONSTRAINT cropdisease_disease_id_foreign FOREIGN KEY (disease_id) REFERENCES public.disease(disease_id);


--
-- Name: custom_location custom_location_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.custom_location
    ADD CONSTRAINT custom_location_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: disease disease_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disease
    ADD CONSTRAINT disease_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: disease disease_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disease
    ADD CONSTRAINT disease_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: disease disease_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.disease
    ADD CONSTRAINT disease_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: document document_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: document document_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id) ON DELETE CASCADE;


--
-- Name: document document_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.document
    ADD CONSTRAINT document_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: emailToken emailtoken_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."emailToken"
    ADD CONSTRAINT emailtoken_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: emailToken emailtoken_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."emailToken"
    ADD CONSTRAINT emailtoken_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: farm farm_country_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm
    ADD CONSTRAINT farm_country_id_foreign FOREIGN KEY (country_id) REFERENCES public.countries(id);


--
-- Name: farm farm_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm
    ADD CONSTRAINT farm_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: farm farm_default_initial_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm
    ADD CONSTRAINT farm_default_initial_location_id_foreign FOREIGN KEY (default_initial_location_id) REFERENCES public.location(location_id);


--
-- Name: farm_external_integration farm_external_integration_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_external_integration
    ADD CONSTRAINT farm_external_integration_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: farm_external_integration farm_external_integration_partner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_external_integration
    ADD CONSTRAINT farm_external_integration_partner_id_foreign FOREIGN KEY (partner_id) REFERENCES public.integrating_partner(partner_id);


--
-- Name: farm_site_boundary farm_site_boundary_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm_site_boundary
    ADD CONSTRAINT farm_site_boundary_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: farm farm_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.farm
    ADD CONSTRAINT farm_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: farmDataSchedule farmdataschedule_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmDataSchedule"
    ADD CONSTRAINT farmdataschedule_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: farmExpense farmexpense_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpense"
    ADD CONSTRAINT farmexpense_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: farmExpense farmexpense_expense_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpense"
    ADD CONSTRAINT farmexpense_expense_type_id_foreign FOREIGN KEY (expense_type_id) REFERENCES public."farmExpenseType"(expense_type_id);


--
-- Name: farmExpense farmexpense_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpense"
    ADD CONSTRAINT farmexpense_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: farmExpense farmexpense_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpense"
    ADD CONSTRAINT farmexpense_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: farmExpenseType farmexpensetype_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpenseType"
    ADD CONSTRAINT farmexpensetype_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: farmExpenseType farmexpensetype_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpenseType"
    ADD CONSTRAINT farmexpensetype_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id) ON DELETE CASCADE;


--
-- Name: farmExpenseType farmexpensetype_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmExpenseType"
    ADD CONSTRAINT farmexpensetype_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: fence fence_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fence
    ADD CONSTRAINT fence_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: fertilizer fertilizer_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fertilizer
    ADD CONSTRAINT fertilizer_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: fertilizer fertilizer_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fertilizer
    ADD CONSTRAINT fertilizer_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: fertilizer fertilizer_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fertilizer
    ADD CONSTRAINT fertilizer_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: soil_amendment_task fertilizerlog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_amendment_task
    ADD CONSTRAINT fertilizerlog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: field field_field_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field_field_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: field field_station_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field
    ADD CONSTRAINT field_station_id_foreign FOREIGN KEY (station_id) REFERENCES public.weather_station(id);


--
-- Name: field_work_task field_work_task_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_task
    ADD CONSTRAINT field_work_task_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: field_work_task field_work_task_field_work_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_task
    ADD CONSTRAINT field_work_task_field_work_type_id_foreign FOREIGN KEY (field_work_type_id) REFERENCES public.field_work_type(field_work_type_id);


--
-- Name: field_work_task field_work_task_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_task
    ADD CONSTRAINT field_work_task_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: field_work_type field_work_type_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_type
    ADD CONSTRAINT field_work_type_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: field_work_type field_work_type_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_type
    ADD CONSTRAINT field_work_type_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: field_work_type field_work_type_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_type
    ADD CONSTRAINT field_work_type_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: field_work_task fieldworklog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.field_work_task
    ADD CONSTRAINT fieldworklog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: figure figure_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.figure
    ADD CONSTRAINT figure_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: file file_document_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.file
    ADD CONSTRAINT file_document_id_foreign FOREIGN KEY (document_id) REFERENCES public.document(document_id) ON DELETE CASCADE;


--
-- Name: sale fk_crop_sale_farm_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT fk_crop_sale_farm_id FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: garden garden_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garden
    ADD CONSTRAINT garden_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: garden garden_station_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garden
    ADD CONSTRAINT garden_station_id_foreign FOREIGN KEY (station_id) REFERENCES public.weather_station(id);


--
-- Name: gate gate_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gate
    ADD CONSTRAINT gate_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: greenhouse greenhouse_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.greenhouse
    ADD CONSTRAINT greenhouse_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: surface_water ground_water_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.surface_water
    ADD CONSTRAINT ground_water_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: harvest_task harvestlog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_task
    ADD CONSTRAINT harvestlog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: harvest_use harvestuse_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_use
    ADD CONSTRAINT harvestuse_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.harvest_task(task_id) ON DELETE CASCADE;


--
-- Name: harvest_use harvestuse_harvest_use_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.harvest_use
    ADD CONSTRAINT harvestuse_harvest_use_type_id_foreign FOREIGN KEY (harvest_use_type_id) REFERENCES public.harvest_use_type(harvest_use_type_id) ON DELETE CASCADE;


--
-- Name: irrigation_task irrigation_task_irrigation_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_task
    ADD CONSTRAINT irrigation_task_irrigation_type_id_foreign FOREIGN KEY (irrigation_type_id) REFERENCES public.irrigation_type(irrigation_type_id);


--
-- Name: irrigation_task irrigation_task_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_task
    ADD CONSTRAINT irrigation_task_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: irrigation_type irrigation_type_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_type
    ADD CONSTRAINT irrigation_type_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: irrigation_type irrigation_type_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_type
    ADD CONSTRAINT irrigation_type_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: irrigation_task irrigationlog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.irrigation_task
    ADD CONSTRAINT irrigationlog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: line line_figure_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.line
    ADD CONSTRAINT line_figure_id_foreign FOREIGN KEY (figure_id) REFERENCES public.figure(figure_id);


--
-- Name: location location_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: location_defaults location_defaults_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_defaults
    ADD CONSTRAINT location_defaults_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: location_defaults location_defaults_irrigation_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_defaults
    ADD CONSTRAINT location_defaults_irrigation_type_id_foreign FOREIGN KEY (irrigation_type_id) REFERENCES public.irrigation_type(irrigation_type_id);


--
-- Name: location_defaults location_defaults_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_defaults
    ADD CONSTRAINT location_defaults_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: location_defaults location_defaults_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location_defaults
    ADD CONSTRAINT location_defaults_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: location location_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: location location_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.location
    ADD CONSTRAINT location_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: maintenance_task maintenance_task_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenance_task
    ADD CONSTRAINT maintenance_task_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id);


--
-- Name: management_plan management_plan_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_plan
    ADD CONSTRAINT management_plan_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: management_plan management_plan_crop_variety_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_plan
    ADD CONSTRAINT management_plan_crop_variety_id_foreign FOREIGN KEY (crop_variety_id) REFERENCES public.crop_variety(crop_variety_id);


--
-- Name: management_plan management_plan_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_plan
    ADD CONSTRAINT management_plan_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: management_tasks management_tasks_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.management_tasks
    ADD CONSTRAINT management_tasks_planting_management_plan_id_foreign FOREIGN KEY (planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: natural_area natural_area_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.natural_area
    ADD CONSTRAINT natural_area_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: nitrogenBalance nitrogenbalance_field_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."nitrogenBalance"
    ADD CONSTRAINT nitrogenbalance_field_id_foreign FOREIGN KEY (location_id) REFERENCES public.field(location_id) ON DELETE CASCADE;


--
-- Name: nitrogenSchedule nitrogenschedule_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."nitrogenSchedule"
    ADD CONSTRAINT nitrogenschedule_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: nomination nomination_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination
    ADD CONSTRAINT nomination_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: nomination_crop nomination_crop_crop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_crop
    ADD CONSTRAINT nomination_crop_crop_id_foreign FOREIGN KEY (crop_id) REFERENCES public.crop(crop_id);


--
-- Name: nomination_crop nomination_crop_nomination_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_crop
    ADD CONSTRAINT nomination_crop_nomination_id_foreign FOREIGN KEY (nomination_id) REFERENCES public.nomination(nomination_id);


--
-- Name: nomination nomination_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination
    ADD CONSTRAINT nomination_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: nomination nomination_nomination_type_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination
    ADD CONSTRAINT nomination_nomination_type_foreign FOREIGN KEY (nomination_type) REFERENCES public.nomination_type(nomination_type);


--
-- Name: nomination_status nomination_status_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_status
    ADD CONSTRAINT nomination_status_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: nomination_status nomination_status_nomination_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_status
    ADD CONSTRAINT nomination_status_nomination_id_foreign FOREIGN KEY (nomination_id) REFERENCES public.nomination(nomination_id);


--
-- Name: nomination_status nomination_status_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_status
    ADD CONSTRAINT nomination_status_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: nomination_status nomination_status_workflow_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_status
    ADD CONSTRAINT nomination_status_workflow_id_foreign FOREIGN KEY (workflow_id) REFERENCES public.nomination_workflow(workflow_id);


--
-- Name: nomination_type nomination_type_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_type
    ADD CONSTRAINT nomination_type_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: nomination_type nomination_type_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_type
    ADD CONSTRAINT nomination_type_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: nomination nomination_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination
    ADD CONSTRAINT nomination_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: nomination_workflow nomination_workflow_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_workflow
    ADD CONSTRAINT nomination_workflow_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: nomination_workflow nomination_workflow_type_group_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_workflow
    ADD CONSTRAINT nomination_workflow_type_group_foreign FOREIGN KEY (type_group) REFERENCES public.nomination_type(nomination_type);


--
-- Name: nomination_workflow nomination_workflow_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nomination_workflow
    ADD CONSTRAINT nomination_workflow_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: notification notification_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: notification notification_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: notification notification_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT notification_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: notification_user notification_user_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_user
    ADD CONSTRAINT notification_user_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: notification_user notification_user_notification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_user
    ADD CONSTRAINT notification_user_notification_id_foreign FOREIGN KEY (notification_id) REFERENCES public.notification(notification_id);


--
-- Name: notification_user notification_user_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_user
    ADD CONSTRAINT notification_user_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: notification_user notification_user_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_user
    ADD CONSTRAINT notification_user_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: organic_history organic_history_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organic_history
    ADD CONSTRAINT organic_history_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: organic_history organic_history_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organic_history
    ADD CONSTRAINT organic_history_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: organic_history organic_history_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.organic_history
    ADD CONSTRAINT organic_history_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_certification_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_certification_id_foreign FOREIGN KEY (certification_id) REFERENCES public.certifications(certification_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_certifier_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_certifier_id_foreign FOREIGN KEY (certifier_id) REFERENCES public.certifiers(certifier_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_farm_id_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_farm_id_created_by_user_id_foreign FOREIGN KEY (farm_id, created_by_user_id) REFERENCES public."userFarm"(farm_id, user_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_farm_id_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_farm_id_updated_by_user_id_foreign FOREIGN KEY (farm_id, updated_by_user_id) REFERENCES public."userFarm"(farm_id, user_id);


--
-- Name: organicCertifierSurvey organiccertifiersurvey_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."organicCertifierSurvey"
    ADD CONSTRAINT organiccertifiersurvey_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: partner_reading_type partner_reading_type_partner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.partner_reading_type
    ADD CONSTRAINT partner_reading_type_partner_id_foreign FOREIGN KEY (partner_id) REFERENCES public.integrating_partner(partner_id);


--
-- Name: password password_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password
    ADD CONSTRAINT password_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: pest_control_task pest_control_task_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pest_control_task
    ADD CONSTRAINT pest_control_task_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(product_id);


--
-- Name: pest_control_task pestcontrollog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pest_control_task
    ADD CONSTRAINT pestcontrollog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: pesticide pesticide_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesticide
    ADD CONSTRAINT pesticide_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: pesticide pesticide_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesticide
    ADD CONSTRAINT pesticide_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: pesticide pesticide_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesticide
    ADD CONSTRAINT pesticide_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: pin pin_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pin
    ADD CONSTRAINT pin_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: plant_task plant_task_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_task
    ADD CONSTRAINT plant_task_planting_management_plan_id_foreign FOREIGN KEY (planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: planting_management_plan planting_management_plan_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planting_management_plan
    ADD CONSTRAINT planting_management_plan_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: planting_management_plan planting_management_plan_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.planting_management_plan
    ADD CONSTRAINT planting_management_plan_management_plan_id_foreign FOREIGN KEY (management_plan_id) REFERENCES public.management_plan(management_plan_id);


--
-- Name: point point_figure_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point
    ADD CONSTRAINT point_figure_id_foreign FOREIGN KEY (figure_id) REFERENCES public.figure(figure_id);


--
-- Name: price price_crop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_crop_id_foreign FOREIGN KEY (crop_id) REFERENCES public.crop(crop_id);


--
-- Name: price price_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: product product_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: product product_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: product product_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: residence residence_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.residence
    ADD CONSTRAINT residence_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: rolePermissions rolepermissions_permission_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rolePermissions"
    ADD CONSTRAINT rolepermissions_permission_id_foreign FOREIGN KEY (permission_id) REFERENCES public.permissions(permission_id) ON DELETE CASCADE;


--
-- Name: rolePermissions rolepermissions_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."rolePermissions"
    ADD CONSTRAINT rolepermissions_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.role(role_id) ON DELETE CASCADE;


--
-- Name: row_method row_method_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.row_method
    ADD CONSTRAINT row_method_planting_management_plan_id_foreign FOREIGN KEY (planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: sale sale_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: sale_task sale_task_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_task
    ADD CONSTRAINT sale_task_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id);


--
-- Name: sale sale_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale
    ADD CONSTRAINT sale_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: scouting_task scoutinglog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scouting_task
    ADD CONSTRAINT scoutinglog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: plant_task seedlog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plant_task
    ADD CONSTRAINT seedlog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: sensor sensor_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: sensor sensor_partner_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor
    ADD CONSTRAINT sensor_partner_id_foreign FOREIGN KEY (partner_id) REFERENCES public.integrating_partner(partner_id);


--
-- Name: sensor_reading sensor_reading_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor_reading
    ADD CONSTRAINT sensor_reading_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.sensor(location_id) ON DELETE CASCADE;


--
-- Name: sensor_reading_type sensor_reading_type_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor_reading_type
    ADD CONSTRAINT sensor_reading_type_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.sensor(location_id) ON DELETE CASCADE;


--
-- Name: sensor_reading_type sensor_reading_type_partner_reading_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sensor_reading_type
    ADD CONSTRAINT sensor_reading_type_partner_reading_type_id_foreign FOREIGN KEY (partner_reading_type_id) REFERENCES public.partner_reading_type(partner_reading_type_id);


--
-- Name: shift shift_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift
    ADD CONSTRAINT shift_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: shift shift_farm_id_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift
    ADD CONSTRAINT shift_farm_id_user_id_foreign FOREIGN KEY (farm_id, user_id) REFERENCES public."userFarm"(farm_id, user_id);


--
-- Name: shift shift_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shift
    ADD CONSTRAINT shift_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: shiftTask shifttask_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."shiftTask"
    ADD CONSTRAINT shifttask_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: shiftTask shifttask_field_crop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."shiftTask"
    ADD CONSTRAINT shifttask_field_crop_id_foreign FOREIGN KEY (management_plan_id) REFERENCES public.management_plan(management_plan_id) ON DELETE CASCADE;


--
-- Name: shiftTask shifttask_field_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."shiftTask"
    ADD CONSTRAINT shifttask_field_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id);


--
-- Name: shiftTask shifttask_shift_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."shiftTask"
    ADD CONSTRAINT shifttask_shift_id_foreign FOREIGN KEY (shift_id) REFERENCES public.shift(shift_id);


--
-- Name: shiftTask shifttask_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."shiftTask"
    ADD CONSTRAINT shifttask_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task_type(task_type_id);


--
-- Name: shiftTask shifttask_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."shiftTask"
    ADD CONSTRAINT shifttask_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: showedSpotlight showedspotlight_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."showedSpotlight"
    ADD CONSTRAINT showedspotlight_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: social_task social_task_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_task
    ADD CONSTRAINT social_task_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id);


--
-- Name: soil_amendment_task soil_amendment_task_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_amendment_task
    ADD CONSTRAINT soil_amendment_task_product_id_foreign FOREIGN KEY (product_id) REFERENCES public.product(product_id);


--
-- Name: soil_task soildatalog_activity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.soil_task
    ADD CONSTRAINT soildatalog_activity_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id) ON DELETE CASCADE;


--
-- Name: supportTicket supportticket_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."supportTicket"
    ADD CONSTRAINT supportticket_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: supportTicket supportticket_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."supportTicket"
    ADD CONSTRAINT supportticket_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: supportTicket supportticket_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."supportTicket"
    ADD CONSTRAINT supportticket_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: task task_assignee_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_assignee_foreign FOREIGN KEY (assignee_user_id) REFERENCES public.users(user_id);


--
-- Name: task task_type_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT task_type_foreign FOREIGN KEY (task_type_id) REFERENCES public.task_type(task_type_id);


--
-- Name: task_type tasktype_created_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_type
    ADD CONSTRAINT tasktype_created_by_user_id_foreign FOREIGN KEY (created_by_user_id) REFERENCES public.users(user_id);


--
-- Name: task_type tasktype_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_type
    ADD CONSTRAINT tasktype_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: task_type tasktype_updated_by_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task_type
    ADD CONSTRAINT tasktype_updated_by_user_id_foreign FOREIGN KEY (updated_by_user_id) REFERENCES public.users(user_id);


--
-- Name: transplant_task transplant_task_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transplant_task
    ADD CONSTRAINT transplant_task_planting_management_plan_id_foreign FOREIGN KEY (planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: transplant_task transplant_task_prev_planting_management_plan_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transplant_task
    ADD CONSTRAINT transplant_task_prev_planting_management_plan_id_foreign FOREIGN KEY (prev_planting_management_plan_id) REFERENCES public.planting_management_plan(planting_management_plan_id);


--
-- Name: transplant_task transplant_task_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transplant_task
    ADD CONSTRAINT transplant_task_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id);


--
-- Name: transport_task transport_task_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_task
    ADD CONSTRAINT transport_task_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id);


--
-- Name: task user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.task
    ADD CONSTRAINT user_id FOREIGN KEY (owner_user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: farmDataSchedule user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."farmDataSchedule"
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: userFarm user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userFarm"
    ADD CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON UPDATE CASCADE;


--
-- Name: userFarm userfarm_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userFarm"
    ADD CONSTRAINT userfarm_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id) ON DELETE CASCADE;


--
-- Name: userFarm userfarm_role_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userFarm"
    ADD CONSTRAINT userfarm_role_id_foreign FOREIGN KEY (role_id) REFERENCES public.role(role_id);


--
-- Name: userLog userlog_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userLog"
    ADD CONSTRAINT userlog_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: userLog userlog_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."userLog"
    ADD CONSTRAINT userlog_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- Name: users users_status_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_status_foreign FOREIGN KEY (status_id) REFERENCES public.user_status(status_id);


--
-- Name: wash_and_pack_task wash_and_pack_task_task_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wash_and_pack_task
    ADD CONSTRAINT wash_and_pack_task_task_id_foreign FOREIGN KEY (task_id) REFERENCES public.task(task_id);


--
-- Name: water_valve water_valve_location_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.water_valve
    ADD CONSTRAINT water_valve_location_id_foreign FOREIGN KEY (location_id) REFERENCES public.location(location_id) ON DELETE CASCADE;


--
-- Name: waterBalance waterbalance_crop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."waterBalance"
    ADD CONSTRAINT waterbalance_crop_id_foreign FOREIGN KEY (crop_id) REFERENCES public.crop(crop_id);


--
-- Name: waterBalance waterbalance_field_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."waterBalance"
    ADD CONSTRAINT waterbalance_field_id_foreign FOREIGN KEY (location_id) REFERENCES public.field(location_id) ON DELETE CASCADE;


--
-- Name: waterBalanceSchedule waterbalanceschedule_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."waterBalanceSchedule"
    ADD CONSTRAINT waterbalanceschedule_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- Name: weather weather_station_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.weather
    ADD CONSTRAINT weather_station_id_foreign FOREIGN KEY (station_id) REFERENCES public.weather_station(id);


--
-- Name: weatherHourly weatherhourly_station_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."weatherHourly"
    ADD CONSTRAINT weatherhourly_station_id_foreign FOREIGN KEY (station_id) REFERENCES public.weather_station(id);


--
-- Name: yield yield_crop_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.yield
    ADD CONSTRAINT yield_crop_id_foreign FOREIGN KEY (crop_id) REFERENCES public.crop(crop_id);


--
-- Name: yield yield_farm_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.yield
    ADD CONSTRAINT yield_farm_id_foreign FOREIGN KEY (farm_id) REFERENCES public.farm(farm_id);


--
-- PostgreSQL database dump complete
--

