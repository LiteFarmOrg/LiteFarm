import {
  primaryColour,
  defaultColour,
  barnColour,
  ceremonialSiteColour,
  farmBoundColour,
  fieldColour,
  greenhouseColour,
  groundwaterColour,
  naturalAreaColour,
  residenceColour,
  creekColour,
  fenceColour,
} from './styles.module.scss';
import { ENVIRONMENT } from './constants'

export const areaStyles = {
  'barn': {
    colour: barnColour,
    dashScale: 2,
    dashLength: '14px',
  },
  'ceremonial_area': {
    colour: ceremonialSiteColour,
    dashScale: 1.5,
    dashLength: '8px',
  },
  'farm_bound': {
    colour: farmBoundColour,
    dashScale: 1,
    dashLength: '1px',
  },
  'field': {
    colour: fieldColour,
    dashScale: 1,
    dashLength: '6px',
  },
  'greenhouse': {
    colour: greenhouseColour,
    dashScale: 1,
    dashLength: '8px',
  },
  'ground_water': {
    colour: groundwaterColour,
    dashScale: 0.7,
    dashLength: '6px',
  },
  'natural_area': {
    colour: naturalAreaColour,
    dashScale: 0.7,
    dashLength: '12px',
  },
  'residence': {
    colour: residenceColour,
    dashScale: 0,
    dashLength: '12px',
  },
}

export const lineStyles = {
  'creek': {
    colour: creekColour,
    dashScale: 0.7,
    dashLength: '6px',
  },
  'fence': {
    colour: fenceColour,
    dashScale: 1,
    dashLength: '6px',
  },
}

const assetUrlDict = {
  development: 'http://localhost:3000',
  integration: 'http://beta.litefarm.org',
  production: 'http://app.litefarm.org'
}
const assetURL = assetUrlDict[ENVIRONMENT];
export const icons = {
  'gate': `${assetURL}/gate.png`,
  'water_valve': `${assetURL}/water-valve.png`,
}
export const hoverIcons = {
  'gate': `${assetURL}/gate-hover.png`,
  'water_valve': `${assetURL}/water-valve-hover.png`,
}
