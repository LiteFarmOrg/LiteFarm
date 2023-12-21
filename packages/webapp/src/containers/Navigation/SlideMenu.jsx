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

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import PureSlideMenu from '../../components/Navigation/SlideMenu';
import { isAdminSelector } from '../userFarmSlice';
import useIsFarmSelected from '../../hooks/useIsFarmSelected';

function SlideMenu(props) {
  const isFarmSelected = useIsFarmSelected();

  // should not be displayed during the login flow
  return isFarmSelected && <PureSlideMenu {...props} />;
}

export default SlideMenu;

SlideMenu.propTypes = {
  history: PropTypes.object,
  closeDrawer: PropTypes.func,
  classes: PropTypes.shape({
    container: PropTypes.string,
  }),
};
