/*
 *  Copyright 2025 LiteFarm.org
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
import clsx from 'clsx';
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import { ReactComponent as AddLogo } from '../../../assets/images/map/addSkew.svg';
import { ReactComponent as FilterLogo } from '../../../assets/images/map/filter-funnel.svg';
import { ReactComponent as ExportLogo } from '../../../assets/images/map/download.svg';

export interface MapNavigationButtonsProps {
  isAdmin?: boolean;
  showAddDrawer?: boolean;
  showMapFilter?: boolean;
  showModal?: boolean;
  isMapFilterSettingActive?: boolean;
  onClickAdd: () => void;
  handleClickFilter: () => void;
  onClickExport?: () => void;
}

const MapNavigationButtons = ({
  isAdmin,
  showAddDrawer,
  showMapFilter,
  showModal,
  onClickAdd,
  handleClickFilter,
  onClickExport,
  isMapFilterSettingActive,
}: MapNavigationButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      {isAdmin && (
        <Button
          color="location-menu"
          data-cy="map-addFeature"
          className={clsx(styles.button, showAddDrawer && styles.selected)}
          id="mapFirstStep"
          onClick={onClickAdd}
          sm
        >
          <span className={styles.buttonText}>
            <AddLogo className={styles.svg} />
            <span className={styles.label}>{t('FARM_MAP.ADD_LOCATION')}</span>
          </span>
        </Button>
      )}
      <Button
        color="location-menu"
        className={clsx(styles.button, showMapFilter && styles.selected)}
        id="mapSecondStep"
        onClick={handleClickFilter}
        sm
      >
        <span className={styles.buttonText}>
          {isMapFilterSettingActive && <span className={styles.circle} />}
          <FilterLogo
            className={clsx(!isMapFilterSettingActive && styles.filterLogo, styles.svg)}
          />
          <span className={styles.label}>{t('FARM_MAP.FILTER_MAP')}</span>
        </span>
      </Button>
      <Button
        color="location-menu"
        className={clsx(styles.button, showModal && styles.selected)}
        id="mapThirdStep"
        onClick={onClickExport}
        sm
      >
        <span className={styles.buttonText}>
          <ExportLogo className={styles.svg} />
          <span className={styles.label}>{t('FARM_MAP.EXPORT_MAP')}</span>
        </span>
      </Button>
    </div>
  );
};

export default MapNavigationButtons;
