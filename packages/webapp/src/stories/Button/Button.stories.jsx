import React from 'react';
import Button from '../../components/Form/Button';
import { componentDecorators } from '../Pages/config/Decorators';
import { ReactComponent as EditIcon } from '../../assets/images/edit.svg';

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
      string. To remove background color and pass in a global css className, color need to be set to
      &apos;none&apos;
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

export const Secondary2 = Template.bind({});
Secondary2.args = {
  color: 'secondary-2',
  children: 'Secondary-2',
};

export const SecondaryCTA = Template.bind({});
SecondaryCTA.args = {
  color: 'secondary-cta',
  children: 'Secondary-CTA',
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

export const WithIconSmall = Template.bind({});
WithIconSmall.args = {
  color: 'primary',
  sm: true,
  children: (
    <>
      <div>Edit</div>
      <EditIcon style={{ width: '16px', height: '16px' }} />
    </>
  ),
};

export const WithIconDisabled = Template.bind({});
WithIconDisabled.args = {
  color: 'primary',
  disabled: true,
  children: (
    <>
      <div>Edit</div>
      <EditIcon style={{ width: '16px', height: '16px' }} />
    </>
  ),
};

const style = {
  background:
    'linear-gradient(to right, var(--Colors-Accent---singles-Red-light), var(--Colors-Secondary-Secondary-green-200))',
};

export const OverrideStyle = TemplateWithText.bind({});
OverrideStyle.args = {
  color: 'none',
  label: 'Style override',
  style: style,
};
