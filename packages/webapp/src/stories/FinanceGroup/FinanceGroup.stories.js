import React from 'react';
import FinanceGroup from '../../components/Finances/FinanceGroup';
import { componentDecorators } from '../Pages/config/decorators';

export default {
  title: 'Components/FinanceGroup',
  component: FinanceGroup,
  decorators: componentDecorators,
};

const Template = (args) => <FinanceGroup {...args} />;

export const EstimatedCropRevenue = Template.bind({});
EstimatedCropRevenue.args = {
  headerTitle: 'Bolero, Carrot',
  totalAmount: 600,
  isDropDown: true,
  financeItemsProps: [
    {
      title: 'Plan 1',
      subtitle: "May 8, '21 | Bed 2",
      amount: 100,
      isPlan: true,
      onClickForward: () => {
        console.log('Plan 1 clicked');
      },
    },
    {
      title: 'Plan 2',
      subtitle: "Apr 17, '21 | Bed 1",
      amount: 500,
      isPlan: true,
      onClickForward: () => {
        console.log('Plan 2 clicked');
      },
    },
  ],
};

export const EstimatedCropRevenueWithLargeSpecifyBedNote = Template.bind({});
EstimatedCropRevenueWithLargeSpecifyBedNote.args = {
  headerTitle: 'Bolero, Carrot',
  totalAmount: 600,
  isDropDown: true,
  financeItemsProps: [
    {
      title: 'Plan 1',
      subtitle:
        "May 8, '21 | Large note bed that should overflow into the next line in small viewport",
      amount: 100,
      isPlan: true,
      onClickForward: () => {
        console.log('Plan 1 clicked');
      },
    },
    {
      title: 'Plan 2',
      subtitle: "Apr 17, '21 | Bed 1",
      amount: 500,
      isPlan: true,
      onClickForward: () => {
        console.log('Plan 2 clicked');
      },
    },
  ],
};

export const EstimatedNonCropRevenue = Template.bind({});
EstimatedNonCropRevenue.args = {
  headerTitle: 'Donation',
  totalAmount: 600,
  isDropDown: true,
  financeItemsProps: [
    {
      title: 'Description 1',
      amount: 300,
      onClickForward: () => {
        console.log('Donation 1 clicked');
      },
    },
    {
      title: 'Description 2',
      amount: 300,
      onClickForward: () => {
        console.log('Donation 2 clicked');
      },
    },
  ],
};

export const EstimatedNonCropRevenueWithLongDescription = Template.bind({});
EstimatedNonCropRevenueWithLongDescription.args = {
  headerTitle: 'Donation',
  totalAmount: 600,
  isDropDown: true,
  financeItemsProps: [
    {
      title: 'Description 1 that is very long to overflow to next line in small viewport',
      amount: 300,
      onClickForward: () => {
        console.log('Donation 1 clicked');
      },
    },
    {
      title: 'Description 2',
      amount: 300,
      onClickForward: () => {
        console.log('Donation 2 clicked');
      },
    },
  ],
};

export const ActualCropRevenue = Template.bind({});
ActualCropRevenue.args = {
  headerTitle: "May 8, '21",
  headerClickForward: () => {
    console.log('Edit income');
  },
  totalAmount: 300,
  isDropDown: false,
  financeItemsProps: [
    {
      title: 'Parsnip',
      subtitle: '15 kg',
      amount: 150.0,
    },
    {
      title: 'Rainbow Blend, Carrot',
      subtitle: '10 kg',
      amount: 150.0,
    },
  ],
};

export const ActualCropRevenueWithCustomer = Template.bind({});
ActualCropRevenueWithCustomer.args = {
  headerTitle: "May 8, '21",
  headerSubtitle: 'Customer Name',
  headerClickForward: () => {
    console.log('Edit income');
  },
  totalAmount: 300,
  isDropDown: false,
  financeItemsProps: [
    {
      title: 'Parsnip',
      subtitle: '15 kg',
      amount: 150.0,
    },
    {
      title: 'Rainbow Blend, Carrot',
      subtitle: '10 kg',
      amount: 150.0,
    },
  ],
};

export const ActualNonCropRevenue = Template.bind({});
ActualNonCropRevenue.args = {
  headerTitle: "May 8, '21",
  headerClickForward: () => {
    console.log('Edit income');
  },
  totalAmount: 800,
  isDropDown: false,
  financeItemsProps: [
    {
      title: 'Donation',
      subtitle: 'Description',
      amount: 400.0,
    },
    {
      title: 'Equipment Rental',
      subtitle:
        'This is a long description that goes to multiple lines (in a sufficiently small viewport)',
      amount: 150.0,
    },
  ],
};
