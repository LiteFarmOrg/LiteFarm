import React from 'react';
import PureFilterPage from '../../../components/FilterPage';
import decorator from '../config/decorators';

export default {
  title: 'Page/FilterPage',
  component: PureFilterPage,
  decorators: decorator,
};

const Template = (args) => <PureFilterPage {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  title: 'Crop Catalog Filter',
  filters: [
    {
      subject: 'Status',
      options: [
        {
          value: 'active',
          label: 'Active',
        },
        {
          value: 'planned',
          label: 'Planned',
        },
        {
          value: 'complete',
          label: 'Complete',
        },
        {
          value: 'abandoned',
          label: 'Abandoned',
        },
        {
          value: 'needs_plan',
          label: 'Needs plan',
        },
      ],
    },
    {
      subject: 'Location',
      options: [
        {
          value: 'Buffer Zone 1',
          label: 'Buffer Zone 1',
        },
        {
          value: 'Buffer Zone 2',
          label: 'Buffer Zone 2',
        },
        {
          value: 'Field 1',
          label: 'Field 1',
        },
        {
          value: 'Field 2',
          label: 'Field 2',
        },
        {
          value: 'Field 3',
          label: 'Field 3',
        },
        {
          value: 'Field 4',
          label: 'Field 4',
        },
        {
          value: 'Field 5',
          label: 'Field 5',
        },
        {
          value: 'Greenhouse 1',
          label: 'Greenhouse 1',
        },
        {
          value: 'Greenhouse 2',
          label: 'Greenhouse 2',
        },
        {
          value: 'Veggie Garden',
          label: 'Veggie Garden',
        },
      ],
    },
    {
      subject: 'Suppliers',
      options: [
        {
          value: 'Supplier 1',
          label: 'Supplier 1',
        },
        {
          value: 'Supplier 2',
          label: 'Supplier 2',
        },
        {
          value: 'Supplier 3',
          label: 'Supplier 3',
        },
      ],
    },
  ],
};

export const NoSuppliers = Template.bind({});
NoSuppliers.args = {
  title: 'Crop Catalog Filter',
  filters: [
    {
      subject: 'Status',
      options: [
        {
          value: 'active',
          label: 'Active',
        },
        {
          value: 'planned',
          label: 'Planned',
        },
        {
          value: 'complete',
          label: 'Complete',
        },
        {
          value: 'abandoned',
          label: 'Abandoned',
        },
        {
          value: 'needs_plan',
          label: 'Needs plan',
        },
      ],
    },
    {
      subject: 'Location',
      options: [
        {
          value: 'Buffer Zone 1',
          label: 'Buffer Zone 1',
        },
        {
          value: 'Buffer Zone 2',
          label: 'Buffer Zone 2',
        },
        {
          value: 'Field 1',
          label: 'Field 1',
        },
        {
          value: 'Field 2',
          label: 'Field 2',
        },
        {
          value: 'Field 3',
          label: 'Field 3',
        },
        {
          value: 'Field 4',
          label: 'Field 4',
        },
        {
          value: 'Field 5',
          label: 'Field 5',
        },
        {
          value: 'Greenhouse 1',
          label: 'Greenhouse 1',
        },
        {
          value: 'Greenhouse 2',
          label: 'Greenhouse 2',
        },
        {
          value: 'Veggie Garden',
          label: 'Veggie Garden',
        },
      ],
    },
    {
      subject: 'Suppliers',
      options: [],
    },
  ],
};
