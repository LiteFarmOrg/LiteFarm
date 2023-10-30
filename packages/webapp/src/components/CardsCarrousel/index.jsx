import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TextButton from '../Form/Button/TextButton';
import styles from './styles.module.scss';

const CardsCarrousel = ({ cards }) => {
  const [activeCardId, setActiveCardId] = useState(cards[0]?.id);
  const [sortedCards, setSortedCards] = useState(cards);

  useEffect(() => {
    setSortedCards(cards);
  }, [cards]);

  const onCardClick = (selectedCard) => {
    setSortedCards([selectedCard, ...sortedCards.filter((card) => card.id !== selectedCard.id)]);
    setActiveCardId(selectedCard.id);
  };

  return (
    <div className={styles.carrouselContainer}>
      {sortedCards.map((card, index) => {
        const isActive = activeCardId === card.id;
        return (
          <TextButton
            key={card.id}
            disabled={isActive}
            onClick={() => onCardClick(card)}
            className={clsx([styles.card, isActive ? styles.activeCard : styles.inactiveCard])}
            style={{
              marginTop: index * 8,
              marginBottom: index * 8,
              backgroundColor: card.inactiveBackgroundColor,
              zIndex: sortedCards.length - index,
            }}
          >
            {!isActive && <div className={styles.inactiveIcon}>{card.inactiveIcon}</div>}
            {isActive && card.activeContent}
          </TextButton>
        );
      })}
    </div>
  );
};

CardsCarrousel.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      inactiveBackgroundColor: PropTypes.string,
      inactiveIcon: PropTypes.node,
      activeContent: PropTypes.node,
    }),
  ).isRequired,
};

export default CardsCarrousel;
