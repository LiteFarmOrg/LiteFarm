import React from 'react';
import PureAddManagementPlan from '../../components/Crop/addManagementPlan';
import { componentDecorators } from '../Pages/config/decorators';

export default {
    title: 'Components/Crop/AddManagementPlan',
    component: PureAddManagementPlan,
    decorators: componentDecorators,
};

const Template = (args) => <PureAddManagementPlan {...args} />;

export const AddManagementPlan = Template.bind({});
AddManagementPlan.args = {
    disabled: true,
};