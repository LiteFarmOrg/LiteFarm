import React from 'react';
import PureHarvestUses from '../../../components/Task/TaskComplete/HarvestComplete/HarvestUses';
import UnitTest from '../../../test-utils/storybook/unit';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

import decorator from '../config/Decorators';

export default {
  title: 'Form/Crop/Tasks/HarvestUses',
  component: PureHarvestUses,
  decorators: decorator,
};

const args = {
  onCancel: () => {},
  onGoBack: () => {},
  onContinue: () => {},
  useHookFormPersist: () => ({}),
  persistedFormData: {},
  harvestUseTypes: [
    {
      harvest_use_type_id: 1,
      harvest_use_type_name: 'Sales',
      farm_id: null,
      harvest_use_type_translation_key: 'SALES',
    },
    {
      harvest_use_type_id: 2,
      harvest_use_type_name: 'Self-Consumption',
      farm_id: null,
      harvest_use_type_translation_key: 'SELF-CONSUMPTION',
    },
    {
      harvest_use_type_id: 3,
      harvest_use_type_name: 'Animal Feed',
      farm_id: null,
      harvest_use_type_translation_key: 'ANIMAL_FEED',
    },
    {
      harvest_use_type_id: 4,
      harvest_use_type_name: 'Compost',
      farm_id: null,
      harvest_use_type_translation_key: 'COMPOST',
    },
    {
      harvest_use_type_id: 5,
      harvest_use_type_name: 'Gift',
      farm_id: null,
      harvest_use_type_translation_key: 'GIFT',
    },
    {
      harvest_use_type_id: 6,
      harvest_use_type_name: 'Exchange',
      farm_id: null,
      harvest_use_type_translation_key: 'EXCHANGE',
    },
    {
      harvest_use_type_id: 7,
      harvest_use_type_name: 'Saved for seed',
      farm_id: null,
      harvest_use_type_translation_key: 'SAVED_FOR_SEED',
    },
    {
      harvest_use_type_id: 8,
      harvest_use_type_name: 'Not Sure',
      farm_id: null,
      harvest_use_type_translation_key: 'NOT_SURE',
    },
    {
      harvest_use_type_id: 11,
      harvest_use_type_name: 'Other',
      farm_id: null,
      harvest_use_type_translation_key: 'OTHER',
    },
  ],
  task: {},
  onAddHarvestType: () => {},
};

const Template = (args) => <PureHarvestUses {...args} />;

export const KgHarvestUses = Template.bind({});
KgHarvestUses.args = { ...args, system: 'metric', amount: 30, unit: 'kg' };
KgHarvestUses.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const addLink = await canvas.getByText('Add another harvest use');
  const amountToAllocate = canvas.getByText(/^Amount to allocate/);

  await userEvent.click(addLink);
  await userEvent.click(addLink);

  const removeLinks = await canvas.findAllByText('Remove');
  const quantity1Test = new UnitTest(canvasElement, 'quantity-0');
  const quantity2Test = new UnitTest(canvasElement, 'quantity-1');
  const quantity3Test = new UnitTest(canvasElement, 'quantity-2');

  expect(amountToAllocate).toHaveTextContent('30 kg');

  await quantity1Test.inputValueAndBlur('5');
  expect(amountToAllocate).toHaveTextContent('25 kg');

  await quantity2Test.inputValueAndBlur('20');
  expect(amountToAllocate).toHaveTextContent('5 kg');

  await quantity3Test.inputValueAndBlur('10');
  expect(amountToAllocate).toHaveTextContent('-5 kg');

  await userEvent.click(removeLinks[0]);
  expect(amountToAllocate).toHaveTextContent('0 kg');
};

export const MtHarvestUses = Template.bind({});
MtHarvestUses.args = { ...args, system: 'metric', amount: 10000, unit: 'mt' };
MtHarvestUses.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const addLink = await canvas.getByText('Add another harvest use');
  const amountToAllocate = canvas.getByText(/^Amount to allocate/);

  expect(amountToAllocate).toHaveTextContent('10 mt');

  const quantity1Test = new UnitTest(canvasElement, 'quantity-0');
  await quantity1Test.inputValueAndBlur('8');
  await quantity1Test.selectUnit('mt');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('2 mt');
  });

  await userEvent.click(addLink);
  const quantity2Test = new UnitTest(canvasElement, 'quantity-1');
  await quantity2Test.inputValueAndBlur('1.5');
  await quantity2Test.selectUnit('mt');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('0.5 mt');
  });

  await userEvent.click(addLink);
  const quantity3Test = new UnitTest(canvasElement, 'quantity-2');
  await quantity3Test.inputValueAndBlur('500');
  expect(amountToAllocate).toHaveTextContent('0 mt');
};

export const LbHarvestUses = Template.bind({});
LbHarvestUses.args = { ...args, system: 'imperial', amount: 9.07184, unit: 'lb' };
LbHarvestUses.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const addLink = await canvas.getByText('Add another harvest use');
  const amountToAllocate = canvas.getByText(/^Amount to allocate/);

  expect(amountToAllocate).toHaveTextContent('20 lb');

  const quantity1Test = new UnitTest(canvasElement, 'quantity-0');
  await quantity1Test.inputValueAndBlur('10');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('10 lb');
  });

  await userEvent.click(addLink);
  const quantity2Test = new UnitTest(canvasElement, 'quantity-1');
  await quantity2Test.inputValueAndBlur('15');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('-5 lb');
  });

  await quantity2Test.clearInputAndBlur();
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('10 lb');
  });

  await quantity2Test.inputValueAndBlur('10');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('0 lb');
  });
};

export const USTHarvestUses = Template.bind({});
USTHarvestUses.args = { ...args, system: 'imperial', amount: 907.184, unit: 't' };
USTHarvestUses.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  const addLink = await canvas.getByText('Add another harvest use');
  const amountToAllocate = canvas.getByText(/^Amount to allocate/);

  expect(amountToAllocate).toHaveTextContent('1 t');

  const quantity1Test = new UnitTest(canvasElement, 'quantity-0');
  await quantity1Test.inputValueAndBlur('500');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('0.75 t');
  });

  await userEvent.click(addLink);
  const quantity2Test = new UnitTest(canvasElement, 'quantity-1');
  await quantity2Test.inputValueAndBlur('1500');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('0 t');
  });

  await quantity2Test.inputValueAndBlur('3000');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('-0.75 t');
  });

  await quantity2Test.inputValueAndBlur('1500');
  await waitFor(() => {
    expect(amountToAllocate).toHaveTextContent('0 t');
  });
};
