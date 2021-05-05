import React from 'react';
import Unit from '../../../components/Form/Unit';
import { componentDecorators } from '../../Pages/config/decorators';
import { bufferZoneEnum, fieldEnum, waterValveEnum } from '../../../containers/constants';
import {
  area_perimeter,
  area_total_area,
  line_width,
  water_valve_flow_rate,
} from '../../../util/unit';
import { useForm } from 'react-hook-form';
import convert from 'convert-units';

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
  });
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <Unit
        register={register}
        errors={errors[props.name]}
        hookFormSetValue={setValue}
        hookFormGetValue={getValues}
        hookFormSetError={setError}
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

export const WithOneUnit = Template.bind({});
WithOneUnit.args = {
  label: 'WithOneUnit',
  name: bufferZoneEnum?.width,
  displayUnitName: bufferZoneEnum?.width_unit,
  unitType: line_width,
  system: 'imperial',
  required: true,
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

export const InchLineWidth = Template.bind({});
InchLineWidth.args = {
  label: 'Inch',
  name: bufferZoneEnum.length,
  displayUnitName: bufferZoneEnum.length_unit,
  defaultValue: convert(1).from(line_width.imperial.defaultUnit).to(line_width.databaseUnit) * 19,
  unitType: line_width,
  system: 'imperial',
  required: true,
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
