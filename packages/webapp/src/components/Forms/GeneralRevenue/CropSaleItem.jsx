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

import CropVarietySaleTile from '../../CropTile/CropVarietySaleTile';
import SaleLineItem from './SaleLineItem';
import styles from './styles.module.scss';
import PropTypes from 'prop-types';

function CropSaleItem({
  cropVariety,
  entityId,
  system,
  currency,
  fieldPrefix,
  entityIdFieldKey,
  disabledInput,
}) {
  return (
    <div className={styles.saleItemContainer}>
      <CropVarietySaleTile cropVariety={cropVariety} />
      <div className={styles.saleItemInputGroup}>
        <SaleLineItem
          fieldPrefix={fieldPrefix}
          entityId={entityId}
          entityIdFieldKey={entityIdFieldKey}
          system={system}
          currency={currency}
          disabledInput={disabledInput}
        />
      </div>
    </div>
  );
}

CropSaleItem.propTypes = {
  cropVariety: PropTypes.shape({
    crop_variety_name: PropTypes.string.isRequired,
    crop_translation_key: PropTypes.string.isRequired,
    crop_variety_photo_url: PropTypes.string.isRequired,
  }).isRequired,
  entityId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  system: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  fieldPrefix: PropTypes.string.isRequired,
  entityIdFieldKey: PropTypes.string.isRequired,
  disabledInput: PropTypes.bool.isRequired,
};

export default CropSaleItem;
