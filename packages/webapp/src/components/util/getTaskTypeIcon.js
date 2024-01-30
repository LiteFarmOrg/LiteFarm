import CustomIcon from '../../assets/images/task/Custom.svg?react';
import RecordSoilSample from '../../assets/images/task/RecordSoilSample.svg?react';
import Sales from '../../assets/images/task/Sales.svg?react';
import Scout from '../../assets/images/task/Scout.svg?react';
import WashAndPack from '../../assets/images/task/WashAndPack.svg?react';
import Transplant from '../../assets/images/task/Transplant.svg?react';
import Harvest from '../../assets/images/task/Harvest.svg?react';
import PestControl from '../../assets/images/task/PestControl.svg?react';
import Irrigate from '../../assets/images/task/Irrigate.svg?react';
import Transport from '../../assets/images/task/Transport.svg?react';
import FieldWork from '../../assets/images/task/FieldWork.svg?react';
import Plant from '../../assets/images/task/Plant.svg?react';
import SocialEvent from '../../assets/images/task/SocialEvent.svg?react';
import Clean from '../../assets/images/task/Clean.svg?react';
import SoilAmendment from '../../assets/images/task/SoilAmendment.svg?react';

/**
 * Provides the appropriate icon for a specified task type.
 * @param {string} key - A translation key that specifies a task type.
 * @returns {ReactComponent | undefined} The icon for the specified task type.
 */
export default function getTaskTypeIcon(key) {
  const iconDict = {
    CLEANING_TASK: Clean, // for release
    HARVEST_TASK: Harvest, // for release
    PEST_CONTROL_TASK: PestControl, // for release
    PLANT_TASK: Plant, // for release
    FIELD_WORK_TASK: FieldWork, // for release
    TRANSPLANT_TASK: Transplant, // for release
    SOIL_AMENDMENT_TASK: SoilAmendment, // for release
    BED_PREPARATION_TASK: CustomIcon,
    SALE_TASK: Sales,
    FERTILIZING: SoilAmendment, // soil amendment replaces fertilizing
    SCOUTING_TASK: Scout,
    WASH_AND_PACK_TASK: WashAndPack,
    OTHER_TASK: CustomIcon,
    BREAK_TASK: CustomIcon,
    SOIL_TASK: RecordSoilSample,
    IRRIGATION_TASK: Irrigate,
    TRANSPORT_TASK: Transport,
    SOCIAL_TASK: SocialEvent,
    CUSTOM_TASK: CustomIcon,
  };

  return iconDict[key] || CustomIcon;
}
