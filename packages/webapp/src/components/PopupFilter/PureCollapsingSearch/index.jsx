/*
 *  Copyright 2023-2024 LiteFarm.org
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

import { useState, useRef, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import styles from './styles.module.scss';
import { ReactComponent as SearchIcon } from '../../../assets/images/search.svg';
import Input from '../../Form/Input';
import TextButton from '../../Form/Button/TextButton';
import { Modal } from '../../Modals';

export default function PureCollapsingSearch({
  value,
  isSearchActive,
  onChange,
  placeholderText,
  className,
  containerRef,
  isDesktop,
}) {
  const searchRef = useRef(null);
  const [modalStyle, setModalStyle] = useState({});

  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const onSearchOpen = () => setSearchOverlayOpen(true);
  const onSearchClose = () => setSearchOverlayOpen(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearchClose();
  };

  // Position modal searchbar
  useLayoutEffect(() => {
    let resizeObserver;

    const updateModalStyle = (ref) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();

        setModalStyle({
          position: 'absolute',
          top: `${rect.top}px`,
          /* If a containerRef is not provided, the position of the search button will be used to calculate the placement of the modal, and the width will be 95vw */
          left: ref === searchRef.current ? undefined : `${rect.left}px`,
          width: ref === searchRef.current ? '95vw' : `${rect.width}px`,
          margin: 0,
          maxWidth: '100vw',
        });
      }
    };

    if (searchOverlayOpen) {
      updateModalStyle(containerRef?.current || searchRef?.current);

      // If containerRef is provided, observe  it for resize events
      if (containerRef?.current) {
        resizeObserver = new ResizeObserver(() => {
          updateModalStyle(containerRef.current);
        });
        resizeObserver.observe(containerRef.current);
      }
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [searchOverlayOpen]);

  return (
    <div
      className={clsx(styles.container, className, isDesktop && styles.desktopContainer)}
      ref={searchRef}
    >
      <Input
        className={styles.searchBar}
        isSearchBar
        value={value}
        onChange={onChange}
        placeholder={placeholderText}
      />

      {searchOverlayOpen && (
        <Modal dismissModal={onSearchClose} style={modalStyle}>
          <form // allows closing modal with enter key (= submit)
            onSubmit={handleSubmit}
            className={clsx(styles.modalContent, isDesktop && styles.displayNone)}
          >
            <Input
              className={styles.modalSearchbar}
              isSearchBar
              value={value}
              onChange={onChange}
              placeholder={placeholderText}
            />
          </form>
        </Modal>
      )}

      <TextButton
        className={clsx(
          styles.searchButton,
          isSearchActive && styles.active,
          isDesktop && styles.displayNone,
        )}
        onClick={onSearchOpen}
      >
        <SearchIcon className={styles.searchIcon} />
      </TextButton>

      {isSearchActive && (
        <div className={clsx(styles.circleContainer, isDesktop && styles.displayNone)}>
          <div className={clsx(styles.circle, isDesktop && styles.displayNone)} />
        </div>
      )}
    </div>
  );
}

PureCollapsingSearch.propTypes = {
  value: PropTypes.string,
  isSearchActive: PropTypes.bool,
  onChange: PropTypes.func,
  placeholderText: PropTypes.string,
  className: PropTypes.string,
  overlayModalOnButton: PropTypes.bool,
  containerRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  isDesktop: PropTypes.bool,
};

PureCollapsingSearch.defaultProps = {
  placeholderText: '',
  isSearchActive: false,
  className: '',
  overlayModalOnButton: true,
  containerRef: null,
};
