import React from 'react';
import Unit from '../../../components/Form/Unit';
import { componentDecorators } from '../../Pages/config/Decorators';
import {
  area_perimeter,
  area_total_area,
  water_valve_flow_rate,
  length_of_bed_or_row,
  soilAmounts,
  waterUsage,
} from '../../../util/convert-units/unit';
import { useForm } from 'react-hook-form';
import { getSystemUnmatchTestArgsAndPlay } from '../../../test-utils/storybook/unit';

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
  title: 'Form/Unit/SystemUnmatch',
  component: UnitWithHookForm,
  decorators: componentDecorators,
};

const Template = (args) => <UnitWithHookForm {...args} />;

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
