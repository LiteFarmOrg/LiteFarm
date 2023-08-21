import React from 'react';
import { PasswordError } from '../../../components/Form/Errors';
import { componentDecorators } from '../../Pages/config/Decorators';

export default {
  title: 'Components/InputPassword/PasswordError',
  component: PasswordError,
  decorators: componentDecorators,
};

const Template = (args) => <PasswordError {...args} />;
export const TooShort = Template.bind({});
TooShort.args = {
  isTooShort: false,
  hasNoUpperCase: true,
  hasNoDigit: true,
  hasNoSymbol: true,
};

export const NoUpperCase = Template.bind({});
NoUpperCase.args = {
  isTooShort: true,
  hasNoUpperCase: false,
  hasNoDigit: true,
  hasNoSymbol: true,
};

export const NoDigit = Template.bind({});
NoDigit.args = {
  isTooShort: true,
  hasNoUpperCase: true,
  hasNoDigit: false,
  hasNoSymbol: true,
};

export const NoSymbol = Template.bind({});
NoSymbol.args = {
  isTooShort: true,
  hasNoUpperCase: true,
  hasNoDigit: true,
  hasNoSymbol: false,
};
