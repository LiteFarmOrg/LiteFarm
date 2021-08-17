import React from 'react';
import PureTaskReadOnly from '../../../components/Task/TaskReadOnly';
import decorator from '../config/decorators';

export default {
  title: 'Form/Crop/Tasks/TaskReadOnly',
  component: PureTaskReadOnly,
  decorators: decorator,
};

const Template = (args) => <PureTaskReadOnly {...args} />;

const cropLocations = [
  {
    farm_id: 'd49b0838-c812-11eb-b18a-0242ac120002',
    name: 'eq',
    notes: '',
    location_id: '8b47b24e-f427-11eb-b310-9b4fc6232458',
    figure_id: '8b47b24f-f427-11eb-b310-9b4fc6232458',
    type: 'field',
    total_area: 5587,
    total_area_unit: 'ha',
    grid_points: [
      {
        lat: 49.26919164618451,
        lng: -123.18165204714356,
      },
      {
        lat: 49.268547584065274,
        lng: -123.18288586329041,
      },
      {
        lat: 49.268603589800726,
        lng: -123.1806328077179,
      },
    ],
    perimeter: 377,
    perimeter_unit: 'm',
    organic_status: 'Non-Organic',
    transition_date: '2021-08-03T07:00:00.000Z',
    station_id: null,
  },
  {
    farm_id: 'd49b0838-c812-11eb-b18a-0242ac120002',
    name: 'w',
    notes: '',
    location_id: 'c361c80a-f70a-11eb-8dd7-6f2c0c6a4580',
    figure_id: 'c361c80b-f70a-11eb-8dd7-6f2c0c6a4580',
    type: 'garden',
    total_area: 5309,
    total_area_unit: 'ha',
    grid_points: [
      {
        lat: 49.26919514649913,
        lng: -123.18276784609375,
      },
      {
        lat: 49.26819404639292,
        lng: -123.18202755640564,
      },
      {
        lat: 49.26790001313183,
        lng: -123.18312189768372,
      },
    ],
    perimeter: 356,
    perimeter_unit: 'm',
    organic_status: 'Non-Organic',
    station_id: null,
    transition_date: null,
  },
  {
    farm_id: 'd49b0838-c812-11eb-b18a-0242ac120002',
    name: '4',
    notes: '',
    location_id: 'ce8f9676-f70a-11eb-8dd7-6f2c0c6a4580',
    figure_id: 'ce8f9677-f70a-11eb-8dd7-6f2c0c6a4580',
    type: 'greenhouse',
    total_area: 9938,
    total_area_unit: 'ha',
    grid_points: [
      {
        lat: 49.26823605100145,
        lng: -123.18331501673279,
      },
      {
        lat: 49.26825705329233,
        lng: -123.18087957094727,
      },
      {
        lat: 49.26926515273966,
        lng: -123.18101904581604,
      },
    ],
    perimeter: 492,
    organic_status: 'Non-Organic',
    supplemental_lighting: null,
    co2_enrichment: null,
    greenhouse_heated: null,
    perimeter_unit: 'm',
    transition_date: null,
  },
  {
    farm_id: 'd49b0838-c812-11eb-b18a-0242ac120002',
    name: '3',
    notes: '',
    location_id: 'd4ec5e8c-f70a-11eb-8dd7-6f2c0c6a4580',
    figure_id: 'd4ec5e8d-f70a-11eb-8dd7-6f2c0c6a4580',
    type: 'buffer_zone',
    length: 224,
    width: 8,
    line_points: [
      {
        lat: 49.26831305935756,
        lng: -123.18393728922425,
      },
      {
        lat: 49.26787200987272,
        lng: -123.18092248629151,
      },
    ],
    width_unit: 'm',
    total_area: 1795,
    total_area_unit: 'ha',
    length_unit: 'm',
  },
];

export const TaskReadOnly = Template.bind({});
TaskReadOnly.args = {
  task: {
    taskType: [{
      task_translation_key: 'Task type'
    }],
    due_date: "06/21/2021T",
    locations: cropLocations,
    onwer_user_id: '1',
    notes: '',
    assignee_user_id: '1',
  },
  users: [{ user_id: '1', first_name: 'John', last_name: 'Doe' }],
  user: {
    user_id: '1',
  },
  isAdmin: true,
  managementPlansByLocationIds: [],
  onGoBack: () => { },
};
