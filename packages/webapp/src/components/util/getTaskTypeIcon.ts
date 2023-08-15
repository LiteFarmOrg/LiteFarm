import React from 'react';
import { ReactComponent as CustomIcon } from '../../assets/images/task/Custom.svg';
import { ReactComponent as RecordSoilSample } from '../../assets/images/task/RecordSoilSample.svg';
import { ReactComponent as Sales } from '../../assets/images/task/Sales.svg';
import { ReactComponent as Scout } from '../../assets/images/task/Scout.svg';
import { ReactComponent as WashAndPack } from '../../assets/images/task/WashAndPack.svg';
import { ReactComponent as Transplant } from '../../assets/images/task/Transplant.svg';
import { ReactComponent as Harvest } from '../../assets/images/task/Harvest.svg';
import { ReactComponent as PestControl } from '../../assets/images/task/PestControl.svg';
import { ReactComponent as Irrigate } from '../../assets/images/task/Irrigate.svg';
import { ReactComponent as Transport } from '../../assets/images/task/Transport.svg';
import { ReactComponent as FieldWork } from '../../assets/images/task/FieldWork.svg';
import { ReactComponent as Plant } from '../../assets/images/task/Plant.svg';
import { ReactComponent as SocialEvent } from '../../assets/images/task/SocialEvent.svg';
import { ReactComponent as Clean } from '../../assets/images/task/Clean.svg';
import { ReactComponent as SoilAmendment } from '../../assets/images/task/SoilAmendment.svg';

const iconDict: { [index: string]: React.FunctionComponent } = {
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
} as const;

export default function getTaskTypeIcon(
  taskTypeTranslationKey: string,
): React.FunctionComponent<React.ComponentProps<'svg'> & { title?: string }> {
  return iconDict[taskTypeTranslationKey] || CustomIcon;
}
