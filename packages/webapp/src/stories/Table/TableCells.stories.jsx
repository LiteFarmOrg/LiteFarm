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
import Table from '../../components/Table';
import Cell from '../../components/Table/Cell';
import CropIcon from '../../assets/images/nav/crops.svg?react';
import { TableKind, CellKind } from '../../components/Table/types';

export default {
  title: 'Components/Tables/Cells',
  component: Table,
  decorators: v2TableDecorator,
};

const getFakeColumns = () => {
  return [
    {
      id: 'crop',
      label: 'Crops',
      format: (d) => <Cell kind={CellKind.ICON_TEXT} icon={d.icon} text={d.crop} />,
    },
    {
      id: 'tasks',
      label: 'Tasks (not sortable)',
      format: (d) => <Cell kind={CellKind.HOVER_PILL_OVERFLOW} items={d.tasks} />,
      sortable: false,
    },
    {
      id: 'revenue',
      label: 'Revenue',
      format: (d) => <Cell kind={CellKind.PLAIN} text={d.revenue} />,
    },
    {
      id: 'rightChevronLink',
      label: '',
      format: (d) => <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={'/'} />,
      sortable: false,
    },
  ];
};

const getFakeData = (length) => {
  return [
    {
      crop: 'White corn, Corn',
      icon: CropIcon,
      tasks: ['Task 1', 'Task 2', 'Task 3'],
      revenue: 8796.0,
    },
    {
      crop: 'Koto, Buckwheat',
      icon: CropIcon,
      tasks: ['Task 1', 'Task 2', 'Task 3'],
      revenue: 692.5,
    },
    {
      crop: 'Lutz green leaf, Beetroot',
      icon: CropIcon,
      tasks: ['Task 1', 'Task 2'],
      revenue: 210.0,
    },
    { crop: 'Cox’s orange pippin, Apple', icon: CropIcon, tasks: ['Task 1'], revenue: 340.0 },
    { crop: 'Macoun, Apples', icon: CropIcon, tasks: [], revenue: 1234.0 },
    { crop: 'Butter Boy Hybrid, Butternut ', icon: CropIcon, tasks: ['Task 1'], revenue: 785.5 },
    { crop: 'King Edward, Potato', icon: CropIcon, tasks: ['Task 1'], revenue: 237.0 },
    { crop: 'Blanco Veneto, Celeriac', icon: CropIcon, tasks: ['Task 1'], revenue: 895.0 },
    { crop: 'Hollow Crown, Parsnips ', icon: CropIcon, tasks: ['Task 1'], revenue: 354.0 },
    { crop: 'Early White Hybrid, Cauliflower', icon: CropIcon, tasks: ['Task 1'], revenue: 789.5 },
  ].slice(0, length);
};

export const FakeTableWithCells = {
  args: {
    kind: TableKind.V2,
    columns: getFakeColumns(),
    data: getFakeData(10),
    minRows: 10,
    shouldFixTableLayout: true,
  },
};
