import React from 'react';
import PureCropTile from '../../components/CropTile';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/CropTile',
  component: PureCropTile,
  decorators: componentDecorators,
};

const Template = (args) => <div style={{height: "140px"}}>
  <PureCropTile {...args} />
</div>;
export const Active = Template.bind({});
Active.args = {
  fieldCrop: {
    varietalName: "Bolero",
    type: "Carrot",
  }
};

export const Planned = Template.bind({});
Planned.args = {
  fieldCrop: {
    varietalName: "Bolero",
    type: "Carrot",
    date: "May 8",
  }
};

export const Past = Template.bind({});
Past.args = {
  fieldCrop: {
    varietalName: "Bolero",
    type: "Carrot",
    date: "2020",
  }
};
