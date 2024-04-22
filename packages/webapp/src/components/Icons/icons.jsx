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

// Finances Carousel
import { ReactComponent as ExpenseIcon } from '../../assets/images/finance/Expense-icn.svg';
import { ReactComponent as CropIcon } from '../../assets/images/finance/Crop-icn.svg';
import { ReactComponent as ProfitLossIcon } from '../../assets/images/finance/Profit-loss-icn.svg';

// Revenue types
import { ReactComponent as CropSaleIcon } from '../../assets/images/finance/Crop-sale-icn.svg';
import { ReactComponent as CustomTypeIcon } from '../../assets/images/finance/Custom-revenue.svg';

// Expense types
import { ReactComponent as EquipIcon } from '../../assets/images/finance/Equipment-icn.svg';
import { ReactComponent as SoilAmendmentIcon } from '../../assets/images/finance/Soil-amendment-icn.svg';
import { ReactComponent as PestIcon } from '../../assets/images/finance/Pest-icn.svg';
import { ReactComponent as FuelIcon } from '../../assets/images/finance/Fuel-icn.svg';
import { ReactComponent as MachineIcon } from '../../assets/images/finance/Machinery-icn.svg';
import { ReactComponent as SeedIcon } from '../../assets/images/finance/Seeds-icn.svg';
import { ReactComponent as OtherIcon } from '../../assets/images/finance/Custom-expense.svg';
import { ReactComponent as LandIcon } from '../../assets/images/finance/Land-icn.svg';
import { ReactComponent as MiscellaneousIcon } from '../../assets/images/finance/Miscellaneous-icn.svg';
import { ReactComponent as UtilitiesIcon } from '../../assets/images/finance/Utilities-icn.svg';
import { ReactComponent as LabourIcon } from '../../assets/images/finance/Labour-icn.svg';
import { ReactComponent as InfrastructureIcon } from '../../assets/images/finance/Infrastructure-icn.svg';
import { ReactComponent as TransportationIcon } from '../../assets/images/finance/Transportation-icn.svg';
import { ReactComponent as ServicesIcon } from '../../assets/images/finance/Services-icn.svg';

// Animal Inventory
import { ReactComponent as CattleIcon } from '../../assets/images/animals/cattle-icon.svg';
import { ReactComponent as ChickenIcon } from '../../assets/images/animals/chicken-icon.svg';
import { ReactComponent as PigIcon } from '../../assets/images/animals/pig-icon.svg';
import { ReactComponent as BatchIcon } from '../../assets/images/animals/batch.svg';
import { ReactComponent as BatchIconGreen } from '../../assets/images/animals/batch-green.svg';
import { ReactComponent as CustomAnimalIcon } from '../../assets/images/animals/custom-animal-icon.svg';
import { ReactComponent as AlpacaIcon } from '../../assets/images/animals/alpaca-icon.svg';
import { ReactComponent as GoatIcon } from '../../assets/images/animals/goat-icon.svg';
import { ReactComponent as RabbitIcon } from '../../assets/images/animals/rabbit-icon.svg';
import { ReactComponent as SheepIcon } from '../../assets/images/animals/sheep-icon.svg';

// Animal Inventory KPI
import { ReactComponent as AddAnimalIcon } from '../../assets/images/animals/add-animal.svg';
import { ReactComponent as TaskCreationIcon } from '../../assets/images/create-task.svg';
import { ReactComponent as CloneIcon } from '../../assets/images/clone.svg';
import { ReactComponent as RemoveAnimalIcon } from '../../assets/images/animals/remove-animal.svg';

// Tasks
import { ReactComponent as SoilAmendmentTask } from '../../assets/images/task/SoilAmendment.svg';

// System
import { ReactComponent as MoreHorizontalIcon } from '../../assets/images/more-horizontal.svg';
import { ReactComponent as PlusCircleIcon } from '../../assets/images/plus-circle.svg';

const iconMap = {
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
  CATTLE: CattleIcon,
  CHICKEN: ChickenIcon,
  PIG: PigIcon,
  BATCH: BatchIcon,
  BATCH_GREEN: BatchIconGreen, // svgColorFill does not work with this icon
  CUSTOM_ANIMAL: CustomAnimalIcon,
  ALPACA: AlpacaIcon,
  GOAT: GoatIcon,
  RABBIT: RabbitIcon,
  SHEEP: SheepIcon,
  // Animal Inventory KPI
  ADD_ANIMAL: AddAnimalIcon,
  TASK_CREATION: TaskCreationIcon,
  CLONE: CloneIcon,
  REMOVE_ANIMAL: RemoveAnimalIcon,
  // Tasks
  SOIL_AMENDMENT_TASK: SoilAmendmentTask,
  // System
  MORE_HORIZONTAL: MoreHorizontalIcon,
  PLUS_CIRCLE: PlusCircleIcon,
};

export default iconMap;
