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
import { useForm } from 'react-hook-form';
import { PropTypes } from 'prop-types';
import { AddLink } from '../../Typography';
import PageTitle from '../../PageTitle/v2';
import Tiles from '../../Tile/Tiles';
import IconLabelTile from '../../Tile/IconLabelTile';
import { tileTypes } from '../../Tile/constants';

export default function ManageCustomTypes({
  title,
  handleGoBack,
  addLinkText,
  onAddType,
  tileData,
  formatTileData,
  customTypeFieldName,
  persistedFormData,
  useHookFormPersist,
  getIsSelected,
  onTileClick,
}) {
  const { getValues, setValue, register, watch } = useForm({
    defaultValues: persistedFormData,
    mode: 'onChange',
  });

  useHookFormPersist(getValues);
  register(customTypeFieldName);
  const selectedTileId = watch(customTypeFieldName);

  return (
    <div style={{ padding: '24px' }}>
      <PageTitle style={{ marginBottom: '24px' }} title={title} onGoBack={handleGoBack} />
      <AddLink style={{ paddingBottom: '24px' }} onClick={onAddType}>
        {addLinkText}
      </AddLink>
      <Tiles tileType={tileTypes.ICON_LABEL} tileData={tileData} formatTileData={formatTileData}>
        {tileData.map((data) => {
          const tileProps = formatTileData(data);
          const { tileKey } = tileProps;
          const selected = getIsSelected ? getIsSelected(tileKey) : selectedTileId === tileKey;

          return (
            <IconLabelTile
              {...tileProps}
              key={tileKey}
              selected={selected}
              onClick={() => {
                // pass id so the next page knows which custom type is being edited
                setValue(customTypeFieldName, tileKey);
                onTileClick(tileKey);
              }}
            />
          );
        })}
      </Tiles>
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
  customTypeFieldName: PropTypes.string,
  persistedFormData: PropTypes.object,
  useHookFormPersist: PropTypes.func,
  getIsSelected: PropTypes.func,
  onTileClick: PropTypes.func,
};
