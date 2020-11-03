import React from 'react';
import styles from './button.scss';
import Button from "../../components/Form/Button";

export default {
  title: 'Components/Button',
  component: Button,
  decorators: [story => <div style={{ padding: '3rem' }}>{story()}</div>],
};

const Template = (args) => <Button {...args} />;
const TemplateWithText = (args) => <><p>Override button style by passing imported scss stylesheet as classes or by passing in a className string. To remove background color and pass in a bootstrap className, color need to be set to undefined</p><Button {...args} /></>;
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
  disabled: true
};

export const PrimarySmall = Template.bind({});
PrimarySmall.args = {
  color: 'primary',
  children: 'Primary',
  sm: true
};

export const SecondarySmall = Template.bind({});
SecondarySmall.args = {
  color: 'secondary',
  children: 'Secondary',
  sm: true
};

export const DisabledSmall = Template.bind({});
DisabledSmall.args = {
  color: 'primary',
  children: 'Disabled',
  disabled: true,
  sm: true
};

export const InjectClasses = TemplateWithText.bind({});
InjectClasses.args = {
  color: 'primary',
  label: 'Button',
  classes: styles
};

export const InjectBootstrapClassName = TemplateWithText.bind({});
InjectBootstrapClassName.args = {
  label: 'Button',
  color: undefined,
  className: 'btn btn-dark'
};
