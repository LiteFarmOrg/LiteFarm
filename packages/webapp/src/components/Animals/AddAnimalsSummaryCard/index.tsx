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

import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';
import { Title, Main } from '../../Typography';
import { ReactComponent as RelaxedFarmer } from '../../../assets/images/animals/relaxed-farmer.svg';
import { ReactComponent as ChevronRight } from '../../../assets/images/buttons/chevron-right.svg';
import Button from '../../Form/Button';
import { sumObjectValues } from '../../../util';
import { IconSummary } from './IconSummary';
import { iconNames } from '../../../containers/Animals/constants';
import { AnimalSummary, BatchSummary } from './types';
import { useMediaQuery, useTheme } from '@mui/material';

interface AddAnimalsSummaryCardProps {
  onContinue: () => void;
  animalsInfo?: AnimalSummary[];
  batchInfo?: BatchSummary[];
}

export const AddAnimalsSummaryCard = ({
  animalsInfo = [],
  batchInfo = [],
  onContinue,
}: AddAnimalsSummaryCardProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const numberOfAnimals = animalsInfo.reduce((acc, animal) => {
    return acc + sumObjectValues(animal.sexDetails);
  }, 0);
  const numberOfBatches = batchInfo.length;

  return (
    <>
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          <div className={styles.textContainer}>
            <Title className={styles.title}>{t('ADD_ANIMALS.ALL_DONE')}</Title>
            <Main className={styles.mainText}>
              {t('ADD_ANIMALS.SUMMARY', {
                animalCount: numberOfAnimals
                  ? t('ADD_ANIMALS.ANIMAL_SUMMARY_COUNT', { count: numberOfAnimals })
                  : '',
                and: numberOfAnimals && numberOfBatches ? t('common:AND') : '',
                batchCount: numberOfBatches
                  ? t('ADD_ANIMALS.BATCH_SUMMARY_COUNT', { count: numberOfBatches })
                  : '',
              })}
            </Main>
            <Main className={styles.mainText}>{t('ADD_ANIMALS.HERE_IS_SUMMARY')}</Main>
          </div>
          {!isMobile && (
            <IconSummaryAndButton
              animalsInfo={animalsInfo}
              batchInfo={batchInfo}
              onContinue={onContinue}
            />
          )}
        </div>
        <div className={styles.imageContainer}>
          <RelaxedFarmer className={styles.farmer} />
        </div>
      </div>
      {isMobile && (
        <IconSummaryAndButton
          animalsInfo={animalsInfo}
          batchInfo={batchInfo}
          onContinue={onContinue}
        />
      )}
    </>
  );
};

const IconSummaryAndButton = ({
  animalsInfo,
  batchInfo,
  onContinue,
}: {
  animalsInfo: AnimalSummary[];
  batchInfo: BatchSummary[];
  onContinue: () => void;
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.iconSummaryAndButtonContainer}>
      <div className={styles.iconSummaryContainer}>
        {animalsInfo.map((animal, index) => {
          const animalIconKey =
            iconNames[animal.iconKey as keyof typeof iconNames] || iconNames[''];
          return (
            <IconSummary
              key={index}
              isBatch={false}
              sexDetails={animal.sexDetails}
              iconKey={animalIconKey}
              type={animal.type}
              breed={animal.breed}
            />
          );
        })}
        {batchInfo.map((batch, index) => (
          <IconSummary
            key={index}
            isBatch={true}
            count={batch.count}
            type={batch.type}
            breed={batch.breed}
          />
        ))}
      </div>
      <Button color="secondary-2" sm onClick={onContinue} className={styles.button}>
        {t('ADD_ANIMALS.ADD_MORE_DETAILS')}
        <ChevronRight />
      </Button>
    </div>
  );
};
