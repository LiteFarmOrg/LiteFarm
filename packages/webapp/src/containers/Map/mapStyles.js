import {
  barnColour,
  barnSelectedColour,
  bufferZoneColour,
  bufferZoneSelectedColour,
  ceremonialSiteColour,
  ceremonialSiteSelectedColour,
  farmBoundColour,
  farmBoundHoverColour,
  fenceColour,
  fieldColour,
  fieldSelectedColour,
  gardenColour,
  gardenSelectedColour,
  greenhouseColour,
  greenhouseSelectedColour,
  irrigationZoneColour,
  naturalAreaColour,
  naturalAreaSelectedColour,
  pivotColour,
  pivotArmColour,
  residenceColour,
  residenceSelectedColour,
  surfaceWaterColour,
  surfaceWaterSelectedColour,
  watercourseColour,
  watercourseSelectedColour,
  pivotCenterLabel,
  pivotSectorLabel,
} from './styles.module.scss';
import waterValve from '../../assets/images/map/water-valve.svg?react';
import waterValveHover from '../../assets/images/map/water-valve-hover.svg?react';
import waterValveActive from '../../assets/images/map/water-valve-active.svg?react';
import gate from '../../assets/images/map/gate.svg?react';
import gateHover from '../../assets/images/map/gate-hover.svg?react';
import gateActive from '../../assets/images/map/gate-active.svg?react';
import soilSampleLocation from '../../assets/images/map/soil-sample-location.svg?react';
import soilSampleLocationHover from '../../assets/images/map/soil-sample-location-hover.svg?react';
import soilSampleLocationActive from '../../assets/images/map/soil-sample-location-active.svg?react';
import sensor from '../../assets/images/map/sensor.svg?react';
import sensorHover from '../../assets/images/map/sensor-hover.svg?react';
import sensorActive from '../../assets/images/map/sensor-active.svg?react';
import sensorArray from '../../assets/images/map/sensor-array.svg?react';
import sensorArrayHover from '../../assets/images/map/sensor-array-hover.svg?react';
import sensorArrayActive from '../../assets/images/map/sensor-array-active.svg?react';

export const areaStyles = {
  barn: {
    colour: barnColour,
    selectedColour: barnSelectedColour,
    dashScale: 2,
    dashLength: '14px',
  },
  ceremonial_area: {
    colour: ceremonialSiteColour,
    selectedColour: ceremonialSiteSelectedColour,
    dashScale: 1.5,
    dashLength: '8px',
  },
  farm_site_boundary: {
    colour: farmBoundColour,
    hoverColour: farmBoundHoverColour,
    // selectedColour: farmBoundSelectedColour,
    dashScale: 1,
    dashLength: '1px',
  },
  field: {
    colour: fieldColour,
    selectedColour: fieldSelectedColour,
    dashScale: 1,
    dashLength: '6px',
  },
  garden: {
    colour: gardenColour,
    selectedColour: gardenSelectedColour,
    dashScale: 1,
    dashLength: '6px',
  },
  greenhouse: {
    colour: greenhouseColour,
    selectedColour: greenhouseSelectedColour,
    dashScale: 1,
    dashLength: '8px',
  },
  surface_water: {
    colour: surfaceWaterColour,
    selectedColour: naturalAreaSelectedColour,
    dashScale: 0.7,
    dashLength: '6px',
  },
  natural_area: {
    colour: naturalAreaColour,
    selectedColour: residenceSelectedColour,
    dashScale: 0.7,
    dashLength: '12px',
  },
  residence: {
    colour: residenceColour,
    selectedColour: surfaceWaterSelectedColour,
    dashScale: 0,
    dashLength: '12px',
  },
  irrigation_zone: {
    colour: irrigationZoneColour,
    selectedColour: irrigationZoneColour,
    dashScale: 0,
    dashLength: 0,
  },
  pivot_sector: {
    colour: pivotColour,
    strokeColour: pivotArmColour,
    fillColour: pivotColour,
    markerColour: pivotArmColour,
    dashScale: 0,
    dashLength: 0,
    labelClass: pivotSectorLabel,
    fontSize: '10px',
  },
};

export const circleStyles = {
  pivot: {
    strokeColour: pivotArmColour,
    fillColour: pivotColour,
    selectedColour: pivotColour,
    markerColour: pivotArmColour,
    circleLabel: pivotCenterLabel,
  },
};

export const lineStyles = {
  watercourse: {
    colour: watercourseColour,
    selectedColour: watercourseSelectedColour,
    dashScale: 0.7,
    dashLength: '6px',
    polyStyles: {
      strokeColor: watercourseColour,
      strokeWeight: 2,
      fillColor: watercourseColour,
      fillOpacity: 0.3,
    },
  },
  farm_site_boundary: {
    colour: farmBoundColour,
    hoverColour: farmBoundHoverColour,
    dashScale: 1,
    dashLength: '1px',
    polyStyles: {
      strokeColor: 'transparent',
      strokeWeight: 1,
      fillColor: 'transparent',
      fillOpacity: 0.3,
    },
  },
  fence: {
    colour: fenceColour,
    dashScale: 0.7,
    dashLength: '6px',
    polyStyles: {
      strokeColor: 'transparent',
      strokeWeight: 1,
      fillColor: 'transparent',
      fillOpacity: 0.3,
    },
  },
  buffer_zone: {
    colour: bufferZoneColour,
    selectedColour: bufferZoneSelectedColour,
    dashScale: 0.7,
    dashLength: '6px',
    polyStyles: {
      strokeColor: bufferZoneColour,
      strokeWeight: 2,
      fillColor: bufferZoneColour,
      fillOpacity: 0.3,
    },
  },
  pivot_arm: {
    colour: pivotArmColour,
    selectedColour: pivotArmColour,
    dashScale: 2,
    dashLength: '6px',
    defaultDashColour: 'transparent',
    polyStyles: {
      strokeColor: 'transparent',
      strokeWeight: 0,
      fillColor: 'transparent',
      fillOpacity: 0,
    },
  },
};

export const icons = {
  gate: gate,
  water_valve: waterValve,
  soil_sample_location: soilSampleLocation,
  sensor: sensor,
  sensor_array: sensorArray,
};
export const hoverIcons = {
  gate: gateHover,
  water_valve: waterValveHover,
  soil_sample_location: soilSampleLocationHover,
  sensor: sensorHover,
  sensor_array: sensorArrayHover,
};
export const activeIcons = {
  gate: gateActive,
  water_valve: waterValveActive,
  soil_sample_location: soilSampleLocationActive,
  sensor: sensorActive,
  sensor_array: sensorArrayActive,
};
export const selectedIcons = {
  gate: gateActive,
  water_valve: waterValveActive,
  soil_sample_location: soilSampleLocationActive,
  sensor: sensorActive,
  sensor_array: sensorArrayActive,
};
