/*
 *  Copyright 2019, 2020, 2021, 2022 LiteFarm.org
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

import React, { Component } from 'react';
import sharedStyles from '../shared.module.scss';
import { withTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import { LinearProgress } from '@mui/material';

class BiodiversitySpecies extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.i18nSpeciesDict = {
      Birds: props.t('INSIGHTS.BIODIVERSITY.BIRDS'),
      Insects: props.t('INSIGHTS.BIODIVERSITY.INSECTS'),
      Plants: props.t('INSIGHTS.BIODIVERSITY.PLANTS'),
      Amphibians: props.t('INSIGHTS.BIODIVERSITY.AMPHIBIANS'),
      CropVarieties: props.t('INSIGHTS.BIODIVERSITY.CROP_VARIETIES'),
      Mammals: props.t('INSIGHTS.BIODIVERSITY.MAMMALS'),
    };
  }

  render() {
    const { species, count, percent, t } = this.props;
    return (
      <div>
        <div className={sharedStyles.infoTextLine}>
          <Main>{this.i18nSpeciesDict[species]}</Main>
          <Main className={sharedStyles.rightText}>
            {t('INSIGHTS.BIODIVERSITY.SPECIES_COUNT', { count })}
          </Main>
        </div>
        <LinearProgress value={percent} variant="determinate" />
      </div>
    );
  }
}

export default withTranslation()(BiodiversitySpecies);
