import { locationEnum } from '../../../containers/Map/constants';
import Gate from '../../../assets/images/farmMapFilter/Gate.svg';
import WaterValve from '../../../assets/images/farmMapFilter/WaterValve.svg';
import Sensor from '../../../assets/images/farmMapFilter/Sensor.svg';
import BufferZone from '../../../assets/images/farmMapFilter/BufferZone.svg';
import Watercourse from '../../../assets/images/farmMapFilter/Creek.svg';
import Fence from '../../../assets/images/farmMapFilter/Fence.svg';
import Barn from '../../../assets/images/farmMapFilter/Barn.svg';
import CeremonialArea from '../../../assets/images/farmMapFilter/CA.svg';
import FarmSiteBoundary from '../../../assets/images/farmMapFilter/FSB.svg';
import Field from '../../../assets/images/farmMapFilter/Field.svg';
import Garden from '../../../assets/images/farmMapFilter/Garden.svg';
import Greenhouse from '../../../assets/images/farmMapFilter/Greenhouse.svg';
import SurfaceWater from '../../../assets/images/farmMapFilter/SurfaceWater.svg';
import NaturalArea from '../../../assets/images/farmMapFilter/NA.svg';
import Residence from '../../../assets/images/farmMapFilter/Residence.svg';

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
