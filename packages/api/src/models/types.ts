/*
 *  Copyright 2025 LiteFarm.org
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

/**
 * This file should create and hold types that are identical to the model types.
 * Use Utility types or other means if not suiting purpose
 *
 * TODO: RelationMappings -- not optional properties but a discriminated type (see IrrigationTask)
 *
 * How to use:
 *  - Keep identical to model
 *  - Add optional ? if type can be null, not based on required status.
 *  - If you find a type is wrong, please also look to see if the model is correct, run tests
 *  - If the model is correct, use a utility type instead of adding optionals etc.
 *
 * Once models can be converted to TS merge with the model file.
 *
 */

export type Timestamps = {
  created_at: string;
  updated_at: string;
};

export type UserNotificationSetting = {
  alert_weather: boolean;
  alert_worker_finish: boolean;
  alert_action_after_scouting: boolean;
  alert_before_planned_date: boolean;
  alert_pest: boolean;
};

export enum GENDER {
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export interface User extends Timestamps {
  user_id: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  phone_number?: string;
  user_address?: string;
  email: string;
  sandbox_user: boolean;
  notification_setting: UserNotificationSetting;
  language_preference: string;
  status_id: number; // TODO: user status model does not exist
  gender: GENDER;
  birth_year: number;
  do_not_email: boolean;
}

interface UserTimeStamps extends Timestamps {
  created_by_user_id: User['user_id'];
  updated_by_user_id: User['user_id'];
}

interface BaseProperties extends UserTimeStamps {
  deleted: boolean;
}

enum FarmUnitSystem {
  IMPERIAL = 'imperial',
  METRIC = 'metric',
}

enum FarmDateFormat {
  'MM/DD/YY' = 'MM/DD/YY',
  'DD/MM/YY' = 'DD/MM/YY',
  'YY/MM/DD' = 'YY/MM/DD',
}

enum FarmCurrencyCode {
  AFN = 'AFN',
  ALL = 'ALL',
  DZD = 'DZD',
  USD = 'USD',
  EUR = 'EUR',
  AOA = 'AOA',
  XCD = 'XCD',
  ARS = 'ARS',
  AMD = 'AMD',
  AWG = 'AWG',
  AUD = 'AUD',
  AZN = 'AZN',
  BSD = 'BSD',
  BHD = 'BHD',
  BDT = 'BDT',
  BBD = 'BBD',
  BYR = 'BYR',
  BZD = 'BZD',
  XOF = 'XOF',
  BMD = 'BMD',
  BTN = 'BTN',
  INR = 'INR',
  BOB = 'BOB',
  BOV = 'BOV',
  BAM = 'BAM',
  BWP = 'BWP',
  NOK = 'NOK',
  BRL = 'BRL',
  BND = 'BND',
  BGN = 'BGN',
  BIF = 'BIF',
  CVE = 'CVE',
  KHR = 'KHR',
  XAF = 'XAF',
  CAD = 'CAD',
  KYD = 'KYD',
  CLF = 'CLF',
  CLP = 'CLP',
  CNY = 'CNY',
  COP = 'COP',
  COU = 'COU',
  KMF = 'KMF',
  CDF = 'CDF',
  NZD = 'NZD',
  CRC = 'CRC',
  HRK = 'HRK',
  CUC = 'CUC',
  CUP = 'CUP',
  ANG = 'ANG',
  CZK = 'CZK',
  DKK = 'DKK',
  DJF = 'DJF',
  DOP = 'DOP',
  EGP = 'EGP',
  SVC = 'SVC',
  ERN = 'ERN',
  ETB = 'ETB',
  FKP = 'FKP',
  FJD = 'FJD',
  XPF = 'XPF',
  GMD = 'GMD',
  GEL = 'GEL',
  GHS = 'GHS',
  GIP = 'GIP',
  GTQ = 'GTQ',
  GBP = 'GBP',
  GNF = 'GNF',
  GYD = 'GYD',
  HTG = 'HTG',
  HNL = 'HNL',
  HKD = 'HKD',
  HUF = 'HUF',
  ISK = 'ISK',
  IDR = 'IDR',
  XDR = 'XDR',
  IRR = 'IRR',
  IQD = 'IQD',
  ILS = 'ILS',
  JMD = 'JMD',
  JPY = 'JPY',
  JOD = 'JOD',
  KZT = 'KZT',
  KES = 'KES',
  KPW = 'KPW',
  KRW = 'KRW',
  KWD = 'KWD',
  KGS = 'KGS',
  LAK = 'LAK',
  LBP = 'LBP',
  LSL = 'LSL',
  ZAR = 'ZAR',
  LRD = 'LRD',
  LYD = 'LYD',
  CHF = 'CHF',
  MOP = 'MOP',
  MKD = 'MKD',
  MGA = 'MGA',
  MWK = 'MWK',
  MYR = 'MYR',
  MVR = 'MVR',
  MRU = 'MRU',
  MUR = 'MUR',
  XUA = 'XUA',
  MXN = 'MXN',
  MXV = 'MXV',
  MDL = 'MDL',
  MNT = 'MNT',
  MAD = 'MAD',
  MZN = 'MZN',
  MMK = 'MMK',
  NAD = 'NAD',
  NPR = 'NPR',
  NIO = 'NIO',
  NGN = 'NGN',
  OMR = 'OMR',
  PKR = 'PKR',
  PAB = 'PAB',
  PGK = 'PGK',
  PYG = 'PYG',
  PEN = 'PEN',
  PHP = 'PHP',
  PLN = 'PLN',
  QAR = 'QAR',
  RON = 'RON',
  RUB = 'RUB',
  RWF = 'RWF',
  SHP = 'SHP',
  WST = 'WST',
  STN = 'STN',
  SAR = 'SAR',
  RSD = 'RSD',
  SCR = 'SCR',
  SLL = 'SLL',
  SGD = 'SGD',
  XSU = 'XSU',
  SBD = 'SBD',
  SOS = 'SOS',
  SSP = 'SSP',
  LKR = 'LKR',
  SDG = 'SDG',
  SRD = 'SRD',
  SZL = 'SZL',
  SEK = 'SEK',
  CHE = 'CHE',
  CHW = 'CHW',
  SYP = 'SYP',
  TWD = 'TWD',
  TJS = 'TJS',
  TZS = 'TZS',
  THB = 'THB',
  TOP = 'TOP',
  TTD = 'TTD',
  TND = 'TND',
  TRY = 'TRY',
  TMT = 'TMT',
  UGX = 'UGX',
  UAH = 'UAH',
  AED = 'AED',
  USN = 'USN',
  UYI = 'UYI',
  UYU = 'UYU',
  UZS = 'UZS',
  VUV = 'VUV',
  VEF = 'VEF',
  VND = 'VND',
  YER = 'YER',
  ZMW = 'ZMW',
  ZWL = 'ZWL',
}

export type FarmUnit = {
  measurement: FarmUnitSystem;
  currency: FarmCurrencyCode;
  date_format: FarmDateFormat;
};

export type Country = {
  id: number;
  country_name: string;
  currency: string;
  symbol: string;
  iso: string;
  unit: string;
};

export type Point = {
  lat: number;
  lng: number;
};

export interface Farm extends BaseProperties {
  farm_id: string;
  farm_name: string;
  address: string;
  owner_operated: boolean;
  grid_points: Point;
  country_id: Country['id'];
  farm_phone_number: string;
  sandbox_farm: boolean;
  units: FarmUnit;
  default_initial_location_id?: string;
  utc_offset: number;
  farm_image_url?: string;
  farm_image_thumbnail_url?: string;
  // sandbox_bool: string;
}

export interface TaskType extends BaseProperties {
  task_type_id: number;
  task_name: string;
  farm_id: Farm['farm_id'];
  task_translation_key: string;
}

enum AbandonmentReason {
  OTHER = 'OTHER',
  CROP_FAILURE = 'CROP_FAILURE',
  LABOUR_ISSUE = 'LABOUR_ISSUE',
  MARKET_PROBLEM = 'MARKET_PROBLEM',
  WEATHER = 'WEATHER',
  MACHINERY_ISSUE = 'MACHINERY_ISSUE',
  SCHEDULING_ISSUE = 'SCHEDULING_ISSUE',
  NO_ANIMALS = 'NO_ANIMALS',
}
export interface Task extends BaseProperties {
  task_id: number;
  task_type_id: TaskType['task_type_id'];
  due_date: string;
  notes?: string;
  completion_notes?: string;
  owner_user_id: User['user_id'];
  assignee_user_id?: User['user_id'];
  coordinates: { type: ['object', 'null'] };
  duration?: number;
  wage_at_moment?: number;
  happiness?: number;
  complete_date?: string;
  late_time?: string;
  for_review_time?: string;
  abandon_date?: string;
  abandonment_reason: AbandonmentReason;
  other_abandonment_reason?: string;
  abandonment_notes?: string;
  override_hourly_wage: boolean;
  // photo deprecated LF-3471
  photo?: string;
  // action_needed deprecated LF-3471
  action_needed: boolean;
}

export interface Location extends BaseProperties {
  location_id: string;
  farm_id: Farm['farm_id'];
  name: string;
  notes: string;
}

export interface IrrigationType extends BaseProperties {
  irrigation_type_id: number;
  irrigation_type_name: string;
  farm_id: Farm['farm_id'];
  default_measuring_type: string;
  irrigation_type_translation_key: string;
}

export type IrrigationTaskDetails = {
  task_id: Task['task_id'];
  irrigation_type_id: IrrigationType['irrigation_type_id'];
  irrigation_type_name: string;
  estimated_duration?: number;
  estimated_duration_unit?: string;
  estimated_flow_rate?: number;
  estimated_flow_rate_unit?: string;
  location_id?: string;
  estimated_water_usage?: number;
  estimated_water_usage_unit?: string;
  application_depth?: number;
  application_depth_unit?: string;
  measuring_type: string;
  percent_of_location_irrigated?: number;
  default_location_flow_rate: boolean;
  default_location_application_depth: boolean;
  default_irrigation_task_type_location: boolean;
  default_irrigation_task_type_measurement: boolean;
  irrigation_prescription_external_id?: number;
};

export interface IrrigationTask extends Task {
  irrigation_task: IrrigationTaskDetails;
}

enum SeedingType {
  SEED = 'SEED',
  SEEDLING_OR_PLANTING_STOCK = 'SEEDLING_OR_PLANTING_STOCK',
}

enum CropLifecycleType {
  ANNUAL = 'ANNUAL',
  PERENNIAL = 'PERENNIAL',
}

enum IsTreated {
  YES = 'YES',
  NO = 'NO',
  NOT_SURE = 'NOT_SURE',
}

enum PlantingMethod {
  BROADCAST_METHOD = 'BROADCAST_METHOD',
  CONTAINER_METHOD = 'CONTAINER_METHOD',
  BED_METHOD = 'BED_METHOD',
  ROW_METHOD = 'ROW_METHOD',
}

type CropNutrients = {
  energy: number;
  ca: number;
  fe: number;
  mg: number;
  k: number;
  na: number;
  zn: number;
  cu: number;
  fl: number;
  mn: number;
  vita_rae: number;
  vitc: number;
  thiamin: number;
  riboflavin: number;
  niacin: number;
  vitb6: number;
  folate: number;
  vitb12: number;
  nutrient_credits: number;
};

enum CropGroup {
  FRUIT_AND_NUTS = 'Fruit and nuts',
  OTHER_CROPS = 'Other crops',
  STIMULANT_SPICE_AND_AROMATIC_CROPS = 'Stimulant, spice and aromatic crops',
  VEGETABLES_AND_MELONS = 'Vegetables and melons',
  CEREALS = 'Cereals',
  HIGH_STARCH_ROOT_TUBER_CROPS = 'High starch root/tuber crops',
  OILSEED_CROPS_AND_OLEAGINOUS_FRUITS = 'Oilseed crops and oleaginous fruits',
  LEGUMINOUS_CROPS = 'Leguminous crops',
  SUGAR_CROPS = 'Sugar crops',
  POTATOES_AND_YAMS = 'Potatoes and yams',
  BEVERAGE_AND_SPICE_CROPS = 'Beverage and spice crops',
}

enum CropSubgroup {
  BERRIES = 'Berries',
  CEREALS = 'Cereals',
  CITRUS_FRUITS = 'Citrus fruits',
  FIBRE_CROPS = 'Fibre crops',
  FLOWER_CROPS = 'Flower crops',
  FRUIT_BEARING_VEGETABLES = 'Fruit-bearing vegetables',
  GRAPES = 'Grapes',
  GRASSES_AND_OTHER_FODDER_CROPS = 'Grasses and other fodder crops',
  HIGH_STARCH_ROOT_TUBER_CROPS = 'High starch root/tuber crops',
  LEAFY_OR_STEM_VEGETABLES = 'Leafy or stem vegetables',
  LEGUMINOUS_CROPS = 'Leguminous crops',
  LENTILS = 'Lentils',
  MEDICINAL_PESTICIDAL_OR_SIMILAR_CROPS = 'Medicinal, pesticidal or similar crops',
  MELONS = 'Melons',
  MIXED_CEREALS = 'Mixed cereals',
  MUSHROOMS_AND_TRUFFLES = 'Mushrooms and truffles',
  NUTS = 'Nuts',
  OILSEED_CROPS_AND_OLEAGINOUS_FRUITS = 'Oilseed crops and oleaginous fruits',
  OTHER_CROPS = 'Other crops',
  OTHER_FRUITS = 'Other fruits',
  OTHER_ROOTS_AND_TUBERS = 'Other roots and tubers',
  OTHER_TEMPORARY_OILSEED_CROPS = 'Other temporary oilseed crops',
  PERMANENT_OILSEED_CROPS = 'Permanent oilseed crops',
  POME_FRUITS_AND_STONE_FRUITS = 'Pome fruits and stone fruits',
  ROOT_BULB_OR_TUBEROUS_VEGETABLES = 'Root, bulb or tuberous vegetables',
  RUBBER = 'Rubber',
  SPICE_AND_AROMATIC_CROPS = 'Spice and aromatic crops',
  STIMULANT_CROPS = 'Stimulant crops',
  SUGAR_CROPS = 'Sugar crops',
  TOBACCO = 'Tobacco',
  TROPICAL_AND_SUBTROPICAL_FRUITS = 'Tropical and subtropical fruits',
}

type SeedingAndPlantingDetails = {
  seeding_type: SeedingType;
  lifecycle: CropLifecycleType;
  planting_method?: PlantingMethod;
  can_be_cover_crop?: boolean;
  planting_depth?: number;
  yield_per_area?: number;
  average_seed_weight?: number;
  yield_per_plant?: number;
  plant_spacing?: number;
  needs_transplant?: boolean;
  germination_days?: number;
  transplant_days?: number;
  harvest_days?: number;
  termination_days?: number;
  seeding_rate?: number;
  hs_code_id?: string | number;
};
export interface Crop extends BaseProperties, CropNutrients, Partial<SeedingAndPlantingDetails> {
  crop_id: number;
  farm_id: Farm['farm_id'];
  crop_common_name: string;
  crop_variety: string;
  crop_genus: string;
  crop_specie: string;
  crop_group?: CropGroup;
  crop_subgroup?: CropSubgroup;
  max_rooting_depth: number;
  depletion_fraction: number;
  initial_kc: number;
  mid_kc: number;
  end_kc: number;
  max_height: number;
  percentrefuse: number;
  protein: number;
  lipid: number;
  fl: number;
  se: number;
  vite: number;
  pantothenic: number;
  vitk: number;
  is_avg_depth?: boolean;
  is_avg_nutrient?: boolean;
  is_avg_kc?: boolean;
  user_added: boolean;
  nutrient_notes: string;
  refuse: string;
  reviewed: boolean;
  crop_translation_key: string;
  crop_photo_url: string;
}
export interface CropVariety
  extends BaseProperties,
    Partial<CropNutrients>,
    SeedingAndPlantingDetails {
  crop_variety_id: string;
  crop_id: Crop['crop_id'];
  farm_id: Farm['farm_id'];
  crop_variety_name?: string;
  crop_varietal?: string;
  crop_cultivar?: string;
  supplier?: string;
  compliance_file_url?: string;
  organic?: boolean;
  treated?: IsTreated;
  genetically_engineered?: boolean;
  searched?: boolean;
  protein?: number;
  lipid?: number;
  ph?: number;
  crop_variety_photo_url: string;
}

enum Rating {
  ZERO,
  ONE,
  TWO,
  THREE,
  FOUR,
  FIVE,
}

// TODO: Where is this info?
type RepetitionConfig = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};
export interface ManagementPlanGroup extends BaseProperties {
  management_plan_group_id: string;
  repetition_count: number;
  repetition_config: RepetitionConfig;
}
export interface ManagementPlan extends BaseProperties {
  management_plan_id: number;
  crop_variety_id: CropVariety['crop_variety_id'];
  name: string;
  notes?: string;
  abandon_date?: string;
  start_date?: string;
  complete_date?: string;
  complete_notes?: string;
  rating?: Rating;
  abandon_reason?: string;
  management_plan_group_id: ManagementPlanGroup['management_plan_group_id'];
  repetition_number?: number;
}

