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
import { TableKind, CellKind } from '../../components/Table/types';
import { Status } from '../../components/StatusIndicatorPill';
import { getIntlDate } from '../../util/date-migrate-TS';

export default {
  title: 'Components/Tables/Cells',
  component: Table,
  decorators: v2TableDecorator,
};

const getFakeColumnsOne = () => {
  return [
    {
      id: 'crop',
      label: 'Crops',
      format: (d) => <Cell kind={CellKind.ICON_TEXT} iconName={d.iconName} text={d.crop} />,
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
      id: 'StatusIndicatorPill',
      label: 'Availability',
      format: (d) => {
        const isAvailable = Math.random() < 3 / 4;
        return (
          <Cell
            kind={CellKind.STATUS_INDICATOR_PILL}
            status={isAvailable ? Status.ONLINE : Status.OFFLINE}
            pillText={isAvailable ? 'Available' : 'Sold out'}
            tooltipText={isAvailable ? 'This crop is available' : 'This crop is sold out'}
          />
        );
      },
      sortable: false,
    },
    {
      id: 'rightChevronLink',
      label: '',
      format: (d) => <Cell kind={CellKind.RIGHT_CHEVRON_LINK} path={'/'} />,
      sortable: false,
    },
  ];
};

const getFakeColumnsTwo = () => {
  return [
    {
      id: 'date',
      label: 'Date',
      format: (d) => (
        <Cell kind={CellKind.ICON_TEXT} iconName={'CALENDAR'} text={getIntlDate(d.date)} />
      ),
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
      date: Date.now(),
      crop: 'White corn, Corn',
      iconName: 'CROP',
      tasks: ['Task 1', 'Task 2', 'Task 3'],
      revenue: 8796.0,
    },
    {
      date: Date.now() - 1000 * 60 * 3,
      crop: 'Koto, Buckwheat',
      iconName: 'CROP',
      tasks: ['Task 1', 'Task 2', 'Task 3'],
      revenue: 692.5,
    },
    {
      date: Date.now() - 1000 * 60 * 60 * 3,
      crop: 'Lutz green leaf, Beetroot',
      iconName: 'CROP',
      tasks: ['Task 1', 'Task 2'],
      revenue: 210.0,
    },
    {
      date: Date.now() - 1000 * 7 * 60 * 60 * 3,
      crop: 'Cox’s orange pippin, Apple',
      iconName: 'CROP',
      tasks: ['Task 1'],
      revenue: 340.0,
    },
    {
      date: Date.now() - 1000 * 30 * 60 * 60 * 3,
      crop: 'Macoun, Apples',
      iconName: 'CROP',
      tasks: [],
      revenue: 1234.0,
    },
    {
      date: Date.now() - 1000 * 366 * 60 * 60 * 3,
      crop: 'Butter Boy Hybrid, Butternut ',
      iconName: 'CROP',
      tasks: ['Task 1'],
      revenue: 785.5,
    },
    {
      date: Date.now(),
      crop: 'King Edward, Potato',
      iconName: 'CROP',
      tasks: ['Task 1'],
      revenue: 237.0,
    },
    {
      date: Date.now(),
      crop: 'Blanco Veneto, Celeriac',
      iconName: 'CROP',
      tasks: ['Task 1'],
      revenue: 895.0,
    },
    {
      date: Date.now(),
      crop: 'Hollow Crown, Parsnips ',
      iconName: 'CROP',
      tasks: ['Task 1'],
      revenue: 354.0,
    },
    {
      date: Date.now(),
      crop: 'Early White Hybrid, Cauliflower',
      iconName: 'CROP',
      tasks: ['Task 1'],
      revenue: 789.5,
    },
  ].slice(0, length);
};

export const FakeTableOneWithCells = {
  args: {
    kind: TableKind.V2,
    columns: getFakeColumnsOne(),
    data: getFakeData(10),
    minRows: 10,
    shouldFixTableLayout: true,
  },
};

// Showcase more table cell types
export const FakeTableTwoWithCells = {
  args: {
    kind: TableKind.V2,
    columns: getFakeColumnsTwo(),
    data: getFakeData(10),
    minRows: 10,
    shouldFixTableLayout: true,
  },
};
