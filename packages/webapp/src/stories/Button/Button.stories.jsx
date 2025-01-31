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

export const Warning = Template.bind({});
Warning.args = {
  color: 'warning',
  children: 'Warning',
};

export const Error = Template.bind({});
Error.args = {
  color: 'error',
  children: 'Error',
};

export const Small = Template.bind({});
Small.args = {
  color: 'secondary',
  children: 'Small',
  sm: true,
};

export const Medium = Template.bind({});
Medium.args = {
  color: 'secondary',
  children: 'Medium',
  md: true,
};

export const SmallWithIcon = Template.bind({});
SmallWithIcon.args = {
  color: 'primary',
  sm: true,
  children: (
    <>
      <EditIcon style={{ width: '16px', height: '16px' }} />
      <span>Edit</span>
    </>
  ),
};

export const MediumWithIcon = Template.bind({});
MediumWithIcon.args = {
  color: 'primary',
  md: true,
  children: (
    <>
      <EditIcon style={{ width: '20px', height: '20px' }} />
      <span>Edit</span>
    </>
  ),
};

export const LargeDefaultWithIcon = Template.bind({});
LargeDefaultWithIcon.args = {
  color: 'primary',
  children: (
    <>
      <EditIcon style={{ width: '24px', height: '24px' }} />
      <span>Edit</span>
    </>
  ),
};

export const WithIconDisabled = Template.bind({});
WithIconDisabled.args = {
  color: 'primary',
  disabled: true,
  children: (
    <>
      <EditIcon style={{ width: '24px', height: '24px' }} />
      <span>Edit</span>
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
