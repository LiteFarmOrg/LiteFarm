import configureMeasurements, {
  allMeasures,
  AllMeasuresUnits,
  AllMeasuresSystems,
  Measure,
} from 'convert-units';
import {
  applicationRateVolume,
  applicationRateWeight,
  ApplicationRateVolumeUnits,
  ApplicationRateWeightUnits,
} from './applicationRates';
import {
  EvapotranspirationRateUnits,
  extendedSpeed,
  extendedVolume,
  WaterConsumptionUnits,
} from './extendedMeasures';

export type ExtendedMeasureUnits =
  | AllMeasuresUnits
  | ApplicationRateVolumeUnits
  | ApplicationRateWeightUnits
  | EvapotranspirationRateUnits
  | WaterConsumptionUnits;

const extendedMeasures: Record<string, Measure<AllMeasuresSystems, ExtendedMeasureUnits>> = {
  ...allMeasures,
  applicationRateVolume,
  applicationRateWeight,
  speed: extendedSpeed,
  volume: extendedVolume,
};

export const convert = (number: number) =>
  configureMeasurements(extendedMeasures)(Number(number) || undefined);
