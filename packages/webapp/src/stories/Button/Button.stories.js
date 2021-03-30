import React from 'react';
import Button from '../../components/Form/Button';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/Button',
  component: Button,
  decorators: componentDecorators,
};

const Template = (args) => <Button {...args} />;
const TemplateWithText = (args) => (
  <>
    <p>
      Override button style by passing style object to style prop or by passing in a className
      string. To remove background color and pass in a bootstrap className, color need to be set to
      'none'
    </p>
    <Button {...args} />
  </>
);
export const Primary = Template.bind({});
Primary.args = {
  color: 'primary',
  children: 'Primary',
};

export const Secondary = Template.bind({});
Secondary.args = {
  color: 'secondary',
  children: 'Secondary',
};

export const Disabled = Template.bind({});
Disabled.args = {
  color: 'primary',
  children: 'Disabled',
  disabled: true,
};

export const PrimarySmall = Template.bind({});
PrimarySmall.args = {
  color: 'primary',
  children: 'Primary',
  sm: true,
};

export const SecondarySmall = Template.bind({});
SecondarySmall.args = {
  color: 'secondary',
  children: 'Secondary',
  sm: true,
};

export const DisabledSmall = Template.bind({});
DisabledSmall.args = {
  color: 'primary',
  children: 'Disabled',
  disabled: true,
  sm: true,
};

const style = {
  background: 'linear-gradient(to right, orange , yellow, green, cyan, blue, violet)',
};

export const InjectStyle = TemplateWithText.bind({});
InjectStyle.args = {
  color: 'primary',
  label: 'Button',
  style: style,
};
