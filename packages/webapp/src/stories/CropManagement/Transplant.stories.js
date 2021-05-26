import React from 'react';
import Transplant from '../../components/Crop/transplant';
import decorators from '../Pages/config/decorators';

export default {
    title: 'Page/AddManagementPlan/Transplant',
    component: Transplant,
    decorators: decorators,
};

const Template = (args) => <Transplant {...args} />;

export const Transplant = Template.bind({});
Transplant.args = {
    disabled: true,
};