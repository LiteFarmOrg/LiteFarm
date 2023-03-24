import React from 'react';
import Unit from '../../../components/Form/Unit';
import { getUnitOptionMap } from '../../../util/convert-units/getUnitOptionMap';
import { componentDecorators } from '../../Pages/config/Decorators';
import { bufferZoneEnum, fieldEnum, waterValveEnum } from '../../../containers/constants';
import {
  area_perimeter,
  area_total_area,
  crop_age,
  line_width,
  water_valve_flow_rate,
  length_of_bed_or_row,
  soilAmounts,
  waterUsage,
  seedYield,
} from '../../../util/convert-units/unit';
import { useForm } from 'react-hook-form';
import { convert } from '../../../util/convert-units/convert';
import UnitTest, { getSystemUnmatchTestArgsAndPlay } from '../../../test-utils/storybook/unit';

const UnitWithHookForm = (props) => {
  const {
    register,
    setValue,
    getValues,
    watch,
    setError,
    control,
    handleSubmit,

    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: props.defaultValues,
  });
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Unit
        register={register}
        errors={errors[props.name]}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFromWatch={watch}
        control={control}
        {...props}
      />
    </form>
  );
};

export default {
  title: 'Components/Input/Unit',
  component: UnitWithHookForm,
  decorators: componentDecorators,
};

const Template = (args) => <UnitWithHookForm {...args} />;

export const Default = Template.bind({});
Default.args = {
  label: 'Default',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'imperial',
  required: true,
};
// Test simple input and errors
Default.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');

  await test.testSelectedUnit(UnitTest.getUnitLabelByValue('ft2'));
  await test.testNoInput();

  await test.selectUnit('ac');
  await test.testSelectedUnit('ac');
  await test.testNoError();

  await test.inputValueAndBlur('2');
  await test.testVisibleValue(2);
  await test.testHiddenValue(2, 'ac', area_total_area.databaseUnit);

  await test.clearInputAndBlur();
  await test.testRequiredError();

  await test.clearError();
  await test.testNoError();

  await test.inputValueAndBlur('1000000001');
  await test.testMaxValueError();

  await test.inputValueAndBlur('1000000000');
  await test.testNoError();

  await test.inputValueAndBlur('1000000000000');
  await test.testMaxValueError();

  await test.clearError();
  await test.testNoError();
};

export const HasLeaf = Template.bind({});
HasLeaf.args = {
  label: 'Default',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'imperial',
  required: true,
  hasLeaf: true,
};

export const Disabled = Template.bind({});
Disabled.args = {
  label: 'sqft',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  defaultValue: 999,
  unitType: area_total_area,
  system: 'imperial',
  required: true,
  disabled: true,
};
Disabled.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.testSelectedUnit(UnitTest.getUnitLabelByValue('ft2'));
  await test.testVisibleValue(test.convertDBValueToDisplayValue(999, 'ft2'));
  await test.testDisabledStatus();
};

export const Optional = Template.bind({});
Optional.args = {
  label: 'sqft',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'imperial',
  optional: true,
  max: 999,
};
Optional.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.inputValueAndBlur('1000');
  await test.testVisibleValue(1000);
  await test.testMaxValueError();

  await test.clearInputAndBlur();
  await test.testNoError();
};

export const WithOneUnit = Template.bind({});
WithOneUnit.args = {
  label: 'WithOneUnit',
  name: bufferZoneEnum?.width,
  displayUnitName: bufferZoneEnum?.width_unit,
  unitType: line_width,
  system: 'imperial',
  required: true,
};
WithOneUnit.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');

  await test.testSelectedUnit('ft');

  await test.inputValueAndBlur('100');
  await test.testVisibleValue(100);
  await test.testHiddenValue(100, 'ft', line_width.databaseUnit);
};

