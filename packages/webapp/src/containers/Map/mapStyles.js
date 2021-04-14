import {
  barnColour,
  bufferZoneColour,
  ceremonialSiteColour,
  farmBoundColour,
  farmBoundHoverColour,
  fenceColour,
  fieldColour,
  gardenColour,
  greenhouseColour,
  naturalAreaColour,
  residenceColour,
  surfaceWaterColour,
  watercourseColour,
} from './styles.module.scss';
import waterValve from '../../assets/images/map/water-valve.png';
import waterValveHover from '../../assets/images/map/water-valve-hover.png';
import gate from '../../assets/images/map/gate.png';
import gateHover from '../../assets/images/map/gate-hover.png';

export const areaStyles = {
  barn: {
    colour: barnColour,
    dashScale: 2,
    dashLength: '14px',
  },
  ceremonial_area: {
    colour: ceremonialSiteColour,
    dashScale: 1.5,
    dashLength: '8px',
  },
  farm_site_boundary: {
    colour: farmBoundColour,
    hoverColour: farmBoundHoverColour,
    dashScale: 1,
    dashLength: '1px',
  },
  field: {
    colour: fieldColour,
    dashScale: 1,
    dashLength: '6px',
  },
  garden: {
    colour: gardenColour,
    dashScale: 1,
    dashLength: '6px',
  },
  greenhouse: {
    colour: greenhouseColour,
    dashScale: 1,
    dashLength: '8px',
  },
  surface_water: {
    colour: surfaceWaterColour,
    dashScale: 0.7,
    dashLength: '6px',
  },
  natural_area: {
    colour: naturalAreaColour,
    dashScale: 0.7,
    dashLength: '12px',
  },
  residence: {
    colour: residenceColour,
    dashScale: 0,
    dashLength: '12px',
  },
};

export const lineStyles = {
  watercourse: {
    colour: watercourseColour,
    dashScale: 0.7,
    dashLength: '6px',
    polyStyles: {
      strokeColor: watercourseColour,
      strokeWeight: 2,
      fillColor: watercourseColour,
      fillOpacity: 0.3,
    },
  },
  fence: {
    colour: fenceColour,
    dashScale: 0.7,
    dashLength: '6px',
  },
  buffer_zone: {
    colour: bufferZoneColour,
    dashScale: 0.7,
    dashLength: '6px',
    polyStyles: {
      strokeColor: bufferZoneColour,
      strokeWeight: 2,
      fillColor: bufferZoneColour,
      fillOpacity: 0.3,
    },
  },
};

export const icons = {
  gate: gate,
  water_valve: waterValve,
};
export const hoverIcons = {
  gate: gateHover,
  water_valve: waterValveHover,
};
