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

import { useController } from 'react-hook-form';
import { Info, Main } from '../../../../components/Typography';
import EntityAssociationToggle from '../../../../components/Form/EntityAssociationToggle';
import { useTranslation } from 'react-i18next';
import { ENTITY_TYPE } from '../constants';
import PropTypes from 'prop-types';

function CustomRevenueRadios({ control, view }) {
  const { t } = useTranslation();
  const { field } = useController({ control, name: ENTITY_TYPE });

  const CANNOT_CHANGE_WARNING = {
    add: 'REVENUE.ADD_REVENUE.CANNOT_BE_CHANGED_LATER',
    edit: 'REVENUE.ADD_REVENUE.CANNOT_BE_CHANGED',
  };

  return (
    <>
      <EntityAssociationToggle
        value={field.value}
        onChange={field.onChange}
        isDisabled={view === 'edit' || view === 'read-only'}
        label={t('REVENUE.ADD_REVENUE.ENTITY_ASSOCIATION_LABEL')}
        optional
      />
      {(view === 'add' || view === 'edit') && <Info>{t(CANNOT_CHANGE_WARNING[view])}</Info>}
      {view === 'read-only' && !field.value && (
        <Main>{t('REVENUE.ENTITY_ASSOCIATION.NOT_ASSOCIATED')}</Main>
      )}
    </>
  );
}

CustomRevenueRadios.propTypes = {
  control: PropTypes.object.isRequired,
  view: PropTypes.oneOf(['add', 'edit', 'read-only']).isRequired,
};

export default CustomRevenueRadios;
