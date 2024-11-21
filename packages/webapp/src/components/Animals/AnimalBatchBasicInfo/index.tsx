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

import styles from './styles.module.scss';
import { AnimalOrBatchKeys } from '../../../containers/Animals/types';
import { CommonDetailsProps } from '../../../containers/Animals/AddAnimals/types';
import GeneralDetails, {
  GeneralDetailsProps,
} from '../../../components/Animals/DetailCards/General';
import UniqueDetails, { UniqueDetailsProps } from '../../../components/Animals/DetailCards/Unique';
import Origin, { OriginProps } from '../../../components/Animals/DetailCards/Origin';
import OtherDetails, { OtherDetailsProps } from '../../../components/Animals/DetailCards/Other';

interface AnimalBatchBasicInfoProps {
  isAnimal: boolean;
  generalDetailProps: GeneralDetailsProps;
  uniqueDetailsProps: UniqueDetailsProps;
  otherDetailsProps: OtherDetailsProps;
  originProps: OriginProps;
}

const AnimalBatchBasicInfo = ({
  isAnimal,
  generalDetailProps,
  uniqueDetailsProps,
  otherDetailsProps,
  originProps,
}: AnimalBatchBasicInfoProps) => {
  return (
    <div className={styles.container}>
      <GeneralDetails
        {...generalDetailProps}
        animalOrBatch={isAnimal ? AnimalOrBatchKeys.ANIMAL : AnimalOrBatchKeys.BATCH}
      />
      {isAnimal && <UniqueDetails {...uniqueDetailsProps} />}
      <OtherDetails
        {...otherDetailsProps}
        animalOrBatch={isAnimal ? AnimalOrBatchKeys.ANIMAL : AnimalOrBatchKeys.BATCH}
      />
      <Origin {...originProps} />
    </div>
  );
};

export default AnimalBatchBasicInfo;
