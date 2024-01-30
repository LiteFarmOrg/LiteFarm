import { locationEnum } from '../../../containers/Map/constants';
import Gate from '../../../assets/images/farmMapFilter/Gate.svg?react';
import WaterValve from '../../../assets/images/farmMapFilter/WaterValve.svg?react';
import Sensor from '../../../assets/images/farmMapFilter/Sensor.svg?react';
import BufferZone from '../../../assets/images/farmMapFilter/BufferZone.svg?react';
import Watercourse from '../../../assets/images/farmMapFilter/Creek.svg?react';
import Fence from '../../../assets/images/farmMapFilter/Fence.svg?react';
import Barn from '../../../assets/images/farmMapFilter/Barn.svg?react';
import CeremonialArea from '../../../assets/images/farmMapFilter/CA.svg?react';
import FarmSiteBoundary from '../../../assets/images/farmMapFilter/FSB.svg?react';
import Field from '../../../assets/images/farmMapFilter/Field.svg?react';
import Garden from '../../../assets/images/farmMapFilter/Garden.svg?react';
import Greenhouse from '../../../assets/images/farmMapFilter/Greenhouse.svg?react';
import SurfaceWater from '../../../assets/images/farmMapFilter/SurfaceWater.svg?react';
import NaturalArea from '../../../assets/images/farmMapFilter/NA.svg?react';
import Residence from '../../../assets/images/farmMapFilter/Residence.svg?react';

export const pointImgDict = [
  {
    icon: <Gate />,
    key: locationEnum.gate,
  },
  {
    icon: <WaterValve />,
    key: locationEnum.water_valve,
  },
  {
    icon: <Sensor />,
    key: locationEnum.sensor,
  },
];

export const lineImgDict = [
  {
    icon: <BufferZone />,
    key: locationEnum.buffer_zone,
  },
  {
    icon: <Watercourse />,
    key: locationEnum.watercourse,
  },
  {
    icon: <Fence />,
    key: locationEnum.fence,
  },
];

export const areaImgDict = [
  {
    icon: <Barn />,
    key: locationEnum.barn,
  },
  {
    icon: <CeremonialArea />,
    key: locationEnum.ceremonial_area,
  },
  {
    icon: <FarmSiteBoundary />,
    key: locationEnum.farm_site_boundary,
  },
  {
    icon: <Field />,
    key: locationEnum.field,
  },
  {
    icon: <Garden />,
    key: locationEnum.garden,
  },
  {
    icon: <Greenhouse />,
    key: locationEnum.greenhouse,
  },
  {
    icon: <SurfaceWater />,
    key: locationEnum.surface_water,
  },
  {
    icon: <NaturalArea />,
    key: locationEnum.natural_area,
  },
  {
    icon: <Residence />,
    key: locationEnum.residence,
  },
];

export const locationImgMap = {
  [locationEnum.gate]: <Gate />,
  [locationEnum.water_valve]: <WaterValve />,
  [locationEnum.sensor]: <Sensor />,
  [locationEnum.barn]: <Barn />,
  [locationEnum.ceremonial_area]: <CeremonialArea />,
  [locationEnum.farm_site_boundary]: <FarmSiteBoundary />,
  [locationEnum.field]: <Field />,
  [locationEnum.garden]: <Garden />,
  [locationEnum.greenhouse]: <Greenhouse />,
  [locationEnum.surface_water]: <SurfaceWater />,
  [locationEnum.natural_area]: <NaturalArea />,
  [locationEnum.residence]: <Residence />,
  [locationEnum.buffer_zone]: <BufferZone />,
  [locationEnum.watercourse]: <Watercourse />,
  [locationEnum.fence]: <Fence />,
};
