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
 *  GNU General Public License for more details, see <https://www.gnu.org/licenses/>.
 */

import { ReactComponent as AlpacaIcon } from '../../assets/images/animals/alpaca-icon.svg';
import { ReactComponent as CattleIcon } from '../../assets/images/animals/cattle-icon.svg';
import { ReactComponent as ChickenIcon } from '../../assets/images/animals/chicken-icon.svg';
import { ReactComponent as GoatIcon } from '../../assets/images/animals/goat-icon.svg';
import { ReactComponent as PigIcon } from '../../assets/images/animals/pig-icon.svg';
import { ReactComponent as RabbitIcon } from '../../assets/images/animals/rabbit-icon.svg';
import { ReactComponent as SheepIcon } from '../../assets/images/animals/sheep-icon.svg';

export const mockTiles = [
  {
    label: 'Goat',
    icon: <GoatIcon />,
    count: 6,
  },
  {
    label: 'Cow',
    icon: <CattleIcon />,
    count: 20,
  },
  {
    label: 'Chicken',
    icon: <ChickenIcon />,
    count: 40,
  },
  {
    label: 'Pig',
    icon: <PigIcon />,
    count: 20,
  },
  {
    label: 'Cockatoo',
    icon: <ChickenIcon />,
    count: 2,
  },
  {
    label: 'Dog',
    icon: <CattleIcon />,
    count: 3,
  },
  {
    label: 'Rabbit',
    icon: <RabbitIcon />,
    count: 24,
  },
  {
    label: 'Hamster',
    icon: <RabbitIcon />,
    count: 1,
  },
  {
    label: 'Guinea Pig',
    icon: <RabbitIcon />,
    count: 20,
  },
  {
    label: 'Draft Horse',
    icon: <SheepIcon />,
    count: 1,
  },
  {
    label: 'Barn Cat',
    icon: <CattleIcon />,
    count: 3,
  },
  {
    label: 'Tasmanian Devil',
    icon: <CattleIcon />,
    count: 3,
  },
  {
    label: 'Alpaca',
    icon: <AlpacaIcon />,
    count: 3,
  },
  {
    label: 'Sheep',
    icon: <SheepIcon />,
    count: 3,
  },
];
