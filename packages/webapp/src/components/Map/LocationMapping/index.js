import { locationEnum } from '../../../containers/Map/constants';
import { ReactComponent as Gate } from '../../../assets/images/farmMapFilter/Gate.svg';
import { ReactComponent as WaterValve } from '../../../assets/images/farmMapFilter/WaterValve.svg';
import { ReactComponent as BufferZone } from '../../../assets/images/farmMapFilter/BufferZone.svg';
import { ReactComponent as Watercourse } from '../../../assets/images/farmMapFilter/Creek.svg';
import { ReactComponent as Fence } from '../../../assets/images/farmMapFilter/Fence.svg';
import { ReactComponent as Barn } from '../../../assets/images/farmMapFilter/Barn.svg';
import { ReactComponent as CeremonialArea } from '../../../assets/images/farmMapFilter/CA.svg';
import { ReactComponent as FarmSiteBoundary } from '../../../assets/images/farmMapFilter/FSB.svg';
import { ReactComponent as Field } from '../../../assets/images/farmMapFilter/Field.svg';
import { ReactComponent as Garden } from '../../../assets/images/farmMapFilter/Garden.svg';
import { ReactComponent as Greenhouse } from '../../../assets/images/farmMapFilter/Greenhouse.svg';
import { ReactComponent as SurfaceWater } from '../../../assets/images/farmMapFilter/SurfaceWater.svg';
import { ReactComponent as NaturalArea } from '../../../assets/images/farmMapFilter/NA.svg';
import { ReactComponent as Residence } from '../../../assets/images/farmMapFilter/Residence.svg';

export const pointImgDict = [
  {
    icon: <Gate />,
    key: locationEnum.gate,
  },
  {
    icon: <WaterValve />,
    key: locationEnum.water_valve,
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
