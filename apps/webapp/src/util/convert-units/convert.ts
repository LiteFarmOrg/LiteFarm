import configureMeasurements, { allMeasures } from 'convert-units';

export const convert = (number: number) => configureMeasurements(allMeasures)(Number(number) || undefined);
