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
import { ContextForm, VARIANT } from '../../../components/Form/ContextForm/';
// TODO: LF-4382 Tabs component That ticket includes the decision on whether to create a RouterTab (route change) or StateTab (component state) variant. However RouterTab should be used in the implementation to trigger the destructive action pop-up modal -- StateTab is just the placeholder
import StateTab from '../../../components/RouterTab/StateTab';
import AnimalReadonlyEdit from './AnimalReadonlyEdit';
import AnimalTasks from './AnimalTasks';
import Button from '../../../components/Form/Button';

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
}

function SingleAnimalView({ isCompactSideMenu, history }: AddAnimalsProps) {
  const { t } = useTranslation(['translation', 'common', 'message']);

  const [isEditing, setIsEditing] = useState(false);
  const [checkIsFormDirty, setCheckIsFormDirty] = useState(false);

  // For now, assuming that the only way to exit edit will be through the cancel button and not through the header
  const initiateEdit = () => {
    setIsEditing(true);
  };

  const [activeTab, setActiveTab] = useState<string>(TABS.DETAILS);

  const onSave = async (data: any, onGoForward: () => void) => {
    console.log(data);
    setIsEditing(false);
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

  // Override the onCancel in ContextForm because we don't want to navigate away
  const onCancel = () => {
    setCheckIsFormDirty(true);
  };

  return (
    <div className={styles.container}>
      <div>
        {/* TODO: LF-4381 Header component */}
        <h1>LF-4381 Header component</h1>
        {isEditing ? (
          <Button color={'primary'} disabled>
            ...Editing
          </Button>
        ) : (
          <Button color={'secondary-cta'} onClick={initiateEdit}>
            Toggle Edit
          </Button>
        )}
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
        <ContextForm
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
          setIsEditing={setIsEditing}
          checkIsFormDirty={checkIsFormDirty}
          setCheckIsFormDirty={setCheckIsFormDirty}
          key={isEditing ? 'edit' : 'readonly'}
        />
      )}
      {/* TODO: Has not yet been scoped. Revisit after movement */}
      {activeTab === TABS.TASKS && <AnimalTasks />}
    </div>
  );
}

export default SingleAnimalView;
