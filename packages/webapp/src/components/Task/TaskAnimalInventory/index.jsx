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

import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Form from '../../Form';
import { useForm } from 'react-hook-form';
import Button from '../../Form/Button';
import { Main } from '../../Typography';
import AnimalInventory, { View } from '../../../containers/Animals/Inventory';
import styles from './styles.module.scss';

export const ANIMAL_IDS = 'animalIds';

export default function PureTaskAnimalInventory({
  onContinue,
  onGoBack,
  persistedFormData,
  useHookFormPersist,
  history,
  isDesktop,
  isRequired = true,
  progress = 43,
}) {
  const { t } = useTranslation();
  const preSelectedIds = persistedFormData.animalIds || history.location?.state?.animal_ids;

  const { register, handleSubmit, getValues, watch, setValue } = useForm({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      ...persistedFormData,
      [ANIMAL_IDS]: preSelectedIds || [],
    },
  });

  const { historyCancel } = useHookFormPersist(getValues);
  const animalIds = watch(ANIMAL_IDS);
  const disabled = isRequired && !animalIds?.length;

  const onSubmit = () => {
    onContinue();
  };

  const onSelect = (selectedAnimalIds) => {
    setValue(ANIMAL_IDS, selectedAnimalIds);
  };

  return (
    <div className={styles.wrapper}>
      <Form
        buttonGroup={
          <Button
            data-cy="addTask-continue"
            type={'submit'}
            disabled={disabled}
            fullLength
            className={styles.button}
          >
            {t('common:CONTINUE')}
          </Button>
        }
        onSubmit={handleSubmit(onSubmit)}
        fullWidthContent={!isDesktop}
      >
        <MultiStepPageTitle
          style={{
            marginBottom: '24px',
            padding: !isDesktop && '24px 24px 0 24px',
            maxHeight: '65px',
          }}
          onGoBack={onGoBack}
          onCancel={historyCancel}
          title={t('MANAGEMENT_DETAIL.ADD_A_TASK')}
          value={progress}
        />
        <Main
          style={{
            marginBottom: '16px',
            padding: !isDesktop && '0 24px 0 24px',
            maxHeight: '24px',
          }}
        >
          {t('TASK.SELECT_ANIMALS')}
        </Main>
        <input type="hidden" {...register(ANIMAL_IDS)} />
        <AnimalInventory
          onSelect={onSelect}
          view={View.TASK}
          history={history}
          preSelectedIds={preSelectedIds}
          showLinks={false}
        />
      </Form>
    </div>
  );
}

PureTaskAnimalInventory.propTypes = {
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
};
