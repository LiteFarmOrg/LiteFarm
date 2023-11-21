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
import styles from './styles.module.scss';
import { Main, Info } from '../../../../components/Typography';
import RadioGroup from '../../../../components/Form/RadioGroup';
import { useTranslation } from 'react-i18next';
import { CROP_GENERATED } from '../constants';
import PropTypes from 'prop-types';

/**
 * Radio groups for setting and viewing the custom revenue type properties
 *
 * @param {Object} control - control object from React Hook Form
 * @param {function} watch - watch method from React Hook Form
 * @param {string} view - The view mode ('read-only', 'add' or 'edit')
 * @returns {JSX.Element}
 */

function CustomRevenueRadios({ control, watch, view }) {
  const { t } = useTranslation();

  const CANNOT_CHANGE_WARNING = {
    add: 'REVENUE.ADD_REVENUE.CANNOT_BE_CHANGED_LATER',
    edit: 'REVENUE.ADD_REVENUE.CANNOT_BE_CHANGED',
  };

  return (
    <>
      <Main className={styles.cropGeneratedQuestion}>
        {t('REVENUE.ADD_REVENUE.CROP_GENERATED')}
      </Main>
      <RadioGroup
        hookFormControl={control}
        name={CROP_GENERATED}
        radios={[
          {
            label: t('common:YES'),
            value: true,
          },
          { label: t('common:NO'), value: false },
        ]}
        required={true}
        disabled={view === 'edit' || view === 'read-only'}
      />
      {(view === 'add' || view === 'edit') && <Info>{t(CANNOT_CHANGE_WARNING[view])}</Info>}
    </>
  );
}

CustomRevenueRadios.propTypes = {
  control: PropTypes.object.isRequired,
  watch: PropTypes.func.isRequired,
  view: PropTypes.oneOf(['add', 'edit', 'read-only']).isRequired,
};

export default CustomRevenueRadios;