export type AddonPartner = {
  id: number;
  name: string;
  access_token: string;
  refresh_token: string;
  root_url: string;
  deactivated: boolean;
};

export interface FarmAddon extends BaseProperties {
  id: number;
  farm_id: Farm['farm_id'];
  addon_partner_id: AddonPartner['id'];
  org_uuid: string;
  org_pk: number;
}

enum DocumentType {
  CLEANING_PRODUCT = 'CLEANING_PRODUCT',
  CROP_COMPLIANCE = 'CROP_COMPLIANCE',
  FERTILIZING_PRODUCT = 'FERTILIZING_PRODUCT',
  PEST_CONTROL_PRODUCT = 'PEST_CONTROL_PRODUCT',
  SOIL_AMENDMENT = 'SOIL_AMENDMENT',
  SOIL_SAMPLE_RESULTS = 'SOIL_SAMPLE_RESULTS',
  WATER_SAMPLE_RESULTS = 'WATER_SAMPLE_RESULTS',
  INVOICES = 'INVOICES',
  RECEIPTS = 'RECEIPTS',
  OTHER = 'OTHER',
}

export interface Document extends BaseProperties {
  document_id: string;
  farm_id: Farm['farm_id'];
  name: string;
  thumbnail_url?: string;
  valid_until?: string;
  notes?: string;
  no_expiration?: boolean;
  type?: DocumentType;
  archived: boolean;
}

export type File = {
  file_id: string;
  document_id: Document['document_id'];
  file_name: string;
  url: string;
  thumbnail_url?: string;
};

export interface DocumentWithFiles extends Document {
  files?: File[];
}

export type MarketProductCategory = {
  id: number;
  key: string;
};
