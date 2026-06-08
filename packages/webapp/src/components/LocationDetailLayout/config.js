import {
  barnEnum,
  bufferZoneEnum,
  fenceEnum,
  fieldEnum,
  gardenEnum,
  greenhouseEnum,
  surfaceWaterEnum,
  watercourseEnum,
  waterValveEnum,
} from '../../containers/constants';
import {
  area_total_area,
  line_length,
  line_width,
  water_valve_flow_rate,
  watercourse_width,
} from '../../util/convert-units/unit';
import { getDateInputFormat } from '../../util/moment';

export const locationsSpecificFormFields = ({
  isEditLocationPage,
  isViewLocationPage,
  persistedFormData,
}) => ({
  // Areas Children
  barn: {
    sections: [
      {
        orderedInputs: [
          { labelKey: 'FARM_MAP.BARN.WASH_PACK', name: barnEnum.wash_and_pack, inputType: 'radio' },
          {
            labelKey: 'FARM_MAP.BARN.COLD_STORAGE',
            name: barnEnum.cold_storage,
            inputType: 'radio',
          },
          {
            labelKey: 'FARM_MAP.BARN.ANIMALS',
            name: barnEnum.used_for_animals,
            inputType: 'radio',
          },
        ],
      },
    ],
  },
  field: {
    sections: [
      {
        orderedInputs: [
          { labelKey: 'FIELD', enumKeys: fieldEnum, inputType: 'OrganicTypeSelector' },
        ],
      },
    ],
  },
  garden: {
    sections: [
      {
        orderedInputs: [
          { labelKey: 'GARDEN', enumKeys: gardenEnum, inputType: 'OrganicTypeSelector' },
        ],
      },
    ],
  },
  greenhouse: {
    sections: [
      {
        orderedInputs: [
          { labelKey: 'GREENHOUSE', enumKeys: greenhouseEnum, inputType: 'OrganicTypeSelector' },
        ],
      },
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.GREENHOUSE.SUPPLEMENTAL_LIGHTING',
            name: greenhouseEnum.supplemental_lighting,
            inputType: 'radio',
            hasLeaf: true,
          },
          {
            labelKey: 'FARM_MAP.GREENHOUSE.CO2_ENRICHMENT',
            name: greenhouseEnum.co2_enrichment,
            inputType: 'radio',
            hasLeaf: true,
          },
          {
            labelKey: 'FARM_MAP.GREENHOUSE.GREENHOUSE_HEATED',
            name: greenhouseEnum.greenhouse_heated,
            inputType: 'radio',
            hasLeaf: true,
          },
        ],
      },
    ],
  },
  surface_water: {
    sections: [
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.BARN.ANIMALS',
            name: surfaceWaterEnum.used_for_irrigation,
            inputType: 'radio',
          },
        ],
      },
    ],
  },
  // Lines Children
  buffer_zone: {
    sections: [
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.BUFFER_ZONE.WIDTH',
            name: bufferZoneEnum.width,
            inputType: 'UnitField',
            unitType: line_width,
            displayUnitName: bufferZoneEnum.width_unit,
            required: true,
            disabled: !isEditLocationPage,
          },
          {
            labelKey: 'FARM_MAP.AREA_DETAILS.TOTAL_AREA',
            name: bufferZoneEnum.total_area,
            inputType: 'UnitField',
            unitType: area_total_area,
            displayUnitName: bufferZoneEnum.total_area_unit,
            required: true,
            disabled: isViewLocationPage,
          },
        ],
      },
    ],
  },
  fence: {
    sections: [
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.FENCE.LENGTH',
            name: fenceEnum.length,
            inputType: 'UnitField',
            unitType: line_length,
            displayUnitName: fenceEnum.length_unit,
            required: true,
            disabled: isViewLocationPage,
          },
        ],
      },
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.FENCE.PRESSURE_TREATED',
            name: fenceEnum.pressure_treated,
            inputType: 'radio',
            hasLeaf: true,
          },
        ],
      },
    ],
  },
  watercourse: {
    sections: [
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.WATERCOURSE.LENGTH',
            name: watercourseEnum.length,
            inputType: 'UnitField',
            unitType: line_length,
            displayUnitName: watercourseEnum.length_unit,
            required: true,
            disabled: isViewLocationPage,
          },
          {
            labelKey: 'FARM_MAP.AREA_DETAILS.TOTAL_AREA',
            name: watercourseEnum.total_area,
            inputType: 'UnitField',
            unitType: area_total_area,
            displayUnitName: watercourseEnum.total_area_unit,
            required: true,
            disabled: isViewLocationPage,
          },
          {
            labelKey: 'FARM_MAP.WATERCOURSE.WIDTH',
            name: watercourseEnum.width,
            inputType: 'UnitField',
            unitType: line_width,
            displayUnitName: watercourseEnum.width_unit,
            required: true,
            disabled: !isEditLocationPage,
          },
          {
            labelKey: 'FARM_MAP.WATERCOURSE.BUFFER',
            name: watercourseEnum.buffer_width,
            inputType: 'UnitField',
            unitType: watercourse_width,
            displayUnitName: watercourseEnum.buffer_width_unit,
            required: true,
            disabled: !isEditLocationPage,
          },
        ],
      },
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.WATERCOURSE.IRRIGATION',
            name: watercourseEnum.used_for_irrigation,
            inputType: 'radio',
          },
        ],
      },
    ],
  },
  // Points Children
  soil_sample_location: {
    sections: [
      {
        orderedInputs: [
          {
            inputType: 'InputRow',
            name: 'latitude_longitude',
            rowInputs: [
              {
                labelKey: 'FARM_MAP.SOIL_SAMPLE_LOCATION.LATITUDE',
                name: 'latitude',
                disabled: true,
                value: persistedFormData?.point?.lat,
              },
              {
                labelKey: 'FARM_MAP.SOIL_SAMPLE_LOCATION.LONGITUDE',
                name: 'longitude',
                disabled: true,
                value: persistedFormData?.point?.lng,
              },
            ],
          },
        ],
      },
    ],
  },
  water_valve: {
    sections: [
      {
        orderedInputs: [
          {
            labelKey: 'FARM_MAP.WATER_VALVE.WATER_VALVE_TYPE',
            name: waterValveEnum.source,
            inputType: 'radio',
            radios: [
              {
                labelKey: 'FARM_MAP.WATER_VALVE.MUNICIPAL_WATER',
                value: 'Municipal water',
              },
              {
                labelKey: 'FARM_MAP.WATER_VALVE.SURFACE_WATER',
                value: 'Surface water',
              },
              {
                labelKey: 'FARM_MAP.WATER_VALVE.GROUNDWATER',
                value: 'Groundwater',
              },
              {
                labelKey: 'FARM_MAP.WATER_VALVE.RAIN_WATER',
                value: 'Rain water',
              },
            ],
          },
          {
            labelKey: 'FARM_MAP.WATER_VALVE.MAX_FLOW_RATE',
            name: waterValveEnum.flow_rate,
            inputType: 'UnitField',
            unitType: water_valve_flow_rate,
            displayUnitName: waterValveEnum.flow_rate_unit,
            disabled: isViewLocationPage,
          },
        ],
      },
    ],
  },
});

const getOrganicStatusDefaultValues = (persistedFormData) => {
  return {
    organic_status: 'Non-Organic',
    ...persistedFormData,
    transition_date: getDateInputFormat(persistedFormData['transition_date'] || new Date()),
  };
};

export const getAreaConfig = (persistedFormData) => ({
  barn: {
    showPerimeter: false,
    defaultValues: persistedFormData,
  },
  ceremonial_area: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
  farm_site_boundary: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
  field: {
    showPerimeter: true,
    defaultValues: getOrganicStatusDefaultValues(persistedFormData),
  },
  garden: {
    showPerimeter: true,
    defaultValues: getOrganicStatusDefaultValues(persistedFormData),
  },
  greenhouse: {
    showPerimeter: false,
    defaultValues: getOrganicStatusDefaultValues(persistedFormData),
  },
  natural_area: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
  residence: {
    showPerimeter: false,
    defaultValues: persistedFormData,
  },
  surface_water: {
    showPerimeter: true,
    defaultValues: persistedFormData,
  },
});
