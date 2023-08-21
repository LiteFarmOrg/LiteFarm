import React from 'react';
import ActiveFilterBox from '../../components/ActiveFilterBox';

export default {
  title: 'Components/ActiveFilterBox',
  component: ActiveFilterBox,
};

const Template = (args) => <ActiveFilterBox {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  pageFilter: {
    STATUS: {
      ACTIVE: {
        active: false,
        label: 'Active',
      },
      ABANDONED: {
        active: false,
        label: 'Abandoned',
      },
      PLANNED: {
        active: true,
        label: 'Planned',
      },
      COMPLETE: {
        active: false,
        label: 'Complete',
      },
      NEEDS_PLAN: {
        active: false,
        label: 'Needs plan',
      },
    },
    LOCATION: {
      '6caeac92-73b6-11ed-ac0f-7bd8b506ce4c': {
        active: true,
        label: 'field2',
      },
      '7ef87edc-73b6-11ed-ac0f-7bd8b506ce4c': {
        active: false,
        label: 'field',
      },
      'a2f9778c-73b6-11ed-ac0f-7bd8b506ce4c': {
        active: true,
        label: 'garden',
      },
    },
    SUPPLIERS: {
      '': {
        active: false,
        label: '',
      },
    },
  },
};
Primary.parameters = {
  chromatic: { disable: true },
};
