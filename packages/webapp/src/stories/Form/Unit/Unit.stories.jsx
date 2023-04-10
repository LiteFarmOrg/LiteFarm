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
  seedYield,
  pricePerSeedYield,
  convertFn,
} from '../../../util/convert-units/unit';
import { useForm } from 'react-hook-form';
import { convert } from '../../../util/convert-units/convert';
import UnitTest from '../../../test-utils/storybook/unit';

const UnitWithHookForm = (props) => {
  const {
    register,
    setValue,
    getValues,
    watch,
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
  title: 'Components/Form/Unit',
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

  await test.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('ft2'));
  await test.inputNotToHaveValue();

  await test.selectUnit('ac');
  await test.selectedUnitToBeInTheDocument('ac');
  await test.haveNoError();

  await test.inputValueAndBlur('2');
  await test.visibleInputToHaveValue(2);
  await test.hiddenInputToHaveValue(2, 'ac', area_total_area.databaseUnit);

  await test.clearInputAndBlur();
  await test.haveRequiredError();

  await test.clearError();
  await test.haveNoError();

  await test.inputValueAndBlur('1000000001');
  await test.haveMaxValueError();

  await test.inputValueAndBlur('1000000000');
  await test.haveNoError();

  await test.inputValueAndBlur('1000000000000');
  await test.haveMaxValueError();

  await test.clearError();
  await test.haveNoError();
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

  await test.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('ft2'));
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(999, 'ft2'));
  await test.visibleInputAndComboxIsDisabled();
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
  await test.visibleInputToHaveValue(1000);
  await test.haveMaxValueError();

  await test.clearInputAndBlur();
  await test.haveNoError();
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

  await test.selectedUnitToBeInTheDocument('ft');

  await test.inputValueAndBlur('100');
  await test.visibleInputToHaveValue(100);
  await test.hiddenInputToHaveValue(100, 'ft', line_width.databaseUnit);
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

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(999, 'ft'));
  await test.selectedUnitToBeInTheDocument('ft');
  await test.visibleInputAndComboxIsDisabled();
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
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(999, 'm2'));
  await test.selectedUnitToBeInTheDocument(m2Label);

  await test.inputValueAndBlur('1001');
  await test.visibleInputToHaveValue(1001);
  await test.selectedUnitToBeInTheDocument(m2Label);
  await test.hiddenInputToHaveValue(1001, 'm2', area_total_area.databaseUnit);

  await test.selectUnit('ha');
  await test.visibleInputToHaveValue(1001);
  await test.selectedUnitToBeInTheDocument('ha');
  await test.hiddenInputToHaveValue(1001, 'ha', area_total_area.databaseUnit);
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

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(1001, 'ha'));
  await test.selectedUnitToBeInTheDocument('ha');

  await test.inputValueAndBlur('0.08');
  await test.visibleInputToHaveValue(0.08);
  await test.selectedUnitToBeInTheDocument('ha');
  await test.hiddenInputToHaveValue(0.08, 'ha', area_total_area.databaseUnit);

  const m2Label = UnitTest.getUnitLabelByValue('m2');
  await test.selectUnit(m2Label);
  await test.selectedUnitToBeInTheDocument(m2Label);
  await test.visibleInputToHaveValue(0.08);
  await test.hiddenInputToHaveValue(0.08, 'm2', area_total_area.databaseUnit);
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

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(defaultValue, 'ac'));
  await test.selectedUnitToBeInTheDocument('ac');

  await test.inputValueAndBlur('0.05');
  await test.visibleInputToHaveValue(0.05);
  await test.selectedUnitToBeInTheDocument('ac');
  await test.hiddenInputToHaveValue(0.05, 'ac', area_total_area.databaseUnit);

  const ft2Label = UnitTest.getUnitLabelByValue('ft2');
  await test.selectUnit(ft2Label);
  await test.visibleInputToHaveValue(0.05);
  await test.selectedUnitToBeInTheDocument(ft2Label);
  await test.hiddenInputToHaveValue(0.05, 'ft2', area_total_area.databaseUnit);
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

  await test.visibleInputToHaveValue(999);
  await test.selectedUnitToBeInTheDocument('m');

  await test.inputValueAndBlur('1001');
  await test.visibleInputToHaveValue(1001);
  await test.selectedUnitToBeInTheDocument('m');
  await test.hiddenInputToHaveValue(1001, 'm', area_perimeter.databaseUnit);

  await test.selectUnit('km');
  await test.visibleInputToHaveValue(1001);
  await test.selectedUnitToBeInTheDocument('km');
  await test.hiddenInputToHaveValue(1001, 'km', area_perimeter.databaseUnit);
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

  await test.visibleInputToHaveValue(50);
  await test.hiddenInputToHaveValue(50);
  await test.selectedUnitToBeInTheDocument('m');

  await test.inputValueAndBlur('100');
  await test.visibleInputToHaveValue(100);
  await test.hiddenInputToHaveValue(100);
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
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(defaultValue, 'ft'));
  await test.hiddenInputToHaveValue(defaultValue);
  await test.selectedUnitToBeInTheDocument('ft');

  await test.inputValueAndBlur('1320');
  await test.visibleInputToHaveValue(1320);
  await test.selectedUnitToBeInTheDocument('ft');
  await test.hiddenInputToHaveValue(1320, 'ft', area_perimeter.databaseUnit);

  await test.selectUnit('mi');
  await test.visibleInputToHaveValue(1320);
  await test.selectedUnitToBeInTheDocument('mi');
  await test.hiddenInputToHaveValue(1320, 'mi', area_perimeter.databaseUnit);
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
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(defaultValue, 'mi'));
  await test.hiddenInputToHaveValue(defaultValue);
  await test.selectedUnitToBeInTheDocument('mi');

  await test.inputValueAndBlur('0.1');
  await test.visibleInputToHaveValue(0.1);
  await test.selectedUnitToBeInTheDocument('mi');
  await test.hiddenInputToHaveValue(0.1, 'mi', area_perimeter.databaseUnit);

  await test.selectUnit('ft');
  await test.visibleInputToHaveValue(0.1);
  await test.selectedUnitToBeInTheDocument('ft');
  await test.hiddenInputToHaveValue(0.1, 'ft', area_perimeter.databaseUnit);
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

  await test.selectedUnitToBeInTheDocument('l/h');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(defaultValue, 'l/h'));
  await test.hiddenInputToHaveValue(defaultValue);
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

  await test.selectedUnitToBeInTheDocument('g/h');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(defaultValue, 'gal/h'));
  await test.hiddenInputToHaveValue(defaultValue);
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

  await test.selectedUnitToBeInTheDocument('g/m');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(defaultValue, 'gal/min'));
  await test.hiddenInputToHaveValue(defaultValue);
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

  await test.inputNotToHaveValue();
  await test.selectedUnitToBeInTheDocument('l/m');

  await test.inputValueAndBlur('61');
  await test.visibleInputToHaveValue(61);
  await test.selectedUnitToBeInTheDocument('l/m');
  await test.hiddenInputToHaveValue(61);

  await test.inputValueAndBlur('150');
  await test.visibleInputToHaveValue(150);
  await test.selectedUnitToBeInTheDocument('l/m');
  await test.hiddenInputToHaveValue(150, 'l/min', water_valve_flow_rate.databaseUnit);

  await test.selectUnit('l/h');
  await test.selectedUnitToBeInTheDocument('l/h');
  await test.visibleInputToHaveValue(150);
  await test.hiddenInputToHaveValue(150, 'l/h', water_valve_flow_rate.databaseUnit);

  await test.inputValueAndBlur('1000000');
  await test.haveMaxValueError();

  await test.clearError();
  await test.haveNoError();
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

  await test.inputNotToHaveValue();
  await test.selectedUnitToBeInTheDocument('g/m');

  await test.inputValueAndBlur('0.5');
  await test.visibleInputToHaveValue(0.5);
  await test.selectedUnitToBeInTheDocument('g/m');
  await test.hiddenInputToHaveValue(0.5, 'gal/min', water_valve_flow_rate.databaseUnit);

  await test.inputValueAndBlur('100000');
  await test.visibleInputToHaveValue(100000);
  await test.hiddenInputToHaveValue(100000, 'gal/min', water_valve_flow_rate.databaseUnit);
  await test.haveNoError();

  await test.selectUnit('g/h');
  await test.selectedUnitToBeInTheDocument('g/h');
  await test.visibleInputToHaveValue(100000);
  await test.hiddenInputToHaveValue(100000, 'gal/h', water_valve_flow_rate.databaseUnit);

  await test.inputValueAndBlur('1000000');
  await test.haveMaxValueError();

  await test.clearError();
  await test.haveNoError();
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

  await test.selectedUnitToBeInTheDocument('weeks');

  await test.inputValueAndBlur('4');
  await test.visibleInputToHaveValue(4);
  await test.hiddenInputToHaveValue(4, 'week', 'd');

  await test.inputValueAndBlur('40');
  await test.visibleInputToHaveValue(40);
  await test.hiddenInputToHaveValue(40, 'week', 'd');
  await test.selectedUnitToBeInTheDocument('weeks');

  await test.selectUnit('months');
  await test.selectedUnitToBeInTheDocument('months');
  await test.visibleInputToHaveValue(40);
  await test.hiddenInputToHaveValue(40, 'month', 'd');

  await test.inputValueAndBlur('10');
  await test.visibleInputToHaveValue(10);
  await test.hiddenInputToHaveValue(10, 'month', 'd');
  await test.selectedUnitToBeInTheDocument('months');

  await test.selectUnit('years');
  await test.selectedUnitToBeInTheDocument('years');
  await test.visibleInputToHaveValue(10);
  await test.hiddenInputToHaveValue(10, 'year', 'd');

  await test.inputValueAndBlur('1');
  await test.visibleInputToHaveValue(1);
  await test.hiddenInputToHaveValue(1, 'year', 'd');
  await test.selectedUnitToBeInTheDocument('years');

  await test.selectUnit('days');
  await test.selectedUnitToBeInTheDocument('days');
  await test.visibleInputToHaveValue(1);
  await test.hiddenInputToHaveValue(1);

  await test.inputValueAndBlur('14');
  await test.visibleInputToHaveValue(14);
  await test.hiddenInputToHaveValue(14);
  await test.selectedUnitToBeInTheDocument('days');
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

  await test.selectedUnitToBeInTheDocument('days');

  await test.inputValueAndBlur('1000');
  await test.haveMaxValueError();

  await test.selectUnit('weeks');
  await test.haveMaxValueError();

  await test.selectUnit('months');
  await test.haveMaxValueError();

  await test.selectUnit('years');
  await test.haveMaxValueError();

  await test.clearError();
  await test.haveNoError();
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

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(1200, 'm2'));
  await test.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('m2'));
  await test.visibleInputAndComboxIsDisabled();
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

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(1200, 'm2'));
  await test.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('m2'));
  await test.visibleInputAndComboxIsDisabled();
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

  await test.visibleInputToHaveValue(0.04);
  await test.hiddenInputToHaveValue(0.0425);
  await test.selectedUnitToBeInTheDocument('kg');
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

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(0.0425, 'lb'));
  await test.hiddenInputToHaveValue(0.0425);
  await test.selectedUnitToBeInTheDocument('lb');
};

