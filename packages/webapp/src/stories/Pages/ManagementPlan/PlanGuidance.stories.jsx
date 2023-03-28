import React from 'react';
import PurePlanGuidance from '../../../components/Crop/BedPlan/PurePlanGuidance';
import decorators from '../config/Decorators';
import UnitTest from '../../../test-utils/storybook/unit';
import { container_planting_depth } from '../../../util/convert-units/unit';

export default {
  title: 'Form/ManagementPlan/PlanGuidance',
  component: PurePlanGuidance,
  decorators: decorators,
};

const Template = (args) => <PurePlanGuidance {...args} />;

export const HistoricalBeds = Template.bind({});
HistoricalBeds.args = {
  system: 'metric',
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        initial: { bed_method: { bed_spacing: 10 } },
      },
    },
  },
  isFinalPage: false,
  isBed: true,
};
HistoricalBeds.play = async ({ canvasElement }) => {
  const plantingDepthTest = new UnitTest(
    canvasElement,
    'planGuidance-plantingDepth',
    container_planting_depth,
  );
  const rowWidthTest = new UnitTest(
    canvasElement,
    'planGuidance-rowWidth',
    container_planting_depth,
  );
  const spaceBetweenRowsTest = new UnitTest(
    canvasElement,
    'planGuidance-spaceBetween',
    container_planting_depth,
  );

  await plantingDepthTest.testNoInput();
  await plantingDepthTest.testSelectedUnit('cm');
  await rowWidthTest.testNoInput();
  await rowWidthTest.testSelectedUnit('cm');
  await spaceBetweenRowsTest.testVisibleValue(10);
  await spaceBetweenRowsTest.testSelectedUnit('m');
};

export const FinalRows = Template.bind({});
FinalRows.args = {
  system: 'imperial',
  useHookFormPersist: () => ({}),
  persistedFormData: {
    crop_management_plan: {
      planting_management_plans: {
        final: { row_method: { row_spacing: 10 } },
      },
    },
  },
  isFinalPage: true,
  isBed: false,
};
FinalRows.play = async ({ canvasElement }) => {
  const plantingDepthTest = new UnitTest(
    canvasElement,
    'planGuidance-plantingDepth',
    container_planting_depth,
  );
  const rowWidthTest = new UnitTest(
    canvasElement,
    'planGuidance-rowWidth',
    container_planting_depth,
  );
  const spaceBetweenRowsTest = new UnitTest(
    canvasElement,
    'planGuidance-spaceBetween',
    container_planting_depth,
  );

  await plantingDepthTest.testNoInput();
  await plantingDepthTest.testSelectedUnit('in');
  await rowWidthTest.testNoInput();
  await rowWidthTest.testSelectedUnit('in');
  await spaceBetweenRowsTest.testVisibleValue(
    spaceBetweenRowsTest.convertDBValueToDisplayValue(10, 'ft'),
  );
  await spaceBetweenRowsTest.testSelectedUnit('ft');
};
