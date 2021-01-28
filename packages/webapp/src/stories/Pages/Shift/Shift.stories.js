import React from 'react';
import decorators from '../config/decorators';
import Shift from '../../../containers/Shift';
import ShiftStepOne from '../../../containers/Shift/StepOne/StepOne';
import ShiftStepTwo from '../../../components/Shift/StepTwo/index';

export default {
  title: 'Form/Shift/Main',
  decorators: decorators,
  component: Shift,
};

const Template = (args) => <Shift {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
Primary.parameters = {};

const StepOne = (args) => <ShiftStepOne {...args} />;

export const One = StepOne.bind({});

One.args = {
  workers: [{ label: 'Worker One', value: '2202020' }],
};

const StepTwo = (args) => <ShiftStepTwo {...args} />;

export const Two = StepTwo.bind({});

Two.args = {};