export const WithOneUnitDisabled = Template.bind({});
WithOneUnitDisabled.args = {
  label: 'ft',
  name: bufferZoneEnum?.width,
  displayUnitName: bufferZoneEnum?.width_unit,
  unitType: line_width,
  defaultValue: 999,
  system: 'imperial',
  required: true,
  disabled: true,
};
WithOneUnitDisabled.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', line_width);

  await test.testVisibleValue(test.convertDBValueToDisplayValue(999, 'ft'));
  await test.testSelectedUnit('ft');
  await test.testDisabledStatus();
};

export const WithToolTip = Template.bind({});
WithToolTip.args = {
  label: 'WithToolTip',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'imperial',
  required: true,
  toolTipContent: 'toolTip',
};

export const SquareMeterAreaTotalArea = Template.bind({});
SquareMeterAreaTotalArea.args = {
  label: 'SquareMeter',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  defaultValue: 999,
  unitType: area_total_area,
  system: 'metric',
  required: true,
};
SquareMeterAreaTotalArea.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  const m2Label = UnitTest.getUnitLabelByValue('m2');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(999, 'm2'));
  await test.testSelectedUnit(m2Label);

  await test.inputValueAndBlur('1001');
  await test.testVisibleValue(1001);
  await test.testSelectedUnit(m2Label);
  await test.testHiddenValue(1001, 'm2', area_total_area.databaseUnit);

  await test.selectUnit('ha');
  await test.testVisibleValue(1001);
  await test.testSelectedUnit('ha');
  await test.testHiddenValue(1001, 'ha', area_total_area.databaseUnit);
};

export const HectareAreaTotalArea = Template.bind({});
HectareAreaTotalArea.args = {
  label: 'Hectare',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  defaultValue: 1001,
  unitType: area_total_area,
  system: 'metric',
  required: true,
};
HectareAreaTotalArea.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.testVisibleValue(test.convertDBValueToDisplayValue(1001, 'ha'));
  await test.testSelectedUnit('ha');

  await test.inputValueAndBlur('0.08');
  await test.testVisibleValue(0.08);
  await test.testSelectedUnit('ha');
  await test.testHiddenValue(0.08, 'ha', area_total_area.databaseUnit);

  const m2Label = UnitTest.getUnitLabelByValue('m2');
  await test.selectUnit(m2Label);
  await test.testSelectedUnit(m2Label);
  await test.testVisibleValue(0.08);
  await test.testHiddenValue(0.08, 'm2', area_total_area.databaseUnit);
};

export const AcreAreaTotalArea = Template.bind({});
AcreAreaTotalArea.args = {
  label: 'Acre',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  defaultValue:
    convert(1).from(area_total_area.imperial.defaultUnit).to(area_total_area.databaseUnit) * 10890,
  unitType: area_total_area,
  system: 'imperial',
  required: true,
};
AcreAreaTotalArea.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);
  const defaultValue =
    convert(1).from(area_total_area.imperial.defaultUnit).to(area_total_area.databaseUnit) * 10890;

  await test.testVisibleValue(test.convertDBValueToDisplayValue(defaultValue, 'ac'));
  await test.testSelectedUnit('ac');

  await test.inputValueAndBlur('0.05');
  await test.testVisibleValue(0.05);
  await test.testSelectedUnit('ac');
  await test.testHiddenValue(0.05, 'ac', area_total_area.databaseUnit);

  const ft2Label = UnitTest.getUnitLabelByValue('ft2');
  await test.selectUnit(ft2Label);
  await test.testVisibleValue(0.05);
  await test.testSelectedUnit(ft2Label);
  await test.testHiddenValue(0.05, 'ft2', area_total_area.databaseUnit);
};

export const MeterAreaPerimeter = Template.bind({});
MeterAreaPerimeter.args = {
  label: 'Meter',
  name: fieldEnum.perimeter,
  displayUnitName: fieldEnum?.perimeter_unit,
  defaultValue: 999,
  unitType: area_perimeter,
  system: 'metric',
  required: true,
};
MeterAreaPerimeter.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_perimeter);

  await test.testVisibleValue(999);
  await test.testSelectedUnit('m');

  await test.inputValueAndBlur('1001');
  await test.testVisibleValue(1001);
  await test.testSelectedUnit('m');
  await test.testHiddenValue(1001, 'm', area_perimeter.databaseUnit);

  await test.selectUnit('km');
  await test.testVisibleValue(1001);
  await test.testSelectedUnit('km');
  await test.testHiddenValue(1001, 'km', area_perimeter.databaseUnit);
};

