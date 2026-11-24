/*
 *  Copyright 2026 LiteFarm.org
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

import PropTypes from 'prop-types';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.scss';

export default function SoilLayerControl({
  layers,
  selectedId,
  opacity,
  onSelect,
  onOpacityChange,
  className,
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  if (!layers.length) return null;

  return (
    <div className={`${styles.control} ${className ?? ''}`} data-cy="soil-layer-control">
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="soil-layer-panel"
        onClick={() => setOpen(!open)}
      >
        {t('FARM_MAP.SOIL_LAYERS.TITLE')}
      </button>
      {open && (
        <div id="soil-layer-panel" className={styles.panel}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{t('FARM_MAP.SOIL_LAYERS.TITLE')}</legend>
            <label className={styles.option}>
              <input
                type="radio"
                name="soil-layer"
                checked={!selectedId}
                onChange={() => onSelect(null)}
              />
              {t('FARM_MAP.SOIL_LAYERS.NONE')}
            </label>
            {layers.map((layer) => (
              <label key={layer.id} className={styles.option}>
                <input
                  type="radio"
                  name="soil-layer"
                  checked={selectedId === layer.id}
                  onChange={() => onSelect(layer.id)}
                />
                {t(`FARM_MAP.SOIL_LAYERS.${layer.labelKey}`)}
              </label>
            ))}
          </fieldset>
          <label className={styles.opacity}>
            {t('FARM_MAP.SOIL_LAYERS.OPACITY')}
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opacity}
              disabled={!selectedId}
              onChange={(e) => onOpacityChange(Number(e.target.value))}
            />
          </label>
          {selectedId && <p className={styles.note}>{t('FARM_MAP.SOIL_LAYERS.NOTE')}</p>}
        </div>
      )}
    </div>
  );
}

SoilLayerControl.propTypes = {
  layers: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string.isRequired, labelKey: PropTypes.string.isRequired }),
  ).isRequired,
  selectedId: PropTypes.string,
  opacity: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  onOpacityChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};
