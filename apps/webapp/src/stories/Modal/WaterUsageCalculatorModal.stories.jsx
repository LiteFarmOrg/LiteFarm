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
import React, { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { screen, userEvent } from '@storybook/testing-library';
import { expect } from '@storybook/jest';
import { convert } from '../../util/convert-units/convert';
import WaterUsageCalculatorModal from '../../components/Modals/WaterUsageCalculatorModal';
import { componentDecorators } from '../Pages/config/Decorators';
import {
  irrigation_task_estimated_duration,
  location_area,
  water_valve_flow_rate,
  irrigation_depth,
} from '../../util/convert-units/unit';
import UnitTest from '../../test-utils/storybook/unit';
import { roundToTwoDecimal } from '../../util';

const convertM3ToWaterUsageUnit = (value, unit) =>
  convert(value)
    .from('m3')
    .to(unit || 'l');

const totalWaterUsageValueToBeInTheDocument = async (value, system = 'metric') => {
  const unit = system === 'metric' ? 'l' : 'gal';
  const name = value ? `${roundToTwoDecimal(value)} ${unit}` : unit;
  const totalWaterUsage = await screen.findByRole('heading', { name });
  expect(totalWaterUsage).toBeInTheDocument();
};

const CalculatorWithHookProps = (props) => {
  const [totalWaterUsage, setTotalWaterUsage] = useState(null);
  const {
    register,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors },
  } = useForm();
  const formState = () => ({ register, getValues, watch, control, setValue });

  return (
    <Suspense fallback="loading">
      <WaterUsageCalculatorModal
        formState={formState}
        errors={errors}
        totalVolumeWaterUsage={totalWaterUsage}
        setTotalVolumeWaterUsage={setTotalWaterUsage}
        totalDepthWaterUsage={totalWaterUsage}
        setTotalDepthWaterUsage={setTotalWaterUsage}
        {...props}
      />
    </Suspense>
  );
};

const Template = (args) => <CalculatorWithHookProps {...args} />;

export default {
  title: 'Components/Modals/WaterUsageCalculatorModal',
  decorators: componentDecorators,
  component: CalculatorWithHookProps,
};

const args = {
  dismissModal: () => ({}),
  handleModalSubmit: () => ({}),
  locationDefaults: {
    location_id: 'f94503c8-d3dc-11ed-af00-e66db4bef551',
    estimated_flow_rate: 2,
    estimated_flow_rate_unit: 'l/h',
    application_depth: 0.02,
    application_depth_unit: 'mm',
    irrigation_type_id: 5,
  },
  location: {
    total_area: 21758,
    total_area_unit: 'ha',
  },
};

export const VolumeMetric = Template.bind({});
VolumeMetric.args = { ...args, measurementType: 'VOLUME', system: 'metric' };
VolumeMetric.play = async ({ canvasElement }) => {
  // Wait for elements to be ready. Without this, these tests will fail when using jest-runner.
  const flowRateInput = await screen.findByTestId('volumecalculator-flowrate');
  expect(flowRateInput).toBeInTheDocument();

  const flowRateTest = new UnitTest(null, 'volumecalculator-flowrate', water_valve_flow_rate);
  const durationTest = new UnitTest(
    null,
    'volumecalculator-duration',
    irrigation_task_estimated_duration,
  );
  const totalWaterUsageText = screen.getByRole('heading', { name: 'Total Water Usage' });

  await flowRateTest.visibleInputToHaveValue(flowRateTest.convertDBValueToDisplayValue(2, 'l/h'));
  await flowRateTest.hiddenInputToHaveValue(2);
  await flowRateTest.selectedUnitToBeInTheDocument('l/h');
  await totalWaterUsageValueToBeInTheDocument('');

  await durationTest.inputValue('20');
  await userEvent.click(totalWaterUsageText);
  await totalWaterUsageValueToBeInTheDocument(40);

  await flowRateTest.selectUnit('l/m');
  const hiddenFlowRate = flowRateTest.convertDisplayValueToHiddenValue(120, 'l/min');
  await totalWaterUsageValueToBeInTheDocument(hiddenFlowRate * 20);

  await durationTest.selectUnit('h');
  await userEvent.click(totalWaterUsageText);
  await totalWaterUsageValueToBeInTheDocument(hiddenFlowRate * (20 * 60));
};

export const VolumeImperial = Template.bind({});
VolumeImperial.args = { ...args, measurementType: 'VOLUME', system: 'imperial' };
VolumeImperial.play = async ({ canvasElement }) => {
  const flowRateTest = new UnitTest(null, 'volumecalculator-flowrate', water_valve_flow_rate, true);
  const durationTest = new UnitTest(
    null,
    'volumecalculator-duration',
    irrigation_task_estimated_duration,
    true,
  );
  const totalWaterUsageText = screen.getByRole('heading', { name: 'Total Water Usage' });

  await flowRateTest.visibleInputToHaveValue(flowRateTest.convertDBValueToDisplayValue(2, 'gal/h'));
  await flowRateTest.hiddenInputToHaveValue(2);
  await flowRateTest.selectedUnitToBeInTheDocument('g/h');
  await totalWaterUsageValueToBeInTheDocument('', 'imperial');

  await flowRateTest.selectUnit('g/m');
  await flowRateTest.inputValue('0.5');
  await totalWaterUsageValueToBeInTheDocument('', 'imperial');

  await durationTest.inputValue('1');
  await userEvent.click(totalWaterUsageText);
  await totalWaterUsageValueToBeInTheDocument(0.5, 'imperial');

  await durationTest.selectUnit('h');
  await userEvent.click(totalWaterUsageText);
  await totalWaterUsageValueToBeInTheDocument(30, 'imperial');
};

