import React, { Component } from 'react';
import sharedStyles from '../shared.module.scss';
import { withTranslation } from 'react-i18next';
import { Main } from '../../Typography';
import { LinearProgress } from '@material-ui/core';

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
