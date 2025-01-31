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

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import styles from './styles.module.scss';
import { ContextForm, Variant } from '../../../components/Form/ContextForm/';
import { enqueueErrorSnackbar, enqueueSuccessSnackbar } from '../../Snackbar/snackbarSlice';
import AnimalReadonlyEdit from './AnimalReadonlyEdit';
import Tab, { Variant as TabVariants } from '../../../components/RouterTab/Tab';
import AnimalSingleViewHeader from '../../../components/Animals/AnimalSingleViewHeader';
import FixedHeaderContainer from '../../../components/Animals/FixedHeaderContainer';
import { addNullstoMissingFields } from './utils';
import { useInitialAnimalData } from './useInitialAnimalData';
import {
  useGetAnimalOriginsQuery,
  useUpdateAnimalsMutation,
  useUpdateAnimalBatchesMutation,
  useGetCustomAnimalBreedsQuery,
  useGetCustomAnimalTypesQuery,
  useGetDefaultAnimalBreedsQuery,
  useGetDefaultAnimalTypesQuery,
} from '../../../store/api/apiSlice';
import { locationsSelector } from '../../locationSlice';
import {
  formatAnimalDetailsToDBStructure,
  formatBatchDetailsToDBStructure,
} from '../AddAnimals/utils';
import { Animal, AnimalBatch } from '../../../store/api/types';
import { AnimalOrBatchKeys } from '../types';
import { AnimalDetailsFormFields } from '../AddAnimals/types';
import RemoveAnimalsModal, { FormFields } from '../../../components/Animals/RemoveAnimalsModal';
import useAnimalOrBatchRemoval from '../Inventory/useAnimalOrBatchRemoval';
import { generateInventoryId } from '../../../util/animal';
import { CustomRouteComponentProps, Location } from '../../../types';
import { isAdminSelector } from '../../userFarmSlice';

export const STEPS = {
  DETAILS: 'details',
} as const;

interface RouteParams {
  id: string;
}

interface AddAnimalsProps extends CustomRouteComponentProps<RouteParams> {
  isCompactSideMenu: boolean;
}

