/*
 *  Copyright 2026 LiteFarm.org
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

import decorator from '../config/Decorators';
import { chromaticSmallScreen } from '../config/chromatic';
import PureLocationFormWrapper from '../../../components/LocationDetailLayout/PureLocationFormWrapper';
import { InternalMapLocationType } from '../../../store/api/types';
import { Provider } from 'react-redux';
import { fakeDBLocation } from './util';
import { pick } from '../../../util/pick';
import { areaProperties, lineProperties, pointProperties } from '../../../containers/constants';
import state from '../../../../.storybook/state';

const config = {
  // areas
  [InternalMapLocationType.BARN]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.BARN), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.BARN),
  },
  [InternalMapLocationType.CEREMONIAL_AREA]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.CEREMONIAL_AREA), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.CEREMONIAL_AREA),
  },
  [InternalMapLocationType.FARM_SITE_BOUNDARY]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.FARM_SITE_BOUNDARY), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.FARM_SITE_BOUNDARY),
  },
  [InternalMapLocationType.FIELD]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.FIELD), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.FIELD),
  },
  [InternalMapLocationType.GARDEN]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.GARDEN), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.GARDEN),
  },
  [InternalMapLocationType.GREENHOUSE]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.GREENHOUSE), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.GREENHOUSE),
  },
  [InternalMapLocationType.NATURAL_AREA]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.NATURAL_AREA), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.NATURAL_AREA),
  },
  [InternalMapLocationType.RESIDENCE]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.RESIDENCE), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.RESIDENCE),
  },
  [InternalMapLocationType.SURFACE_WATER]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.SURFACE_WATER), [
      'name',
      ...areaProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.SURFACE_WATER),
  },
  // lines
  [InternalMapLocationType.BUFFER_ZONE]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.BUFFER_ZONE), [
      'name',
      ...lineProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.BUFFER_ZONE),
  },
  [InternalMapLocationType.FENCE]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.FENCE), [
      'name',
      ...lineProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.FENCE),
  },
  [InternalMapLocationType.WATERCOURSE]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.WATERCOURSE), [
      'name',
      ...lineProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.WATERCOURSE),
  },
  // points
  [InternalMapLocationType.GATE]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.GATE), [
      'name',
      ...pointProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.GATE),
  },
  [InternalMapLocationType.SOIL_SAMPLE_LOCATION]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.SOIL_SAMPLE_LOCATION), [
      'name',
      ...pointProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.SOIL_SAMPLE_LOCATION),
  },
  [InternalMapLocationType.WATER_VALVE]: {
    persistedFormData: pick(fakeDBLocation(InternalMapLocationType.WATER_VALVE), [
      'name',
      ...pointProperties,
    ]),
    locationAPIData: fakeDBLocation(InternalMapLocationType.WATER_VALVE),
  },
};

const getStore = (locationType) => ({
  getState: () => {
    return {
      api: {
        queries: {
          // Key format: 'endpointName(serializedArgs)' — check your actual hook call
          // e.g. if called as useGetLocationsQuery() it's 'getLocations(undefined)'
          // e.g. if called as useGetLocationsQuery({farm_id:'1'}) it's 'getLocations({"farm_id":"1"})'
          'getLocations(undefined)': {
            status: 'fulfilled',
            endpointName: 'getLocations',
            requestId: 'PDUb54BP0uiv3UrAsO-kD',
            startedTimeStamp: 1774388379804,
            data: [{ ...config[locationType].locationAPIData }],
            fulfilledTimeStamp: 1774388380476,
            isUninitialized: false,
            isLoading: false,
            isSuccess: true,
            isError: false,
            originalArgs: undefined,
            requestStatus: 'fulfilled',
          },
        },
        mutations: {},
        provided: {},
        subscriptions: {},
        config: {
          online: true,
          focused: true,
          middlewareRegistered: true,
          refetchOnFocus: false,
          refetchOnReconnect: false,
          refetchOnMountOrArgChange: false,
          keepUnusedDataFor: 60,
          reducerPath: 'api',
        },
      },
      ...state,
    };
  },
  subscribe: () => () => {},
  dispatch: () => {},
});

export default {
  title: 'Form/Location/LocationFormWrappers',
  decorators: decorator,
  component: PureLocationFormWrapper,
};

const Template = (args) => <PureLocationFormWrapper {...args} />;

const createStoryArgs = (locationType, mode) => {
  const base = {
    system: 'metric',
    isAdmin: true,
    history: () => {},
    submitForm: (data) => {},
    locationType,
    persistedFormData: config[locationType].persistedFormData,
  };

  const location_id = config[locationType].locationAPIData.location_id;

  if (mode === 'post') {
    return {
      ...base,
      isCreateLocationPage: true,
      areaType: locationType,
      match: { params: {} },
    };
  }
  if (mode === 'view') {
    return {
      ...base,
      isViewLocationPage: true,
      match: { params: { location_id } },
      history: { location: { pathname: `/${locationType.toLowerCase()}/${location_id}/details` } },
    };
  }
  if (mode === 'workerView') {
    return {
      ...base,
      isViewLocationPage: true,
      match: { params: { location_id } },
      history: { location: { pathname: `/${locationType.toLowerCase()}/${location_id}/details` } },
      isAdmin: false,
    };
  }
  if (mode === 'edit') {
    return {
      ...base,
      isEditLocationPage: true,
      match: { params: { location_id } },
    };
  }
};

const createStory = (locationType, mode) => ({
  render: () => (
    <Provider store={getStore(locationType)}>
      <Template {...createStoryArgs(locationType, mode)} />
    </Provider>
  ),
  parameters: { ...chromaticSmallScreen },
});

// Areas
export const BarnPost = createStory(InternalMapLocationType.BARN, 'post');
export const BarnView = createStory(InternalMapLocationType.BARN, 'view');
export const BarnWorkerView = createStory(InternalMapLocationType.BARN, 'workerView');
export const BarnEdit = createStory(InternalMapLocationType.BARN, 'edit');

export const CeremonialAreaPost = createStory(InternalMapLocationType.CEREMONIAL_AREA, 'post');
export const CeremonialAreaView = createStory(InternalMapLocationType.CEREMONIAL_AREA, 'view');
export const CeremonialAreaWorkerView = createStory(
  InternalMapLocationType.CEREMONIAL_AREA,
  'workerView',
);
export const CeremonialAreaEdit = createStory(InternalMapLocationType.CEREMONIAL_AREA, 'edit');

export const FarmSiteBoundaryPost = createStory(InternalMapLocationType.FARM_SITE_BOUNDARY, 'post');
export const FarmSiteBoundaryView = createStory(InternalMapLocationType.FARM_SITE_BOUNDARY, 'view');
export const FarmSiteBoundaryWorkerView = createStory(
  InternalMapLocationType.FARM_SITE_BOUNDARY,
  'workerView',
);
export const FarmSiteBoundaryEdit = createStory(InternalMapLocationType.FARM_SITE_BOUNDARY, 'edit');

export const FieldPost = createStory(InternalMapLocationType.FIELD, 'post');
export const FieldView = createStory(InternalMapLocationType.FIELD, 'view');
export const FieldWorkerView = createStory(InternalMapLocationType.FIELD, 'workerView');
export const FieldEdit = createStory(InternalMapLocationType.FIELD, 'edit');

export const GardenPost = createStory(InternalMapLocationType.GARDEN, 'post');
export const GardenView = createStory(InternalMapLocationType.GARDEN, 'view');
export const GardenWorkerView = createStory(InternalMapLocationType.GARDEN, 'workerView');
export const GardenEdit = createStory(InternalMapLocationType.GARDEN, 'edit');

export const GreenhousePost = createStory(InternalMapLocationType.GREENHOUSE, 'post');
export const GreenhouseView = createStory(InternalMapLocationType.GREENHOUSE, 'view');
export const GreenhouseWorkerView = createStory(InternalMapLocationType.GREENHOUSE, 'workerView');
export const GreenhouseEdit = createStory(InternalMapLocationType.GREENHOUSE, 'edit');

export const NaturalAreaPost = createStory(InternalMapLocationType.NATURAL_AREA, 'post');
export const NaturalAreaView = createStory(InternalMapLocationType.NATURAL_AREA, 'view');
export const NaturalAreaWorkerView = createStory(
  InternalMapLocationType.NATURAL_AREA,
  'workerView',
);
export const NaturalAreaEdit = createStory(InternalMapLocationType.NATURAL_AREA, 'edit');

export const ResidencePost = createStory(InternalMapLocationType.RESIDENCE, 'post');
export const ResidenceView = createStory(InternalMapLocationType.RESIDENCE, 'view');
export const ResidenceWorkerView = createStory(InternalMapLocationType.RESIDENCE, 'workerView');
export const ResidenceEdit = createStory(InternalMapLocationType.RESIDENCE, 'edit');

export const SurfaceWaterPost = createStory(InternalMapLocationType.SURFACE_WATER, 'post');
export const SurfaceWaterView = createStory(InternalMapLocationType.SURFACE_WATER, 'view');
export const SurfaceWaterWorkerView = createStory(
  InternalMapLocationType.SURFACE_WATER,
  'workerView',
);
export const SurfaceWaterEdit = createStory(InternalMapLocationType.SURFACE_WATER, 'edit');

// Lines
export const BufferZonePost = createStory(InternalMapLocationType.BUFFER_ZONE, 'post');
export const BufferZoneView = createStory(InternalMapLocationType.BUFFER_ZONE, 'view');
export const BufferZoneWorkerView = createStory(InternalMapLocationType.BUFFER_ZONE, 'workerView');
export const BufferZoneEdit = createStory(InternalMapLocationType.BUFFER_ZONE, 'edit');

export const FencePost = createStory(InternalMapLocationType.FENCE, 'post');
export const FenceView = createStory(InternalMapLocationType.FENCE, 'view');
export const FenceWorkerView = createStory(InternalMapLocationType.FENCE, 'workerView');
export const FenceEdit = createStory(InternalMapLocationType.FENCE, 'edit');

export const WatercoursePost = createStory(InternalMapLocationType.WATERCOURSE, 'post');
export const WatercourseView = createStory(InternalMapLocationType.WATERCOURSE, 'view');
export const WatercourseWorkerView = createStory(InternalMapLocationType.WATERCOURSE, 'workerView');
export const WatercourseEdit = createStory(InternalMapLocationType.WATERCOURSE, 'edit');

// Points
export const GatePost = createStory(InternalMapLocationType.GATE, 'post');
export const GateView = createStory(InternalMapLocationType.GATE, 'view');
export const GateWorkerView = createStory(InternalMapLocationType.GATE, 'workerView');
export const GateEdit = createStory(InternalMapLocationType.GATE, 'edit');

export const SoilSampleLocationPost = createStory(
  InternalMapLocationType.SOIL_SAMPLE_LOCATION,
  'post',
);
export const SoilSampleLocationView = createStory(
  InternalMapLocationType.SOIL_SAMPLE_LOCATION,
  'view',
);
export const SoilSampleLocationWorkerView = createStory(
  InternalMapLocationType.SOIL_SAMPLE_LOCATION,
  'workerView',
);
export const SoilSampleLocationEdit = createStory(
  InternalMapLocationType.SOIL_SAMPLE_LOCATION,
  'edit',
);

export const WaterValvePost = createStory(InternalMapLocationType.WATER_VALVE, 'post');
export const WaterValveView = createStory(InternalMapLocationType.WATER_VALVE, 'view');
export const WaterValveWorkerView = createStory(InternalMapLocationType.WATER_VALVE, 'workerView');
export const WaterValveEdit = createStory(InternalMapLocationType.WATER_VALVE, 'edit');