export const DepthMetric = Template.bind({});
DepthMetric.args = { ...args, measurementType: 'DEPTH', system: 'metric' };
DepthMetric.play = async ({ canvasElement }) => {
  const depthTest = new UnitTest(null, 'depthcalculator-depth', irrigation_depth);
  const locationSizeTest = new UnitTest(null, 'depthcalculator-locationsize', location_area);
  const irrigatedAreaTest = new UnitTest(null, 'depthcalculator-irrigatedarea', location_area);
  const totalWaterUsageText = screen.getByRole('heading', { name: 'Total Water Usage' });
  const percentageLocation = screen.getAllByRole('spinbutton')[1];

  await depthTest.visibleInputToHaveValue(20);
  await depthTest.hiddenInputToHaveValue(0.02);
  await depthTest.selectedUnitToBeInTheDocument('mm');
  await locationSizeTest.visibleInputToHaveValue(2.18);
  await locationSizeTest.hiddenInputToHaveValue(21758);
  await locationSizeTest.selectedUnitToBeInTheDocument('ha');
  await irrigatedAreaTest.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('m2'));
  await totalWaterUsageValueToBeInTheDocument('');

  await userEvent.clear(percentageLocation);
  await userEvent.type(percentageLocation, '30');
  await userEvent.click(totalWaterUsageText);
  await irrigatedAreaTest.hiddenInputToHaveValue(21758 * 0.3);
  await irrigatedAreaTest.visibleInputToHaveValue(
    irrigatedAreaTest.convertDBValueToDisplayValue(21758 * 0.3, 'ha'),
  );
  await irrigatedAreaTest.selectedUnitToBeInTheDocument('ha');
  await totalWaterUsageValueToBeInTheDocument(convertM3ToWaterUsageUnit(0.02 * (21758 * 0.3)));

  await userEvent.clear(percentageLocation);
  await userEvent.type(percentageLocation, '4');
  await userEvent.click(totalWaterUsageText);
  await irrigatedAreaTest.hiddenInputToHaveValue(21758 * 0.04);
  await irrigatedAreaTest.visibleInputToHaveValue(
    irrigatedAreaTest.convertDBValueToDisplayValue(21758 * 0.04, 'm2'),
  );
  await irrigatedAreaTest.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('m2'));
  await totalWaterUsageValueToBeInTheDocument(convertM3ToWaterUsageUnit(0.02 * (21758 * 0.04)));

  await depthTest.inputValueAndBlur('10');
  await totalWaterUsageValueToBeInTheDocument(convertM3ToWaterUsageUnit(0.01 * (21758 * 0.04)));
};

export const DepthImperial = Template.bind({});
DepthImperial.args = { ...args, measurementType: 'DEPTH', system: 'imperial' };
DepthImperial.play = async ({ canvasElement }) => {
  const depthTest = new UnitTest(null, 'depthcalculator-depth', irrigation_depth);
  const locationSizeTest = new UnitTest(null, 'depthcalculator-locationsize', location_area);
  const irrigatedAreaTest = new UnitTest(null, 'depthcalculator-irrigatedarea', location_area);
  const totalWaterUsageText = screen.getByRole('heading', { name: 'Total Water Usage' });
  const percentageLocation = screen.getAllByRole('spinbutton')[1];

  await depthTest.visibleInputToHaveValue(depthTest.convertDBValueToDisplayValue(0.02, 'in'));
  await depthTest.selectedUnitToBeInTheDocument('in');
  await locationSizeTest.visibleInputToHaveValue(
    locationSizeTest.convertDBValueToDisplayValue(21758, 'ac'),
  );
  await locationSizeTest.hiddenInputToHaveValue(21758);
  await locationSizeTest.selectedUnitToBeInTheDocument('ac');
  await irrigatedAreaTest.selectedUnitToBeInTheDocument(UnitTest.getUnitLabelByValue('ft2'));
  await totalWaterUsageValueToBeInTheDocument('', 'imperial');

  await depthTest.inputValueAndBlur('1');
  await depthTest.hiddenInputToHaveValue(depthTest.convertDisplayValueToHiddenValue(1, 'in'));
  await totalWaterUsageValueToBeInTheDocument('', 'imperial');

  await userEvent.clear(percentageLocation);
  await userEvent.type(percentageLocation, '2');
  await userEvent.click(totalWaterUsageText);
  let irrigatedAreaInM2 = 21758 * 0.02;
  await irrigatedAreaTest.hiddenInputToHaveValue(irrigatedAreaInM2);
  await irrigatedAreaTest.visibleInputToHaveValue(
    irrigatedAreaTest.convertDBValueToDisplayValue(irrigatedAreaInM2, 'ft2'),
  );
  let waterUsageInM3 = convert(1).from('in').to('m') * irrigatedAreaInM2;
  await totalWaterUsageValueToBeInTheDocument(
    roundToTwoDecimal(convertM3ToWaterUsageUnit(waterUsageInM3, 'gal')),
    'imperial',
  );

  await userEvent.clear(percentageLocation);
  await userEvent.type(percentageLocation, '50');
  await userEvent.click(totalWaterUsageText);
  irrigatedAreaInM2 = 21758 * 0.5;
  await irrigatedAreaTest.hiddenInputToHaveValue(irrigatedAreaInM2);
  await irrigatedAreaTest.visibleInputToHaveValue(
    irrigatedAreaTest.convertDBValueToDisplayValue(irrigatedAreaInM2, 'ac'),
  );
  await irrigatedAreaTest.selectedUnitToBeInTheDocument('ac');
  waterUsageInM3 = convert(1).from('in').to('m') * irrigatedAreaInM2;
  await totalWaterUsageValueToBeInTheDocument(
    roundToTwoDecimal(convertM3ToWaterUsageUnit(waterUsageInM3, 'gal')),
    'imperial',
  );
};
