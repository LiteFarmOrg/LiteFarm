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
import Button from '../../Form/Button';
import styles from './styles.module.scss';
import { ReactComponent as AddLogo } from '../../../assets/images/map/add.svg';
import { ReactComponent as FilterLogo } from '../../../assets/images/map/filter.svg';
import { ReactComponent as ExportLogo } from '../../../assets/images/map/export.svg';

export interface FormNavigationButtonsProps {
  isMapFilterSettingActive?: boolean;
  onClickAdd: () => void;
  handleClickFilter: () => void;
  onClickExport?: () => void;
}

const MapNavigationButtons = ({
  onClickAdd,
  handleClickFilter,
  onClickExport,
  isMapFilterSettingActive,
}: FormNavigationButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <Button
        color="location-menu"
        data-cy="map-addFeature"
        className={styles.button}
        id="mapFirstStep"
        onClick={onClickAdd}
        sm
      >
        <div className={styles.buttonText}>
          <AddLogo className={styles.svg} />
          <div>Add Location</div>
        </div>
      </Button>
      <Button
        color="location-menu"
        className={styles.button}
        id="mapSecondStep"
        onClick={handleClickFilter}
        sm
      >
        <div className={styles.buttonText}>
          {isMapFilterSettingActive && <div className={styles.circle} />}
          <FilterLogo className={styles.svg} />
          <div>Filter Map</div>
        </div>
      </Button>
      <Button
        color="location-menu"
        className={styles.button}
        id="mapThirdStep"
        onClick={onClickExport}
        sm
      >
        <div className={styles.buttonText}>
          <ExportLogo className={styles.svg} />
          <div>Export Map</div>
        </div>
      </Button>
    </div>
  );
};

export default MapNavigationButtons;
