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

import PropTypes from 'prop-types';
import useIsFarmSelected from '../../hooks/useIsFarmSelected';
import PureSideMenu from '../../components/Navigation/SideMenu';

function SideMenu(props) {
  const isFarmSelected = useIsFarmSelected();

  // should not be displayed during the login flow
  return isFarmSelected && <PureSideMenu {...props} />;
}

export default SideMenu;

SideMenu.propTypes = {
  closeDrawer: PropTypes.func,
  classes: PropTypes.shape({
    container: PropTypes.string,
  }),
};
