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

/**
 * A search bar component that display backdrop when on medium and small screens for a more immersive search experience.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {string | null | undefined} props.value - The current value of the search bar.
 * @param {Function} props.onChange - The callback function to handle changes in the search bar value.
 * @param {string} props.placeholderText - The placeholder text to be displayed in the search bar.
 * @param {string} props.className - Additional CSS classes for styling purposes.
 * @param {boolean} props.isDesktop - Flag indicating if the component is being used in a desktop environment.
 * @param {number} props.zIndexBase - The base z-index value for positioning the search bar and backdrop.
 * @returns {JSX.Element} Returns the PureSearchBarWithBackdrop component.
 *
 * @example
 * // Example usage of PureSearchBarWithBackdrop
 * <PureSearchBarWithBackdrop
 *   value={searchValue}
 *   onChange={handleSearchChange}
 *   placeholderText="Search..."
 *   className="custom-search-bar"
 *   isDesktop={true}
 *   zIndexBase={theme.zIndex.drawer}
 * />
 */
export default function PureSearchBarWithBackdrop({
  value,
  onChange,
  placeholderText,
  className,
  isDesktop,
  zIndexBase,
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
      <Input
        className={clsx(styles.searchInput, isDesktop && styles.searchInputDesktop, className)}
        isSearchBar
        value={value}
        onChange={onChange}
        placeholder={placeholderText}
        onFocus={onSearchOpen}
        style={{ zIndex: searchOverlayOpen ? zIndexBase + 2 : undefined }}
      />
      <Backdrop
        open={!isDesktop && searchOverlayOpen}
        onClick={onSearchClose}
        sx={{ color: '#fff', zIndex: zIndexBase + 1 }}
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
  isDesktop: false,
  zIndexBase: 1201,
};
