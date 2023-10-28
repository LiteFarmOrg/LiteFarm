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

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import MultiStepPageTitle from '../../PageTitle/MultiStepPageTitle';
import { Main } from '../../Typography';
import Form from '../../Form';
import Button from '../../Form/Button';
import List from '../../List';
import styles from './styles.module.scss';
import { CantFindCustomType } from './CantFindCustomType';
import useSearchFilter from '../../../containers/hooks/useSearchFilter';
import { NoSearchResults } from '../../Card/NoSearchResults';
import PureSearchbarAndFilter from '../../PopupFilter/PureSearchbarAndFilter';

const FallbackWrapper = ({ children }) => children;

export default function PureFinanceTypeSelection({
  title,
  types,
  leadText,
  cancelTitle,
  onContinue,
  onGoBack,
  onGoToManageCustomType,
  isTypeSelected,
  formatTileData,
  getFormatTileDataFunc,
  listItemType,
  progressValue,
  useHookFormPersist,
  persistedFormData = {},
  iconLinkId,
  Wrapper = FallbackWrapper,
  customTypeMessages = {},
  miscellaneousConfig,
  getSearchableString,
  searchPlaceholderText = '',
}) {
  const { t } = useTranslation();
  const { getValues, setValue } = useForm({ defaultValues: persistedFormData });
  const { historyCancel } = useHookFormPersist(getValues);

  const [filteredTypes, filter, setFilter] = useSearchFilter(types, getSearchableString);

  const onFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const hasSearchResults = filteredTypes.length !== 0;

  return (
    <Wrapper>
      <Form
        buttonGroup={
          onContinue && (
            <Button disabled={!isTypeSelected} onClick={onContinue} type={'submit'} fullLength>
              {t('common:CONTINUE')}
            </Button>
          )
        }
      >
        <MultiStepPageTitle
          onGoBack={onGoBack}
          onCancel={historyCancel}
          cancelModalTitle={cancelTitle}
          title={title}
          value={progressValue}
          style={{ marginBottom: '24px' }}
        />
        <PureSearchbarAndFilter
          className={styles.searchBar}
          value={filter}
          onChange={onFilterChange}
          disableFilter={true}
          placeholderText={searchPlaceholderText}
        />
        {hasSearchResults ? (
          <Main className={styles.leadText}>{leadText}</Main>
        ) : (
          <NoSearchResults className={styles.noResultsCard} searchTerm={filter} />
        )}
        <List
          listItemType={listItemType}
          listItemData={filteredTypes}
          formatListItemData={
            getFormatTileDataFunc ? getFormatTileDataFunc(setValue) : formatTileData
          }
        />
        <div className={styles.cantFindWrapper}>
          <CantFindCustomType
            customTypeMessages={customTypeMessages}
            miscellaneousConfig={miscellaneousConfig}
            iconLinkId={iconLinkId}
            onGoToManageCustomType={onGoToManageCustomType}
          />
        </div>
      </Form>
    </Wrapper>
  );
}

PureFinanceTypeSelection.propTypes = {
  title: PropTypes.string,
  types: PropTypes.array,
  leadText: PropTypes.string,
  cancelTitle: PropTypes.string,
  onContinue: PropTypes.func,
  onGoBack: PropTypes.func,
  onGoToManageCustomType: PropTypes.func,
  isTypeSelected: PropTypes.bool,
  formatTileData: PropTypes.func,
  /** takes setValue returned from useForm */
  getFormatTileDataFunc: PropTypes.func,
  progressValue: PropTypes.number,
  useHookFormPersist: PropTypes.func,
  persistedFormData: PropTypes.object,
  customTypeMessages: PropTypes.shape({
    info: PropTypes.string,
    manage: PropTypes.string,
  }),
  miscellaneousConfig: PropTypes.shape({
    addRemove: PropTypes.func,
    selected: PropTypes.bool,
  }),
  getSearchableString: PropTypes.func,
  searchPlaceholderText: PropTypes.string,
  /** used for spotlight */
  iconLinkId: PropTypes.string,
  Wrapper: PropTypes.func,
};