export const MeterLineWidth = Template.bind({});
MeterLineWidth.args = {
  label: 'Meter',
  name: bufferZoneEnum.length,
  displayUnitName: bufferZoneEnum.length_unit,
  defaultValue: 50,
  unitType: line_width,
  system: 'metric',
  required: true,
};
MeterLineWidth.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', line_width);

  await test.testVisibleValue(50);
  await test.testHiddenValue(50);
  await test.testSelectedUnit('m');

  await test.inputValueAndBlur('100');
  await test.testVisibleValue(100);
  await test.testHiddenValue(100);
};

export const FeetAreaPerimeter = Template.bind({});
FeetAreaPerimeter.args = {
  label: 'Feet',
  name: fieldEnum?.perimeter,
  displayUnitName: fieldEnum?.perimeter_unit,
  defaultValue:
    convert(1).from(area_perimeter.imperial.defaultUnit).to(area_perimeter.databaseUnit) * 1319,
  unitType: area_perimeter,
  system: 'imperial',
  required: true,
};
FeetAreaPerimeter.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_perimeter);

  const defaultValue =
    convert(1).from(area_perimeter.imperial.defaultUnit).to(area_perimeter.databaseUnit) * 1319;
  await test.testVisibleValue(test.convertDBValueToDisplayValue(defaultValue, 'ft'));
  await test.testHiddenValue(defaultValue);
  await test.testSelectedUnit('ft');

  await test.inputValueAndBlur('1320');
  await test.testVisibleValue(1320);
  await test.testSelectedUnit('ft');
  await test.testHiddenValue(1320, 'ft', area_perimeter.databaseUnit);

  await test.selectUnit('mi');
  await test.testVisibleValue(1320);
  await test.testSelectedUnit('mi');
  await test.testHiddenValue(1320, 'mi', area_perimeter.databaseUnit);
};

export const MileAreaPerimeter = Template.bind({});
MileAreaPerimeter.args = {
  label: 'Mile',
  name: fieldEnum?.perimeter,
  displayUnitName: fieldEnum?.perimeter_unit,
  defaultValue:
    convert(1).from(area_perimeter.imperial.defaultUnit).to(area_perimeter.databaseUnit) * 1320,
  unitType: area_perimeter,
  system: 'imperial',
  required: true,
};
MileAreaPerimeter.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_perimeter);

  const defaultValue =
    convert(1).from(area_perimeter.imperial.defaultUnit).to(area_perimeter.databaseUnit) * 1320;
  await test.testVisibleValue(test.convertDBValueToDisplayValue(defaultValue, 'mi'));
  await test.testHiddenValue(defaultValue);
  await test.testSelectedUnit('mi');

  await test.inputValueAndBlur('0.1');
  await test.testVisibleValue(0.1);
  await test.testSelectedUnit('mi');
  await test.testHiddenValue(0.1, 'mi', area_perimeter.databaseUnit);

  await test.selectUnit('ft');
  await test.testVisibleValue(0.1);
  await test.testSelectedUnit('ft');
  await test.testHiddenValue(0.1, 'ft', area_perimeter.databaseUnit);
};

