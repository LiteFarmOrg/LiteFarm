import React from 'react';
import PureFilterPage from '../../../components/FilterPage';
import decorator from '../config/Decorators';
import Input from '../../../components/Form/Input';

export default {
  title: 'Page/FilterPage',
  component: PureFilterPage,
  decorators: decorator,
};

const Template = (args) => <PureFilterPage {...args} />;
export const Primary = Template.bind({});
Primary.args = {
  title: 'Crop Catalogue Filter',
  filters: [
    {
      subject: 'Status',
      filterKey: 'Status',
      options: [
        {
          value: 'active',
          default: false,
          label: 'Active',
        },
        {
          value: 'planned',
          default: false,
          label: 'Planned',
        },
        {
          value: 'complete',
          default: false,
          label: 'Complete',
        },
        {
          value: 'abandoned',
          default: false,
          label: 'Abandoned',
        },
        {
          value: 'needs_plan',
          default: false,
          label: 'Needs plan',
        },
      ],
    },
    {
      subject: 'Location',
      filterKey: 'Location',
      options: [
        {
          value: 'Buffer Zone 1',
          default: false,
          label: 'Buffer Zone 1',
        },
        {
          value: 'Buffer Zone 2',
          default: false,
          label: 'Buffer Zone 2',
        },
        {
          value: 'Field 1',
          default: false,
          label: 'Field 1',
        },
        {
          value: 'Field 2',
          default: false,
          label: 'Field 2',
        },
        {
          value: 'Field 3',
          default: false,
          label: 'Field 3',
        },
        {
          value: 'Field 4',
          default: false,
          label: 'Field 4',
        },
        {
          value: 'Field 5',
          default: false,
          label: 'Field 5',
        },
        {
          value: 'Greenhouse 1',
          default: false,
          label: 'Greenhouse 1',
        },
        {
          value: 'Greenhouse 2',
          default: false,
          label: 'Greenhouse 2',
        },
        {
          value: 'Veggie Garden',
          default: false,
          label: 'Veggie Garden',
        },
      ],
    },
    {
      subject: 'Suppliers',
      filterKey: 'Suppliers',
      options: [
        {
          value: 'Supplier 1',
          default: false,
          label: 'Supplier 1',
        },
        {
          value: 'Supplier 2',
          default: false,
          label: 'Supplier 2',
        },
        {
          value: 'Supplier 3',
          default: false,
          label: 'Supplier 3',
        },
      ],
    },
  ],
};

export const NoSuppliers = Template.bind({});
NoSuppliers.args = {
  title: 'Crop Catalogue Filter',
  filters: [
    {
      subject: 'Status',
      filterKey: 'Status',
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
      filterKey: 'Location',
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
      filterKey: 'Suppliers',
      options: [],
    },
  ],
};

export const DocumentsFilter = Template.bind({});
DocumentsFilter.args = {
  title: 'Documents Filter',
  filters: [
    {
      subject: 'Type',
      filterKey: 'Type',
      options: [
        {
          value: 'cleaning_product',
          default: false,
          label: 'Cleaning product',
        },
        {
          value: 'crop_compliance',
          default: false,
          label: 'Crop compliance',
        },
        {
          value: 'fertilizing_product',
          default: false,
          label: 'Fertilizing product',
        },
        {
          value: 'pest_control_product',
          default: false,
          label: 'Pest control product',
        },
        {
          value: 'soil_amendment',
          default: false,
          label: 'Soil amendment',
        },
        {
          value: 'other',
          default: false,
          label: 'Other',
        },
      ],
    },
  ],
  children: (
    <div>
      <Input label={'Valid until'} type={'date'} />
    </div>
  ),
};
