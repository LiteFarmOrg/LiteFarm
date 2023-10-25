/*
 *  Copyright 2023 LiteFarm.org
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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */
import { ReactComponent as CropSaleIcon } from '../../../../assets/images/finance/transaction/Crop-sale-icn.svg';
import { ReactComponent as CustomTypeIcon } from '../../../../assets/images/finance/transaction/Custom-revenue.svg';
import { ReactComponent as EquipIcon } from '../../../../assets/images/finance/transaction/Equipment-icn.svg';
import { ReactComponent as SoilAmendmentIcon } from '../../../../assets/images/finance/transaction/Soil-amendment-icn.svg';
import { ReactComponent as PestIcon } from '../../../../assets/images/finance/transaction/Pest-icn.svg';
import { ReactComponent as FuelIcon } from '../../../../assets/images/finance/transaction/Fuel-icn.svg';
import { ReactComponent as MachineIcon } from '../../../../assets/images/finance/transaction/Machinery-icn.svg';
import { ReactComponent as SeedIcon } from '../../../../assets/images/finance/transaction/Seeds-icn.svg';
import { ReactComponent as OtherIcon } from '../../../../assets/images/finance/transaction/Custom-expense.svg';
import { ReactComponent as LandIcon } from '../../../../assets/images/finance/transaction/Land-icn.svg';
import { ReactComponent as MiscellaneousIcon } from '../../../../assets/images/finance/transaction/Miscellaneous-icn.svg';
import { ReactComponent as UtilitiesIcon } from '../../../../assets/images/finance/transaction/Utilities-icn.svg';
import { ReactComponent as LabourIcon } from '../../../../assets/images/finance/transaction/Labour-icn.svg';
import { ReactComponent as InfrastructureIcon } from '../../../../assets/images/finance/transaction/Infrastructure-icn.svg';
import { ReactComponent as TransportationIcon } from '../../../../assets/images/finance/transaction/Transportation-icn.svg';
import { ReactComponent as ServicesIcon } from '../../../../assets/images/finance/transaction/Services-icn.svg';
import { formatAmount } from '../../../../containers/Finances/util';
import commonStyles from '../styles.module.scss';
import styles from './styles.module.scss';

const revenueTypeIcons = {
  CROP_SALE: <CropSaleIcon />,
  CUSTOM: <CustomTypeIcon />,
};

const expenseTypeIcons = {
  EQUIPMENT: <EquipIcon />,
  SOIL_AMENDMENT: <SoilAmendmentIcon />,
  PEST_CONTROL: <PestIcon />,
  FUEL: <FuelIcon />,
  MACHINERY: <MachineIcon />,
  SEEDS_AND_PLANTS: <SeedIcon />,
  OTHER: <OtherIcon />,
  LAND: <LandIcon />,
  MISCELLANEOUS: <MiscellaneousIcon />,
  UTILITIES: <UtilitiesIcon />,
  LABOUR: <LabourIcon />,
  INFRASTRUCTURE: <InfrastructureIcon />,
  TRANSPORTATION: <TransportationIcon />,
  SERVICES: <ServicesIcon />,
};

const icons = { ...revenueTypeIcons, ...expenseTypeIcons };

export default function TransactionItem({ iconKey, transaction, type, amount, currencySymbol }) {
  return (
    <div className={styles.mainContent}>
      <div className={styles.mainContentLeft}>
        <div>{icons[iconKey]}</div>
        <div>
          <div className={styles.mainContentTitle}>{transaction}</div>
          <div className={styles.mainContentInfo}>{type}</div>
        </div>
      </div>
      <div className={commonStyles[+amount < 0 ? 'negativeValue' : 'positiveValue']}>
        {formatAmount(amount, currencySymbol)}
      </div>
    </div>
  );
}
