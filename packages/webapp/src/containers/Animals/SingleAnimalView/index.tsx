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
import { History } from 'history';
import styles from './styles.module.scss';
import { MultiStepForm, VARIANT } from '../../../components/Form/MultiStepForm';
// TODO: LF-4382 Tabs component That ticket includes the decision on whether to create a RouterTab (route change) or StateTab (component state) variant. StateTab has been chosen for the placeholder
import StateTab from '../../../components/RouterTab/StateTab';
import AnimalReadonlyEdit from './AnimalReadonlyEdit';
import AnimalTasks from './AnimalTasks';
import Button from '../../../components/Form/Button';
import { createEditAnimalUrl, createReadonlyAnimalUrl } from '../../../util/siteMapConstants';

export const STEPS = {
  DETAILS: 'details',
} as const;

enum TABS {
  DETAILS = 'DETAILS',
  TASKS = 'TASKS',
}

interface AddAnimalsProps {
  isCompactSideMenu: boolean;
  history: History;
  match: any; // not sure what this type is
}

function SingleAnimalView({ isCompactSideMenu, history, match }: AddAnimalsProps) {
  const { t } = useTranslation(['translation', 'common', 'message']);

  const [isEditing, setIsEditing] = useState(match.path.endsWith('/edit'));

  useEffect(() => {
    setIsEditing(match.path.endsWith('/edit'));
  }, [match.path]);

  const toggleEdit = () => {
    if (isEditing) {
      history.push(createReadonlyAnimalUrl(match.params.id));
    } else {
      history.push(createEditAnimalUrl(match.params.id));
    }
  };

  const [activeTab, setActiveTab] = useState<string>(TABS.DETAILS);

  const onSave = async (data: any, onGoForward: () => void) => {
    console.log(data);
  };

  const getFormSteps = () => [
    {
      FormContent: AnimalReadonlyEdit,
      title: t('ADD_ANIMAL.ANIMAL_DETAILS'),
    },
  ];

  const defaultFormValues = {
    [STEPS.DETAILS]: [],
  };

  // Overwrite the onCancel defined in MultiStepForm
  const onCancel = () => {
    history.push(createReadonlyAnimalUrl(match.params.id));
  };

  return (
    <div className={styles.container}>
      <div>
        {/* TODO: LF-4381 Header component */}
        <h1>LF-4381 Header component</h1>
        <Button color={'secondary-cta'} onClick={toggleEdit}>
          Toggle Edit
        </Button>
      </div>
      {/* TODO: LF-4382 Tabs component */}
      <div>
        <h2>LF-4382 Tabs component</h2>
        <StateTab
          state={activeTab}
          setState={setActiveTab}
          tabs={[
            {
              label: t('ANIMAL.TABS.DETAILS'),
              key: TABS.DETAILS,
            },
            {
              label: t('ANIMAL.TABS.TASKS'),
              key: TABS.TASKS,
            },
          ]}
        />
      </div>
      {activeTab === TABS.DETAILS && (
        <MultiStepForm
          onSave={onSave}
          hasSummaryWithinForm={false}
          isCompactSideMenu={isCompactSideMenu}
          variant={VARIANT.READONLY_EDIT}
          history={history}
          getSteps={getFormSteps}
          defaultFormValues={defaultFormValues}
          cancelModalTitle={t('ANIMALS.EDIT_ANIMAL_FLOW')}
          isEditing={isEditing}
          onCancel={onCancel}
          key={isEditing ? 'edit' : 'readonly'}
        />
      )}
      {/* TODO: Has not yet been scoped. Revisit after movement */}
      {activeTab === TABS.TASKS && <AnimalTasks />}
    </div>
  );
}

export default SingleAnimalView;
