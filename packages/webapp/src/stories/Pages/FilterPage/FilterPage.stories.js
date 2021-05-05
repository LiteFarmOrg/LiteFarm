import React from 'react';
import Filter from '../../../components/Filter';
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
      options: ['Active', 'Planned', 'Complete', 'Abandoned', 'Needs Plan'],
    },
    {
      subject: 'Location',
      options: [
        'Buffer Zone 1',
        'Buffer Zone 2',
        'Field 1',
        'Field 2',
        'Field 3',
        'Field 4',
        'Field 5',
        'Greenhouse 1',
        'Greenhouse 2',
        'Veggie Garden',
      ],
    },
    {
      subject: 'Suppliers',
      options: ['Supplier 1', 'Supplier 2', 'Supplier 3'],
    },
  ],
};
