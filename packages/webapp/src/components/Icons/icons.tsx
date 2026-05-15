/*
 *  Copyright 2024 LiteFarm.org
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
 *  GNU General Public License for more details, see <<https://www.gnu.org/licenses/>.>
 */

import { FunctionComponent } from 'react';

// Finances Carousel
import ExpenseIcon from '../../assets/images/finance/Expense-icn.svg?react';
import CropIcon from '../../assets/images/finance/Crop-icn.svg?react';
import ProfitLossIcon from '../../assets/images/finance/Profit-loss-icn.svg?react';

// Revenue types
import CropSaleIcon from '../../assets/images/finance/Crop-sale-icn.svg?react';
import CustomTypeIcon from '../../assets/images/finance/Custom-revenue.svg?react';

// Expense types
import EquipIcon from '../../assets/images/finance/Equipment-icn.svg?react';
import SoilAmendmentIcon from '../../assets/images/finance/Soil-amendment-icn.svg?react';
import PestIcon from '../../assets/images/finance/Pest-icn.svg?react';
import FuelIcon from '../../assets/images/finance/Fuel-icn.svg?react';
import MachineIcon from '../../assets/images/finance/Machinery-icn.svg?react';
import SeedIcon from '../../assets/images/finance/Seeds-icn.svg?react';
import OtherIcon from '../../assets/images/finance/Custom-expense.svg?react';
import LandIcon from '../../assets/images/finance/Land-icn.svg?react';
import MiscellaneousIcon from '../../assets/images/finance/Miscellaneous-icn.svg?react';
import UtilitiesIcon from '../../assets/images/finance/Utilities-icn.svg?react';
import LabourIcon from '../../assets/images/finance/Labour-icn.svg?react';
import InfrastructureIcon from '../../assets/images/finance/Infrastructure-icn.svg?react';
import TransportationIcon from '../../assets/images/finance/Transportation-icn.svg?react';
import ServicesIcon from '../../assets/images/finance/Services-icn.svg?react';

// Animal Inventory
import CattleIcon from '../../assets/images/animals/cattle-icon.svg?react';
import ChickenIcon from '../../assets/images/animals/chicken-icon.svg?react';
import PigIcon from '../../assets/images/animals/pig-icon.svg?react';
import BatchIcon from '../../assets/images/animals/batch.svg?react';
import BatchIconGreen from '../../assets/images/animals/batch-green.svg?react';
import CustomAnimalIcon from '../../assets/images/animals/custom-animal-icon.svg?react';
import AlpacaIcon from '../../assets/images/animals/alpaca-icon.svg?react';
import GoatIcon from '../../assets/images/animals/goat-icon.svg?react';
import RabbitIcon from '../../assets/images/animals/rabbit-icon.svg?react';
import SheepIcon from '../../assets/images/animals/sheep-icon.svg?react';
import LocationIcon from '../../assets/images/location.svg?react';
import RemovedAnimalIcon from '../../assets/images/animals/removed-animal-icon.svg?react';

// Animal Inventory KPI
import AddAnimalIcon from '../../assets/images/animals/add-animal.svg?react';
import TaskCreationIcon from '../../assets/images/create-task.svg?react';
import CloneIcon from '../../assets/images/clone.svg?react';
import RemoveAnimalIcon from '../../assets/images/animals/remove-animal.svg?react';

// Tasks
import SoilAmendmentTask from '../../assets/images/task/SoilAmendment.svg?react';

// System
import ExternalLinkIcon from '../../assets/images/icon_external_link.svg?react';
import MoreHorizontalIcon from '../../assets/images/more-horizontal.svg?react';
import PlusCircleIcon from '../../assets/images/plus-circle.svg?react';
import TrashIcon from '../../assets/images/animals/trash_icon_new.svg?react';
import EditIcon from '../../assets/images/edit.svg?react';
import ChevronLeft from '../../assets/images/buttons/chevron-left.svg?react';
import ClockFast from '../../assets/images/clock-fast.svg?react';
import Ruler from '../../assets/images/ruler.svg?react';

// Input
import LockedIcon from '../../assets/images/lock-03.svg?react';
import CalendarIcon from '../../assets/images/task/Calendar.svg?react';

// Devices
import SensorIcon from '../../assets/images/map/signal-01.svg?react';

// Irrigation Prescription
import Dot from '../../assets/images/dot.svg?react';

// Animal type: icon map
const animalTypeIcons = {
  CATTLE: CattleIcon,
  CHICKEN: ChickenIcon,
  PIGS: PigIcon,
  BATCH: BatchIcon,
  BATCH_GREEN: BatchIconGreen, // svgColorFill does not work with this icon
  CUSTOM_ANIMAL: CustomAnimalIcon,
  ALPACA: AlpacaIcon,
  GOAT: GoatIcon,
  RABBIT: RabbitIcon,
  SHEEP: SheepIcon,
  REMOVED_ANIMAL: RemovedAnimalIcon,
};

// Animal type: type key
export type AnimalTypeIconKey = keyof typeof animalTypeIcons;

// Animal type: typeguard
export const isAnimalTypeIconKey = (iconKey: string): iconKey is AnimalTypeIconKey => {
  return Object.keys(animalTypeIcons).includes(iconKey as AnimalTypeIconKey);
};

// Using satisfies as a constrained identity function
// Example: https://kentcdodds.com/blog/how-to-write-a-constrained-identity-function-in-typescript
// All: icon map
export const iconMap = {
  // Finances Carousel
  EXPENSE: ExpenseIcon,
  CROP: CropIcon,
  PROFIT_LOSS: ProfitLossIcon,
  // Revenue types
  CROP_SALE: CropSaleIcon,
  CUSTOM: CustomTypeIcon,
  // Expense types
  EQUIPMENT: EquipIcon,
  SOIL_AMENDMENT: SoilAmendmentIcon,
  PEST_CONTROL: PestIcon,
  FUEL: FuelIcon,
  MACHINERY: MachineIcon,
  SEEDS_AND_PLANTS: SeedIcon,
  OTHER: OtherIcon,
  LAND: LandIcon,
  MISCELLANEOUS: MiscellaneousIcon,
  UTILITIES: UtilitiesIcon,
  LABOUR: LabourIcon,
  INFRASTRUCTURE: InfrastructureIcon,
  TRANSPORTATION: TransportationIcon,
  SERVICES: ServicesIcon,
  // Animal Inventory
  ...animalTypeIcons,
  // Animal Inventory KPI
  ADD_ANIMAL: AddAnimalIcon,
  TASK_CREATION: TaskCreationIcon,
  CLONE: CloneIcon,
  REMOVE_ANIMAL: RemoveAnimalIcon,
  // Tasks
  SOIL_AMENDMENT_TASK: SoilAmendmentTask,
  // System
  EXTERNAL_LINK: ExternalLinkIcon,
  MORE_HORIZONTAL: MoreHorizontalIcon,
  PLUS_CIRCLE: PlusCircleIcon,
  TRASH: TrashIcon,
  EDIT: EditIcon,
  CHEVRON_LEFT: ChevronLeft,
  RULER: Ruler,
  CLOCK_FAST: ClockFast,
  // Input
  LOCKED: LockedIcon,
  CALENDAR: CalendarIcon,

  LOCATION: LocationIcon,

  SENSOR: SensorIcon,

  DOT: Dot,
} satisfies Record<string, FunctionComponent>;

// All: type key
export type IconName = keyof typeof iconMap;

export default iconMap;
