/*
 *  Copyright 2023 LiteFarm.org
 *  This file is part of LiteFarm.
 *
 *  LiteFarm is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  LiteFarm is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import React from 'react';
import { v2TableDecorator } from '../Pages/config/Decorators';
import Table from '../../components/Table/v2';

export default {
  title: 'Components/Tables/V2',
  component: Table,
  decorators: v2TableDecorator,
};

const getCropSalesColumns = (mobileView = true) => {
  return [
    {
      id: 'crop',
      label: 'Crops',
      Footer: mobileView ? null : 'DAILY TOTAL',
      format: (d) =>
        mobileView ? (
          <div style={{ paddingTop: 1 }}>
            <div>
              <b>{d.crop}</b>
            </div>
            <div style={{ color: '#9FAABE', fontSize: 12 }}>{d.quantity} kg</div>
          </div>
        ) : (
          d.crop
        ),
    },
    {
      id: mobileView ? null : 'quantity',
      label: mobileView ? null : 'Quantity',
      format: (d) => (mobileView ? null : `${Math.abs(d.quantity).toFixed(2)} kg`),
      align: 'right',
      Footer: mobileView ? null : <b>3754kg</b>,
      columnProps: {
        style: { width: '25%' },
      },
    },
    {
      id: 'revenue',
      label: 'Revenue',
      format: (d) => {
        const sign = '$';
        return (
          <span>
            {sign}
            {Math.abs(d.revenue).toFixed(2)}
          </span>
        );
      },
      align: 'right',
      Footer: mobileView ? null : <b>$17571.5</b>,
      columnProps: {
        style: { width: '100px' },
      },
    },
  ];
};

const getCropSalesData = (length) => {
  return [
    { crop: 'White corn, Corn', quantity: 2124, revenue: 8796.0 },
    { crop: 'Koto, Buckwheat', quantity: 724, revenue: 692.5 },
    { crop: 'Lutz green leaf, Beetroot', quantity: 58, revenue: 210.0 },
    { crop: 'Cox’s orange pippin, Apple', quantity: 48, revenue: 340.0 },
    { crop: 'Macoun, Apples', quantity: 124, revenue: 1234.0 },
    { crop: 'Butter Boy Hybrid, Butternut ', quantity: 24, revenue: 785.5 },
    { crop: 'King Edward, Potato', quantity: 58, revenue: 237.0 },
    { crop: 'Blanco Veneto, Celeriac', quantity: 56, revenue: 895.0 },
    { crop: 'Hollow Crown, Parsnips ', quantity: 23, revenue: 354.0 },
    { crop: 'Early White Hybrid, Cauliflower', quantity: 87, revenue: 789.5 },
  ].slice(0, length);
};

const FooterCell = () => (
  <div
    style={{
      width: '100%',
      backgroundColor: '#f3f6fb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 40,
      paddingLeft: 12,
      paddingRight: 12,
    }}
  >
    <div>DAILY TOTAL</div>
    <div>
      <b>3754 kg</b>
    </div>
    <div>
      <b>$17571.5</b>
    </div>
  </div>
);

export const CropSalesMobileView = {
  args: {
    columns: getCropSalesColumns(),
    data: getCropSalesData(10),
    minRows: 10,
    shouldFixTableLayout: true,
    FooterCell: FooterCell,
  },
};

export const CropSalesDesktopView = {
  args: {
    columns: getCropSalesColumns(false),
    data: getCropSalesData(10),
    minRows: 10,
    shouldFixTableLayout: true,
  },
};

const getEmployeesLabourColumns = () => {
  return [
    {
      id: 'employee',
      label: 'Employee',
      Footer: 'DAILY TOTAL',
    },
    {
      id: 'time',
      label: 'Time',
      format: (d) => `${d.time} h`,
      align: 'right',
      Footer: <b>89 h</b>,
    },
    {
      id: 'labourCost',
      label: 'Labour cost',
      format: (d) => {
        const sign = '$';
        return (
          <span>
            {sign}
            {Math.abs(d.labourCost).toFixed(2)}
          </span>
        );
      },
      align: 'right',
      Footer: <b>$3732.50</b>,
    },
  ];
};

const getEmployeesLabourData = (length) => {
  return [
    { employee: 'Sue D.', time: 1.25, labourCost: 0.0 },
    { employee: 'L.F. C.', time: 77.5, labourCost: 3692.5 },
    { employee: 'Joey.', time: 2.75, labourCost: 0.0 },
    { employee: 'Farmie.', time: 7.5, labourCost: 40.0 },
  ].slice(0, length);
};

export const EmployeesLabour = {
  args: {
    columns: getEmployeesLabourColumns(),
    data: getEmployeesLabourData(10),
    minRows: 10,
    onClickMore: () => console.log('Go to labour page'),
  },
};

const getTasksLabourColumns = () => {
  return [
    {
      id: 'task',
      label: 'Tasks',
      Footer: 'DAILY TOTAL',
      component: 'th',
      columnProps: {
        style: { width: '33%' },
      },
    },
    {
      id: 'time',
      label: 'Time',
      format: (d) => `${d.time} h`,
      align: 'right',
      Footer: <b>89 h</b>,
      columnProps: {
        style: { width: '33%' },
      },
    },
    {
      id: 'labourCost',
      label: 'Labour cost',
      format: (d) => {
        const sign = '$';
        return (
          <span>
            {sign}
            {Math.abs(d.labourCost).toFixed(2)}
          </span>
        );
      },
      align: 'right',
      Footer: <b>$3732.50</b>,
      columnProps: {
        style: { width: '33%' },
      },
    },
  ];
};

const getTasksLabourData = (length) => {
  return [
    { task: 'Harvest', time: 51.25, labourCost: 2500 },
    { task: 'Weeding', time: 13.5, labourCost: 450.5 },
    { task: 'Packing', time: 6.75, labourCost: 200 },
    { task: 'Cleaning', time: 6.5, labourCost: 232 },
    { task: 'Transport', time: 6, labourCost: 200 },
    { task: 'Livestock feeding', time: 5, labourCost: 150 },
  ].slice(0, length);
};

export const TasksLabour = {
  args: {
    columns: getTasksLabourColumns(),
    data: getTasksLabourData(10),
    minRows: 5,
    onClickMore: () => console.log('Go to labour page'),
  },
};

export const TasksLabourWithPagination = {
  args: {
    columns: getTasksLabourColumns(),
    data: getTasksLabourData(10),
    minRows: 5,
    onClickMore: () => console.log('Go to labour page'),
    showPagination: true,
  },
};
