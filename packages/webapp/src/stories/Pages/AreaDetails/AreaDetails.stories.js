import React from 'react';
import AreaDetailsLayout from '../../../components/AreaDetailsLayout';
import decorator from '../config/decorators';
import { useForm } from 'react-hook-form';

export default {
  title: 'Form/Area/AreaDetailsLayout',
  decorators: decorator,
  component: AreaDetailsLayout,
};

const Template = (args) => {
  const { register, errors, setValue, getValues, setError, control, handleSubmit } = useForm({
    mode: 'onChange',
  });
  return (
    <AreaDetailsLayout
      {...args}
      register={register}
      control={control}
      setError={setError}
      errors={errors}
      setValue={setValue}
      getValues={getValues}
      handleSubmit={handleSubmit}
    />
  );
};

export const Primary = Template.bind({});
Primary.args = {
  name: 'Field',
  title: 'Add field',
  submitForm: (data) => {},
  onError: (data) => {},
  disabled: false,
  register: (data) => {},
  handleSubmit: (data) => {},
  showPerimeter: true,
  setValue: (data) => {},
  getValues: (data) => {},
  setError: (data) => {},
  control: (data) => {},
  history: (data) => {},
  children: (data) => {},
  errors: (data) => {},
  areaType: (data) => {},
  system: 'metric',
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
