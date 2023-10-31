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

import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TextButton from '../Form/Button/TextButton';
import styles from './styles.module.scss';

const CardsCarrousel = ({ cards }) => {
  const [activeCard, setActiveCard] = useState(cards[0]);
  const [sortedCards, setSortedCards] = useState(cards);

  const sortCards = (selectedCard) => {
    return [selectedCard, ...cards.filter((card) => card.id !== selectedCard.id)];
  };

  useEffect(() => {
    const newActiveCard = cards.find((card) => card.id === activeCard.id);
    const newSortedCards = sortCards(newActiveCard);
    setActiveCard(newActiveCard);
    setSortedCards(newSortedCards);
  }, [cards]);

  const onCardClick = (selectedCard) => {
    setActiveCard(selectedCard);
    setSortedCards(sortCards(selectedCard));
  };

  return (
    <div>
      <div className={styles.carrouselContainer}>
        {sortedCards.map((card, index) => {
          const isActive = activeCard.id === card.id;
          return isActive ? (
            <div
              key={card.id}
              className={clsx([styles.card, styles.activeCard])}
              style={{
                marginTop: index * 8,
                marginBottom: index * 8,
                zIndex: sortedCards.length - index,
              }}
            >
              {card.activeContent}
            </div>
          ) : (
            <TextButton
              key={card.id}
              aria-label={card.label}
              onClick={() => onCardClick(card)}
              className={clsx([styles.card, styles.inactiveCard])}
              style={{
                marginTop: index * 8,
                marginBottom: index * 8,
                backgroundColor: card.inactiveBackgroundColor,
                zIndex: sortedCards.length - index,
              }}
            >
              {card.inactiveIcon}
            </TextButton>
          );
        })}
      </div>
      <p className={styles.cardNote} style={{ color: activeCard.noteColor }}>
        {activeCard.note}
      </p>
    </div>
  );
};

CardsCarrousel.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      inactiveBackgroundColor: PropTypes.string,
      inactiveIcon: PropTypes.node,
      activeContent: PropTypes.node,
      note: PropTypes.string,
      noteColor: PropTypes.string,
    }),
  ).isRequired,
};

export default CardsCarrousel;
