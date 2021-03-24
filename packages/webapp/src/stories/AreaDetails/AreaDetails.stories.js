import React from 'react';
import AreaDetailsLayout from '../../components/AreaDetailsLayout';
import decorator from '../Pages/config/decorators';
import { useForm } from 'react-hook-form';

export default {
  title: 'Components/Area/AreaDetailsLayout',
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
  name: 'Area asset name',
  title: 'Area asset title',
  submitForm: (data) => {},
  onError: (data) => {},
  isNameRequired: true,
  disabled: false,
  register: (data) => {},
  handleSubmit: (data) => {},
  showPerimeter: true,
  setValue: (data) => {},
  history: (data) => {},
  errors: (data) => {},
  areaType: (data) => {},
  system: 'metric',
};
Primary.parameters = {
  chromatic: { viewports: [320, 414, 768, 1024, 1800] },
};
