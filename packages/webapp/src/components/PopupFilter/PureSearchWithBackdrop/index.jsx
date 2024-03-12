/*
 *  Copyright 2024 LiteFarm.org
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

import { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './styles.module.scss';
import Input from '../../Form/Input';
import { Backdrop } from '@mui/material';

export default function PureSearchBarWithBackdrop({
  value,
  onChange,
  placeholderText,
  className,
  isDesktop,
  theme,
}) {
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const onSearchOpen = () => {
    isDesktop ? null : setSearchOverlayOpen(true);
  };
  const onSearchClose = () => {
    setSearchOverlayOpen(false);
  };

  return (
    <>
      <div
        className={clsx(styles.container, className, isDesktop && styles.desktopContainer)}
        style={{ zIndex: theme.zIndex.drawer + 2 }}
      >
        <Input
          className={styles.searchBar}
          isSearchBar
          value={value}
          onChange={onChange}
          placeholder={placeholderText}
          onFocus={onSearchOpen}
        />
      </div>
      <Backdrop
        open={!isDesktop && searchOverlayOpen}
        onClick={onSearchClose}
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      />
    </>
  );
}

PureSearchBarWithBackdrop.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholderText: PropTypes.string,
  className: PropTypes.string,
  isDesktop: PropTypes.bool,
};

PureSearchBarWithBackdrop.defaultProps = {
  placeholderText: '',
  isSearchActive: false,
  className: '',
};
