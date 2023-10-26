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
import { PropTypes } from 'prop-types';
import { AddLink } from '../../Typography';
import PageTitle from '../../PageTitle/v2';
import List from '../../List';
import { listItemTypes } from '../../List/constants';

export default function ManageCustomTypes({
  title,
  handleGoBack,
  addLinkText,
  onAddType,
  tileData,
  formatTileData,
}) {
  return (
    <div style={{ padding: '24px' }}>
      <PageTitle style={{ marginBottom: '24px' }} title={title} onGoBack={handleGoBack} />
      <AddLink style={{ paddingBottom: '24px' }} onClick={onAddType}>
        {addLinkText}
      </AddLink>
      <List
        listItemType={listItemTypes.ICON_DESCRIPTION_CHEVRON}
        listItemData={tileData}
        formatListItemData={formatTileData}
      />
    </div>
  );
}

ManageCustomTypes.propTypes = {
  title: PropTypes.string,
  handleGoBack: PropTypes.func,
  addLinkText: PropTypes.string,
  onAddType: PropTypes.func,
  tileData: PropTypes.array,
  formatTileData: PropTypes.func,
  onTileClick: PropTypes.func,
};
