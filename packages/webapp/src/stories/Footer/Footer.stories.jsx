import React from 'react';
import Button from '../../components/Form/Button';
import Footer from '../../components/Footer';

export default {
  title: 'Components/Footer',
  component: Footer,
};

const Template = (args) => <Footer {...args} />;

export const OneButton = Template.bind({});
OneButton.args = {
  children: <Button fullLength />,
};

export const TwoButtons = Template.bind({});
TwoButtons.args = {
  children: (
    <>
      <Button fullLength />
      <Button fullLength />
    </>
  ),
};