export const LitrePerHourWaterValveFlowRate = Template.bind({});
LitrePerHourWaterValveFlowRate.args = {
  label: 'LitrePerHour',
  name: waterValveEnum.flow_rate,
  displayUnitName: waterValveEnum.flow_rate_unit,
  defaultValue:
    convert(1)
      .from(water_valve_flow_rate.metric.defaultUnit)
      .to(water_valve_flow_rate.databaseUnit) * 59,
  unitType: water_valve_flow_rate,
  system: 'metric',
  required: true,
};
LitrePerHourWaterValveFlowRate.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', water_valve_flow_rate);

  const defaultValue =
    convert(1)
      .from(water_valve_flow_rate.metric.defaultUnit)
      .to(water_valve_flow_rate.databaseUnit) * 59;

  await test.testSelectedUnit('l/h');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(defaultValue, 'l/h'));
  await test.testHiddenValue(defaultValue);
};

export const gallonPerHourWaterValveFlowRate = Template.bind({});
gallonPerHourWaterValveFlowRate.args = {
  label: 'gallonPerHour',
  name: waterValveEnum.flow_rate,
  displayUnitName: waterValveEnum.flow_rate_unit,
  defaultValue:
    convert(1)
      .from(water_valve_flow_rate.imperial.defaultUnit)
      .to(water_valve_flow_rate.databaseUnit) * 0.99,
  unitType: water_valve_flow_rate,
  system: 'imperial',
  required: true,
};
gallonPerHourWaterValveFlowRate.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', water_valve_flow_rate);

  const defaultValue =
    convert(1)
      .from(water_valve_flow_rate.imperial.defaultUnit)
      .to(water_valve_flow_rate.databaseUnit) * 0.99;

  await test.testSelectedUnit('g/h');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(defaultValue, 'gal/h'));
  await test.testHiddenValue(defaultValue);
};

export const gallonPerMinWaterValveFlowRate = Template.bind({});
gallonPerMinWaterValveFlowRate.args = {
  label: 'gallonPerMin',
  name: waterValveEnum.flow_rate,
  displayUnitName: waterValveEnum.flow_rate_unit,
  defaultValue:
    convert(1)
      .from(water_valve_flow_rate.imperial.defaultUnit)
      .to(water_valve_flow_rate.databaseUnit) * 1,
  unitType: water_valve_flow_rate,
  system: 'imperial',
  required: true,
};
gallonPerMinWaterValveFlowRate.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', water_valve_flow_rate);

  const defaultValue =
    convert(1)
      .from(water_valve_flow_rate.imperial.defaultUnit)
      .to(water_valve_flow_rate.databaseUnit) * 1;

  await test.testSelectedUnit('g/m');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(defaultValue, 'gal/min'));
  await test.testHiddenValue(defaultValue);
};

export const CreateMetricWaterValveFlowRate = Template.bind({});
CreateMetricWaterValveFlowRate.args = {
  label: 'LitrePerMeter',
  name: waterValveEnum.flow_rate,
  displayUnitName: waterValveEnum.flow_rate_unit,
  unitType: water_valve_flow_rate,
  system: 'metric',
  required: true,
  max: 999999.99,
};
CreateMetricWaterValveFlowRate.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');

  await test.testNoInput();
  await test.testSelectedUnit('l/m');

  await test.inputValueAndBlur('61');
  await test.testVisibleValue(61);
  await test.testSelectedUnit('l/m');
  await test.testHiddenValue(61);

  await test.inputValueAndBlur('150');
  await test.testVisibleValue(150);
  await test.testSelectedUnit('l/m');
  await test.testHiddenValue(150, 'l/min', water_valve_flow_rate.databaseUnit);

  await test.selectUnit('l/h');
  await test.testSelectedUnit('l/h');
  await test.testVisibleValue(150);
  await test.testHiddenValue(150, 'l/h', water_valve_flow_rate.databaseUnit);

  await test.inputValueAndBlur('1000000');
  await test.testMaxValueError();

  await test.clearError();
  await test.testNoError();
};