export const ImperialAreaTotalAreaAutoConversion = Template.bind({});
ImperialAreaTotalAreaAutoConversion.args = {
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
ImperialAreaTotalAreaAutoConversion.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', area_total_area);

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(10890, 'ft2'));
  await test.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('ft2'));

  await test.selectUnit('ac');
  await test.selectedUnitToBeInTheDocument('ac');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(10890, 'ac'));
  await test.hiddenInputToHaveValue(10890);
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

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(10890, 'm2'));
  await test.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('m2'));

  await test.selectUnit('ha');
  await test.selectedUnitToBeInTheDocument('ha');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(10890, 'ha'));
  await test.hiddenInputToHaveValue(10890);
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

  await test.inputNotToHaveValue();
  await test.selectedUnitToBeInTheDocument('l/m');

  await test.selectUnit('l/h');
  await test.selectedUnitToBeInTheDocument('l/h');

  let hiddenValue = test.convertDisplayValueToHiddenValue(60, 'l/h');
  await test.inputValueAndBlur('60');
  await test.visibleInputToHaveValue(60);
  await test.hiddenInputToHaveValue(hiddenValue);

  await test.selectUnit('l/m');
  await test.selectedUnitToBeInTheDocument('l/m');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(hiddenValue, 'l/min'));
  await test.hiddenInputToHaveValue(hiddenValue);

  await test.selectUnit('l/h');
  await test.selectedUnitToBeInTheDocument('l/h');
  await test.inputValueAndBlur('60');
  await test.visibleInputToHaveValue(60);

  hiddenValue = test.convertDisplayValueToHiddenValue(0.5, 'l/h');
  await test.inputValueAndBlur('0.5');
  await test.visibleInputToHaveValue(0.5);
  await test.hiddenInputToHaveValue(hiddenValue);

  await test.selectUnit('l/m');
  await test.selectedUnitToBeInTheDocument('l/m');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(hiddenValue, 'l/min'));
  await test.hiddenInputToHaveValue(hiddenValue);
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

  await test.inputNotToHaveValue();
  await test.selectedUnitToBeInTheDocument('g/m');

  await test.selectUnit('g/h');
  await test.selectedUnitToBeInTheDocument('g/h');

  let hiddenValue = test.convertDisplayValueToHiddenValue(60, 'gal/h');
  await test.inputValueAndBlur('60');
  await test.visibleInputToHaveValue(60);
  await test.hiddenInputToHaveValue(hiddenValue);

  await test.selectUnit('g/m');
  await test.selectedUnitToBeInTheDocument('g/m');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(hiddenValue, 'gal/min'));
  await test.hiddenInputToHaveValue(hiddenValue);

  hiddenValue = test.convertDisplayValueToHiddenValue(90, 'gal/min');
  await test.inputValueAndBlur('90');
  await test.visibleInputToHaveValue(90);
  await test.hiddenInputToHaveValue(hiddenValue);

  await test.selectUnit('g/h');
  await test.selectedUnitToBeInTheDocument('g/h');
  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(hiddenValue, 'gal/h'));
  await test.hiddenInputToHaveValue(hiddenValue);
};

export const InvertedUnit = Template.bind({});
InvertedUnit.args = {
  label: 'PricePerKilogram',
  name: 'price_per_mass',
  displayUnitName: 'price_per_mass_unit',
  unitType: pricePerSeedYield,
  system: 'metric',
  defaultValues: {
    price_per_mass: 20.3,
    price_per_mass_unit: 'kg',
  },
};
InvertedUnit.play = async ({ canvasElement }) => {
  const test = new UnitTest(canvasElement, 'unit', pricePerSeedYield);

  await test.visibleInputToHaveValue(test.convertDBValueToDisplayValue(20.3, 'kg'));
  await test.hiddenInputToHaveValue(20.3);
  await test.selectedUnitToBeInTheDocument('kg');

  await test.selectUnit('mt');
  await test.visibleInputToHaveValue(20.3);
  await test.selectedUnitToBeInTheDocument('mt');
  await test.hiddenInputToHaveValue(20.3, 'mt', pricePerSeedYield.databaseUnit);
};

export const Currency = Template.bind({});
Currency.args = {
  label: 'PricePerKilogram',
  name: 'price_per_mass',
  displayUnitName: pricePerSeedYield.databaseUnit,
  unitType: pricePerSeedYield,
  system: 'metric',
  currency: '$',
};
