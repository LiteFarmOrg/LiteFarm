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
  title: 'Components/Form/Unit/SystemUnmatch',
  component: UnitWithHookForm,
  decorators: componentDecorators,
};

const Template = (args) => <UnitWithHookForm {...args} />;

// when user's preferred farm unit and the unit saved in the DB do not match,
// display unit should be determined based on the guidance
export const ImperialAreaTotalArea = Template.bind({});
const imperialAreaTotalAreaArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  area_total_area,
  1020,
  'ac',
);
ImperialAreaTotalArea.args = imperialAreaTotalAreaArgsAndPlay.args;
ImperialAreaTotalArea.play = imperialAreaTotalAreaArgsAndPlay.play;

export const MetricAreaTotalArea = Template.bind({});
const metricAreaTotalAreaArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  area_total_area,
  1000,
  'ha',
);
MetricAreaTotalArea.args = metricAreaTotalAreaArgsAndPlay.args;
MetricAreaTotalArea.play = metricAreaTotalAreaArgsAndPlay.play;

export const ImperialAreaPerimeter = Template.bind({});
const imperialAreaPerimeterArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  area_perimeter,
  460,
  'mi',
);
ImperialAreaPerimeter.args = imperialAreaPerimeterArgsAndPlay.args;
ImperialAreaPerimeter.play = imperialAreaPerimeterArgsAndPlay.play;

export const MetricAreaPerimeter = Template.bind({});
const metricAreaPerimeterArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  area_perimeter,
  1500,
  'km',
);
MetricAreaPerimeter.args = metricAreaPerimeterArgsAndPlay.args;
MetricAreaPerimeter.play = metricAreaPerimeterArgsAndPlay.play;

export const ImperialWaterValvFlowRate = Template.bind({});
const imperialWaterValvFlowRateArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  water_valve_flow_rate,
  0.5,
  'gal/h',
);
ImperialWaterValvFlowRate.args = imperialWaterValvFlowRateArgsAndPlay.args;
ImperialWaterValvFlowRate.play = imperialWaterValvFlowRateArgsAndPlay.play;

export const MetricWaterValvFlowRate = Template.bind({});
const metricWaterValvFlowRateArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  water_valve_flow_rate,
  50,
  'l/h',
);
MetricWaterValvFlowRate.args = metricWaterValvFlowRateArgsAndPlay.args;
MetricWaterValvFlowRate.play = metricWaterValvFlowRateArgsAndPlay.play;

export const ImperialLengthOfBedOrRow = Template.bind({});
const imperialLengthOfBedOrRowArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  length_of_bed_or_row,
  15,
  'ft',
);
ImperialLengthOfBedOrRow.args = imperialLengthOfBedOrRowArgsAndPlay.args;
ImperialLengthOfBedOrRow.play = imperialLengthOfBedOrRowArgsAndPlay.play;

export const MetricLengthOfBedOrRow = Template.bind({});
const metricLengthOfBedOrRowArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  length_of_bed_or_row,
  150,
  'm',
);
MetricLengthOfBedOrRow.args = metricLengthOfBedOrRowArgsAndPlay.args;
MetricLengthOfBedOrRow.play = metricLengthOfBedOrRowArgsAndPlay.play;

export const ImperialSoilAmounts = Template.bind({});
const imperialSoilAmountsArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  soilAmounts,
  15000,
  'lb',
);
ImperialSoilAmounts.args = imperialSoilAmountsArgsAndPlay.args;
ImperialSoilAmounts.play = imperialSoilAmountsArgsAndPlay.play;

export const MetricSoilAmount = Template.bind({});
const metricSoilAmountArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  soilAmounts,
  1000,
  'mt',
);
MetricSoilAmount.args = metricSoilAmountArgsAndPlay.args;
MetricSoilAmount.play = metricSoilAmountArgsAndPlay.play;

export const ImperialWaterUsage = Template.bind({});
const imperialWaterUsageArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'imperial',
  waterUsage,
  500,
  'fl-oz',
);
ImperialWaterUsage.args = imperialWaterUsageArgsAndPlay.args;
ImperialWaterUsage.play = imperialWaterUsageArgsAndPlay.play;

export const MetricWaterUsage = Template.bind({});
const metricWaterUsageArgsAndPlay = getSystemUnmatchTestArgsAndPlay(
  'metric',
  waterUsage,
  1200,
  'l',
);
MetricWaterUsage.args = metricWaterUsageArgsAndPlay.args;
MetricWaterUsage.play = metricWaterUsageArgsAndPlay.play;