function SingleAnimalView({ isCompactSideMenu, history, match, location }: AddAnimalsProps) {
  const { t } = useTranslation(['translation', 'common', 'message']);

  // Header logic + display
  const { data: customAnimalTypes = [] } = useGetCustomAnimalTypesQuery();
  const { data: customAnimalBreeds = [] } = useGetCustomAnimalBreedsQuery();
  const { data: defaultAnimalTypes = [] } = useGetDefaultAnimalTypesQuery();
  const { data: defaultAnimalBreeds = [] } = useGetDefaultAnimalBreedsQuery();

  const [isEditing, setIsEditing] = useState(false);

  const isAdmin = useSelector(isAdminSelector);

  const initiateEdit = () => {
    setIsEditing(true);
  };

  /* Temporarily removed for Animals v1 release */
  // const routerTabs = [
  //   {
  //     label: t('ANIMAL.TABS.BASIC_INFO'),
  //     path: match.url,
  //   },
  //   {
  //     label: t('ANIMAL.TABS.TASKS'),
  //     path: `${match.url}/tasks`,
  //   },
  // ];

  // Form setup
  const dispatch = useDispatch();
  const locations: Location[] = useSelector(locationsSelector);

  const getFormSteps = () => [
    {
      FormContent: AnimalReadonlyEdit,
      title: t('ADD_ANIMAL.ANIMAL_DETAILS'),
    },
  ];

  const { defaultFormValues, selectedAnimal, selectedBatch, isFetchingAnimalsOrBatches } =
    useInitialAnimalData({
      history,
      match,
      location,
    });

  const isRemoved = !!defaultFormValues?.animal_removal_reason_id;
  const locationText = locations?.find(
    ({ location_id }) => location_id === defaultFormValues?.location_id,
  )?.name;

  useEffect(() => {
    if (!isFetchingAnimalsOrBatches && !selectedAnimal && !selectedBatch) {
      history.replace('/unknown_record');
    }
  }, [selectedAnimal, selectedBatch, history]);

  // Form submission
  const [updateAnimals] = useUpdateAnimalsMutation();
  const [updateBatches] = useUpdateAnimalBatchesMutation();

  const { data: orgins = [] } = useGetAnimalOriginsQuery();

  const onSave = async (
    data: AnimalDetailsFormFields & Partial<Animal | AnimalBatch>,
    onSuccess: () => void,
    _setFormResultData: () => void,
  ) => {
    const broughtInId = orgins.find((origin) => origin.key === 'BROUGHT_IN')?.id;

    const formattedAnimals: Partial<Animal>[] = [];
    const formattedBatches: Partial<AnimalBatch>[] = [];

    if (data.animal_or_batch === AnimalOrBatchKeys.ANIMAL) {
      const formattedAnimal = formatAnimalDetailsToDBStructure(data, broughtInId);
      const animalWithNullFields = addNullstoMissingFields(formattedAnimal, selectedAnimal!);

      formattedAnimals.push({
        ...animalWithNullFields,
        id: data.id,
      });
    } else {
      const formattedBatch = formatBatchDetailsToDBStructure(data, broughtInId);
      const batchWithNullFields = addNullstoMissingFields(formattedBatch, selectedBatch!);

      formattedBatches.push({
        ...batchWithNullFields,
        id: data.id,
      });
    }

    try {
      if (formattedAnimals.length) {
        await updateAnimals(formattedAnimals).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_UPDATE_ANIMAL')));
        onSuccess();
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_UPDATE_ANIMAL')));
    }
    try {
      if (formattedBatches.length) {
        await updateBatches(formattedBatches).unwrap();
        dispatch(enqueueSuccessSnackbar(t('message:ANIMALS.SUCCESS_UPDATE_BATCH')));
        onSuccess();
      }
    } catch (e) {
      console.error(e);
      dispatch(enqueueErrorSnackbar(t('message:ANIMALS.FAILED_UPDATE_BATCH')));
    }
  };

  const getInventoryId = () => {
    if (!selectedAnimal && !selectedBatch) {
      return '';
    }

    const animalOrBatch = AnimalOrBatchKeys[selectedAnimal ? 'ANIMAL' : 'BATCH'];
    return generateInventoryId(animalOrBatch, (selectedAnimal || selectedBatch)!);
  };

  const { onConfirmRemoveAnimals, removalModalOpen, setRemovalModalOpen, hasFinalizedTasks } =
    useAnimalOrBatchRemoval(
      [getInventoryId()],
      [{ ...(selectedAnimal || selectedBatch)!, id: getInventoryId() }],
    );

  const onConfirmRemoval = async (formData: FormFields) => {
    const result = await onConfirmRemoveAnimals(formData);

    if (!result.error) {
      history.back();
    }
  };

  return (
    <div className={styles.container}>
      <FixedHeaderContainer
        classes={{ divWrapper: styles.contentWrapper }}
        header={
          <>
            {defaultFormValues && (
              <AnimalSingleViewHeader
                showMenu={isAdmin && !isRemoved}
                onEdit={initiateEdit}
                onRemove={() => setRemovalModalOpen(true)}
                isEditing={isEditing}
                onBack={history.back}
                /* @ts-ignore */
                animalOrBatch={defaultFormValues}
                locationText={locationText}
                defaultBreeds={defaultAnimalBreeds}
                defaultTypes={defaultAnimalTypes}
                customBreeds={customAnimalBreeds}
                customTypes={customAnimalTypes}
              />
            )}
            {/* <Tab
              tabs={routerTabs}
              variant={TabVariants.UNDERLINE}
              isSelected={(tab) => tab.path === match.url}
              onClick={(tab) => history.push(tab.path)}
            /> */}
          </>
        }
      >
        {defaultFormValues && (
          <ContextForm
            onSave={onSave}
            hasSummaryWithinForm={false}
            isCompactSideMenu={isCompactSideMenu}
            variant={Variant.STEPPER_PROGRESS_BAR}
            history={history}
            getSteps={getFormSteps}
            defaultFormValues={defaultFormValues}
            cancelModalTitle={t('ANIMAL.EDIT_ANIMAL_FLOW')}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        )}
        <RemoveAnimalsModal
          isOpen={removalModalOpen}
          onClose={() => setRemovalModalOpen(false)}
          onConfirm={onConfirmRemoval}
          showSuccessMessage={false}
          hideDeleteOption={hasFinalizedTasks}
        />
      </FixedHeaderContainer>
    </div>
  );
}

export default SingleAnimalView;