export const CreateImperialWaterValveFlowRate = Template.bind({});
CreateImperialWaterValveFlowRate.args = {
  label: 'LitrePerMeter',
  name: waterValveEnum.flow_rate,
  displayUnitName: waterValveEnum.flow_rate_unit,
  unitType: water_valve_flow_rate,
  system: 'imperial',
  required: true,
  max: 999999.99,
};
CreateImperialWaterValveFlowRate.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');

  await test.testNoInput();
  await test.testSelectedUnit('g/m');

  await test.inputValueAndBlur('0.5');
  await test.testVisibleValue(0.5);
  await test.testSelectedUnit('g/m');
  await test.testHiddenValue(0.5, 'gal/min', water_valve_flow_rate.databaseUnit);

  await test.inputValueAndBlur('100000');
  await test.testVisibleValue(100000);
  await test.testHiddenValue(100000, 'gal/min', water_valve_flow_rate.databaseUnit);
  await test.testNoError();

  await test.selectUnit('g/h');
  await test.testSelectedUnit('g/h');
  await test.testVisibleValue(100000);
  await test.testHiddenValue(100000, 'gal/h', water_valve_flow_rate.databaseUnit);

  await test.inputValueAndBlur('1000000');
  await test.testMaxValueError();

  await test.clearError();
  await test.testNoError();
};

export const WeeksCropAge = Template.bind({});
WeeksCropAge.args = {
  label: 'Weeks',
  name: 'age',
  displayUnitName: 'age_unit',
  defaultValue: 4,
  unitType: crop_age,
  system: 'metric',
  required: true,
  to: 'week',
};
WeeksCropAge.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');

  await test.testSelectedUnit('weeks');

  await test.inputValueAndBlur('4');
  await test.testVisibleValue(4);
  await test.testHiddenValue(4, 'week', 'd');

  await test.inputValueAndBlur('40');
  await test.testVisibleValue(40);
  await test.testHiddenValue(40, 'week', 'd');
  await test.testSelectedUnit('weeks');

  await test.selectUnit('months');
  await test.testSelectedUnit('months');
  await test.testVisibleValue(40);
  await test.testHiddenValue(40, 'month', 'd');

  await test.inputValueAndBlur('10');
  await test.testVisibleValue(10);
  await test.testHiddenValue(10, 'month', 'd');
  await test.testSelectedUnit('months');

  await test.selectUnit('years');
  await test.testSelectedUnit('years');
  await test.testVisibleValue(10);
  await test.testHiddenValue(10, 'year', 'd');

  await test.inputValueAndBlur('1');
  await test.testVisibleValue(1);
  await test.testHiddenValue(1, 'year', 'd');
  await test.testSelectedUnit('years');

  await test.selectUnit('days');
  await test.testSelectedUnit('days');
  await test.testVisibleValue(1);
  await test.testHiddenValue(1);

  await test.inputValueAndBlur('14');
  await test.testVisibleValue(14);
  await test.testHiddenValue(14);
  await test.testSelectedUnit('days');
};

export const DaysCropAge = Template.bind({});
DaysCropAge.args = {
  label: 'Weeks',
  name: 'age',
  displayUnitName: 'age_unit',
  defaultValue: 4,
  unitType: crop_age,
  system: 'metric',
  required: true,
  to: 'd',
  max: 999,
};
DaysCropAge.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');

  await test.testSelectedUnit('days');

  await test.inputValueAndBlur('1000');
  await test.testMaxValueError();

  await test.selectUnit('weeks');
  await test.testMaxValueError();

  await test.selectUnit('months');
  await test.testMaxValueError();

  await test.selectUnit('years');
  await test.testMaxValueError();

  await test.clearError();
  await test.testNoError();
};

export const DisabledWithDefaultValues = Template.bind({});
DisabledWithDefaultValues.args = {
  label: 'SquareMeter',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'metric',
  required: true,
  defaultValues: {
    [fieldEnum?.total_area]: 1200,
    [fieldEnum?.total_area_unit]: getUnitOptionMap()['m2'],
  },
  disabled: true,
};
DisabledWithDefaultValues.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.testVisibleValue(test.convertDBValueToDisplayValue(1200, 'm2'));
  await test.testSelectedUnit(UnitTest.getUnitLabelByValue('m2'));
  await test.testDisabledStatus();
};

