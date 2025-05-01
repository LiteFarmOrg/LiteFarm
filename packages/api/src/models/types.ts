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

import { Point } from '../util/ensembleService.types.js';

/**
 * This file should create and hold types that are identical to the model types.
 *
 * Add optional ? if type can be null, not based on required status.
 *
 * Once models can be converted to TS merge with the model file.
 *
 * TODO: RelationMappings
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

export type AddonPartner = {
  id: number;
  name: string;
  access_token: string;
  refresh_token: string;
  root_url: string;
  deactivated: boolean;
};

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
