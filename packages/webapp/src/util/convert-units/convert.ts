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

type ExtendedMeasureUnits =
  | AllMeasuresUnits
  | ApplicationRateVolumeUnits
  | ApplicationRateWeightUnits;

const extendedMeasures: Record<string, Measure<AllMeasuresSystems, ExtendedMeasureUnits>> = {
  ...allMeasures,
  applicationRateVolume,
  applicationRateWeight,
};

export const convert = (number: number) =>
  configureMeasurements(extendedMeasures)(Number(number) || undefined);