export const StringAsUnit = Template.bind({});
StringAsUnit.args = {
  label: 'SquareMeter',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'metric',
  required: true,
  defaultValues: {
    [fieldEnum?.total_area]: 1200,
    [fieldEnum?.total_area_unit]: 'm2',
  },
  disabled: true,
};
StringAsUnit.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.testVisibleValue(test.convertDBValueToDisplayValue(1200, 'm2'));
  await test.testSelectedUnit(UnitTest.getUnitLabelByValue('m2'));
  await test.testDisabledStatus();
};

export const MetricDefaultValueWithDecimals = Template.bind({});
MetricDefaultValueWithDecimals.args = {
  label: 'Estimated seed',
  name: 'estimated_seed',
  displayUnitName: 'estimated_seed_unit',
  unitType: seedYield,
  system: 'metric',
  optional: true,
  defaultValues: {
    estimated_seed: 0.0425,
    estimated_seed_unit: 'kg',
  },
};
MetricDefaultValueWithDecimals.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit');

  await test.testVisibleValue(0.04);
  await test.testHiddenValue(0.0425);
  await test.testSelectedUnit('kg');
};

export const ImperialDefaultValueWithDecimals = Template.bind({});
ImperialDefaultValueWithDecimals.args = {
  label: 'Estimated seed',
  name: 'estimated_seed',
  displayUnitName: 'estimated_seed_unit',
  unitType: seedYield,
  system: 'imperial',
  optional: true,
  defaultValues: {
    estimated_seed: 0.0425,
    estimated_seed_unit: 'lb',
  },
};
ImperialDefaultValueWithDecimals.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', seedYield);

  await test.testVisibleValue(test.convertDBValueToDisplayValue(0.0425, 'lb'));
  await test.testHiddenValue(0.0425);
  await test.testSelectedUnit('lb');
};

export const ImeprialAreaTotalAreaAutoConversion = Template.bind({});
ImeprialAreaTotalAreaAutoConversion.args = {
  label: 'SquareFeet',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'imperial',
  required: true,
  defaultValues: {
    [fieldEnum?.total_area]: 10890,
    [fieldEnum?.total_area_unit]: 'ft2',
  },
  autoConversion: true,
};
ImeprialAreaTotalAreaAutoConversion.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.testVisibleValue(test.convertDBValueToDisplayValue(10890, 'ft2'));
  await test.testSelectedUnit(UnitTest.getUnitLabelByValue('ft2'));

  await test.selectUnit('ac');
  await test.testSelectedUnit('ac');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(10890, 'ac'));
  await test.testHiddenValue(10890);
};

export const MetricAreaTotalAreaAutoConversion = Template.bind({});
MetricAreaTotalAreaAutoConversion.args = {
  label: 'SquareMeter',
  name: fieldEnum?.total_area,
  displayUnitName: fieldEnum?.total_area_unit,
  unitType: area_total_area,
  system: 'metric',
  required: true,
  defaultValues: {
    [fieldEnum?.total_area]: 10890,
    [fieldEnum?.total_area_unit]: 'm2',
  },
  autoConversion: true,
};
MetricAreaTotalAreaAutoConversion.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.testVisibleValue(test.convertDBValueToDisplayValue(10890, 'm2'));
  await test.testSelectedUnit(UnitTest.getUnitLabelByValue('m2'));

  await test.selectUnit('ha');
  await test.testSelectedUnit('ha');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(10890, 'ha'));
  await test.testHiddenValue(10890);
};

