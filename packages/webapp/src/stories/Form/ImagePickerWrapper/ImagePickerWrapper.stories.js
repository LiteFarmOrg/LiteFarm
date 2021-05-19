import React from 'react';
import ImagePickerWrapper from '../../../containers/ImagePickerWrapper';
import { decoratorsWithStore } from '../../Pages/config/decorators';
import { Underlined } from '../../../components/Typography';
import { useForm } from 'react-hook-form';

const ImagePickerWithHookForm = (props) => {
  const { register, handleSubmit, watch } = useForm({
    mode: 'onChange',
  });
  console.log(watch());
  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <ImagePickerWrapper hookFormRegister={register('imgUrl')} {...props} />
    </form>
  );
};

export default {
  title: 'Components/ImagePickerWrapper',
  component: ImagePickerWithHookForm,
  decorators: decoratorsWithStore,
};

const Template = (args) => <ImagePickerWithHookForm {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  children: <Underlined>Pick an image</Underlined>,
  uploadDirectory: 'storybook/',
};
