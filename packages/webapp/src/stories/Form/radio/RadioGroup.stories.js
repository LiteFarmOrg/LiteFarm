import React from 'react';
import RadioGroup from '../../../components/Form/RadioGroup';
import { componentDecorators } from '../../Pages/config/decorators';
import { useForm } from 'react-hook-form';

const RadioGroupWithHookForm = ({ defaultValues, ...props }) => {
  const {
    control,
    handleSubmit,
    getValues,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: defaultValues,
  });
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <RadioGroup
        hookFormControl={control}
        onChange={() => console.log(getValues(), { isValid })}
        {...props}
      />
    </form>
  );
};

export default {
  title: 'Components/Radio/RadioGroup',
  component: RadioGroupWithHookForm,
  decorators: componentDecorators,
};

const Template = (args) => <RadioGroupWithHookForm {...args} />;

export const Column = Template.bind({});
Column.args = {
  name: 'bool',
};

export const Row = Template.bind({});
Row.args = {
  name: 'bool',
  row: true,
};

export const WithNotSure = Template.bind({});
WithNotSure.args = {
  name: 'bool',
  showNotSure: true,
};

export const Required = Template.bind({});
Required.args = {
  name: 'bool',
  required: true,
};

export const DefaultYes = Template.bind({});
DefaultYes.args = {
  name: 'bool',
  row: true,
  defaultValues: { bool: true },
};

export const DefaultNo = Template.bind({});
DefaultNo.args = {
  name: 'bool',
  row: true,
  defaultValues: { bool: false },
};

export const RadioOptions = Template.bind({});
RadioOptions.args = {
  name: 'bool',
  radios: [
    { label: 'option1', value: 'option1', defaultChecked: true },
    { label: 'option2', value: 'option2' },
    { label: 'option3', value: 'option3' },
    { label: 'option4', value: 'option4' },
  ],
};