export const MetricFlowRateAutoConversion = Template.bind({});
MetricFlowRateAutoConversion.args = {
  label: 'LitrePerHour',
  name: waterValveEnum.flow_rate,
  displayUnitName: waterValveEnum.flow_rate_unit,
  unitType: water_valve_flow_rate,
  system: 'metric',
  autoConversion: true,
};
MetricFlowRateAutoConversion.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', water_valve_flow_rate);

  await test.testNoInput();
  await test.testSelectedUnit('l/m');

  await test.selectUnit('l/h');
  await test.testSelectedUnit('l/h');

  let hiddenValue = test.convertDisplayValueToHiddenValue(60, 'l/h');
  await test.inputValueAndBlur('60');
  await test.testVisibleValue(60);
  await test.testHiddenValue(hiddenValue);

  await test.selectUnit('l/m');
  await test.testSelectedUnit('l/m');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(hiddenValue, 'l/min'));
  await test.testHiddenValue(hiddenValue);

  await test.selectUnit('l/h');
  await test.testSelectedUnit('l/h');
  await test.inputValueAndBlur('60');
  await test.testVisibleValue(60);

  hiddenValue = test.convertDisplayValueToHiddenValue(0.5, 'l/h');
  await test.inputValueAndBlur('0.5');
  await test.testVisibleValue(0.5);
  await test.testHiddenValue(hiddenValue);

  await test.selectUnit('l/m');
  await test.testSelectedUnit('l/m');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(hiddenValue, 'l/min'));
  await test.testHiddenValue(hiddenValue);
};

export const ImperialFlowRateAutoConversion = Template.bind({});
ImperialFlowRateAutoConversion.args = {
  label: 'LitrePerHour',
  name: waterValveEnum.flow_rate,
  displayUnitName: waterValveEnum.flow_rate_unit,
  unitType: water_valve_flow_rate,
  system: 'imperial',
  autoConversion: true,
};
ImperialFlowRateAutoConversion.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', water_valve_flow_rate);

  await test.testNoInput();
  await test.testSelectedUnit('g/m');

  await test.selectUnit('g/h');
  await test.testSelectedUnit('g/h');

  let hiddenValue = test.convertDisplayValueToHiddenValue(60, 'gal/h');
  await test.inputValueAndBlur('60');
  await test.testVisibleValue(60);
  await test.testHiddenValue(hiddenValue);

  await test.selectUnit('g/m');
  await test.testSelectedUnit('g/m');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(hiddenValue, 'gal/min'));
  await test.testHiddenValue(hiddenValue);

  hiddenValue = test.convertDisplayValueToHiddenValue(90, 'gal/min');
  await test.inputValueAndBlur('90');
  await test.testVisibleValue(90);
  await test.testHiddenValue(hiddenValue);

  await test.selectUnit('g/h');
  await test.testSelectedUnit('g/h');
  await test.testVisibleValue(test.convertDBValueToDisplayValue(hiddenValue, 'gal/h'));
  await test.testHiddenValue(hiddenValue);
};

// when user's preferred farm unit and the unit saved in the DB do not match,
// display unit should be determined based on the guidance
export const ImperialAreaTotalAreaSystemUnmatch = Template.bind({});
const imperialAreaTotalAreaSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  area_total_area,
  1020,
  'ac',
);
ImperialAreaTotalAreaSystemUnmatch.args = imperialAreaTotalAreaSystemUnmatchArgsAndPlay.args;
ImperialAreaTotalAreaSystemUnmatch.play = imperialAreaTotalAreaSystemUnmatchArgsAndPlay.play;

export const MetricAreaTotalAreaSystemUnmatch = Template.bind({});
const metricAreaTotalAreaSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  area_total_area,
  1000,
  'ha',
);
MetricAreaTotalAreaSystemUnmatch.args = metricAreaTotalAreaSystemUnmatchArgsAndPlay.args;
MetricAreaTotalAreaSystemUnmatch.play = metricAreaTotalAreaSystemUnmatchArgsAndPlay.play;

export const ImperialAreaPerimeterSystemUnmatch = Template.bind({});
const imperialAreaPerimeterSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  area_perimeter,
  460,
  'mi',
);
ImperialAreaPerimeterSystemUnmatch.args = imperialAreaPerimeterSystemUnmatchArgsAndPlay.args;
ImperialAreaPerimeterSystemUnmatch.play = imperialAreaPerimeterSystemUnmatchArgsAndPlay.play;

