import React from 'react';
import { Loading } from '../../components/Loading/Loading';
import Spinner from '../../components/Spinner';
import decorator from '../Pages/config/Decorators';
import Form from '../../components/Form';
import Button from '../../components/Form/Button';
import PageTitle from '../../components/PageTitle/v2';

export default {
  title: 'Components/Loading',
  component: Loading,
  decorators: decorator,
};

const Template = (args) => <Loading {...args} />;
const TemplateWithText = (args) => (
  <Form
    buttonGroup={
      <>
        <Button fullLength>Submit</Button>
      </>
    }
  >
    <PageTitle title={'Title'} />
    <Loading {...args} />
  </Form>
);
export const Primary = Template.bind({});
Primary.args = {};

export const InForm = TemplateWithText.bind({});
InForm.args = {};

export const Transparent = () => <Spinner />;
