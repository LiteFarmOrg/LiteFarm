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

import {
  useGetAnimalsQuery,
  useGetAnimalBatchesQuery,
  useGetAnimalGroupsQuery,
} from '../../../store/api/apiSlice';
import Layout from '../../../components/Layout';
import { Title } from '../../../components/Typography';
import ActionMenu from '../../../components/ActionMenu';
import styles from './styles.module.scss';

// TODO: LF-4087
const iconActions = [
  { label: 'a', icon: null, onClick: () => ({}) },
  { label: 'b', icon: null, onClick: () => ({}) },
  { label: 'c', icon: null, onClick: () => ({}) },
  { label: 'd', icon: null, onClick: () => ({}) },
];

interface AnimalInventoryProps {
  isCompactSideMenu: boolean;
}

function AnimalInventory({ isCompactSideMenu }: AnimalInventoryProps) {
  const { data: animals } = useGetAnimalsQuery();
  const { data: animalBatches } = useGetAnimalBatchesQuery();
  const { data: animalGroups } = useGetAnimalGroupsQuery();

  return (
    <Layout>
      <Title>Animals</Title>
      {animals &&
        animals.map((animal, index) => <pre key={index}>{JSON.stringify(animal, null, 2)}</pre>)}
      <Title>Animal Batches</Title>
      {animalBatches &&
        animalBatches.map((batch, index) => (
          <pre key={index}>{JSON.stringify(batch, null, 2)}</pre>
        ))}
      <Title>Animal Groups</Title>
      {animalGroups &&
        animalGroups.map((group, index) => <pre key={index}>{JSON.stringify(group, null, 2)}</pre>)}
      <ActionMenu
        headerLeftText={''}
        textActions={[]}
        iconActions={iconActions}
        classes={{
          wrapper: isCompactSideMenu ? styles.withCompactSideMenu : styles.withExpandedSideMenu,
        }}
      />
    </Layout>
  );
}

export default AnimalInventory;