export const MetricAreaPerimeterSystemUnmatch = Template.bind({});
const metricAreaPerimeterSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  area_perimeter,
  1500,
  'km',
);
MetricAreaPerimeterSystemUnmatch.args = metricAreaPerimeterSystemUnmatchArgsAndPlay.args;
MetricAreaPerimeterSystemUnmatch.play = metricAreaPerimeterSystemUnmatchArgsAndPlay.play;

export const ImperialWaterValvFlowRateSystemUnmatch = Template.bind({});
const imperialWaterValvFlowRateSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  water_valve_flow_rate,
  0.5,
  'gal/h',
);
ImperialWaterValvFlowRateSystemUnmatch.args =
  imperialWaterValvFlowRateSystemUnmatchArgsAndPlay.args;
ImperialWaterValvFlowRateSystemUnmatch.play =
  imperialWaterValvFlowRateSystemUnmatchArgsAndPlay.play;

export const MetricWaterValvFlowRateSystemUnmatch = Template.bind({});
const metricWaterValvFlowRateSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  water_valve_flow_rate,
  50,
  'l/h',
);
MetricWaterValvFlowRateSystemUnmatch.args = metricWaterValvFlowRateSystemUnmatchArgsAndPlay.args;
MetricWaterValvFlowRateSystemUnmatch.play = metricWaterValvFlowRateSystemUnmatchArgsAndPlay.play;

export const ImperialLengthOfBedOrRowSystemUnmatch = Template.bind({});
const imperialLengthOfBedOrRowSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  length_of_bed_or_row,
  15,
  'ft',
);
ImperialLengthOfBedOrRowSystemUnmatch.args = imperialLengthOfBedOrRowSystemUnmatchArgsAndPlay.args;
ImperialLengthOfBedOrRowSystemUnmatch.play = imperialLengthOfBedOrRowSystemUnmatchArgsAndPlay.play;

export const MetricLengthOfBedOrRowSystemUnmatch = Template.bind({});
const metricLengthOfBedOrRowSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  length_of_bed_or_row,
  150,
  'm',
);
MetricLengthOfBedOrRowSystemUnmatch.args = metricLengthOfBedOrRowSystemUnmatchArgsAndPlay.args;
MetricLengthOfBedOrRowSystemUnmatch.play = metricLengthOfBedOrRowSystemUnmatchArgsAndPlay.play;

export const ImperialSoilAmountsSystemUnmatch = Template.bind({});
const imperialSoilAmountsSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  soilAmounts,
  15000,
  'lb',
);
ImperialSoilAmountsSystemUnmatch.args = imperialSoilAmountsSystemUnmatchArgsAndPlay.args;
ImperialSoilAmountsSystemUnmatch.play = imperialSoilAmountsSystemUnmatchArgsAndPlay.play;

export const MetricSoilAmountsSystemUnmatch = Template.bind({});
const metricSoilAmountsSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  soilAmounts,
  1000,
  'mt',
);
MetricSoilAmountsSystemUnmatch.args = metricSoilAmountsSystemUnmatchArgsAndPlay.args;
MetricSoilAmountsSystemUnmatch.play = metricSoilAmountsSystemUnmatchArgsAndPlay.play;

export const ImperialWaterUsageSystemUnmatch = Template.bind({});
const imperialWaterUsageSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  waterUsage,
  500,
  'fl-oz',
);
ImperialWaterUsageSystemUnmatch.args = imperialWaterUsageSystemUnmatchArgsAndPlay.args;
ImperialWaterUsageSystemUnmatch.play = imperialWaterUsageSystemUnmatchArgsAndPlay.play;

export const MetricWaterUsageSystemUnmatch = Template.bind({});
const metricWaterUsageSystemUnmatchArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  waterUsage,
  1200,
  'l',
);
MetricWaterUsageSystemUnmatch.args = metricWaterUsageSystemUnmatchArgsAndPlay.args;
MetricWaterUsageSystemUnmatch.play = metricWaterUsageSystemUnmatchArgsAndPlay.play;
